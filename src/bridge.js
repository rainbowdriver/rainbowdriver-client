/*globals Windows */
var rainbowDriver = rainbowDriver || {};

(function (argument) {
    "use strict";

    var connection,
        writer,
        tryAgain = true;

    function connect() {
        var host = rainbowDriver.host || "ws://localhost:8080",
            uri = new (Windows.Foundation.Uri)(host + '/browser_connection/websocket');

        tryAgain = false;
        connection = new (Windows.Networking.Sockets.MessageWebSocket)();
        connection.control.messageType = Windows.Networking.Sockets.SocketMessageType.utf8;

        connection.onclosed = bridgeError.bind(connection, "Connection closed");
        connection.onmessagereceived = receivedMessage;

        connection.connectAsync(uri).done(connected, bridgeError.bind(connection, "Unable to connect"));
    }

    function connected() {
        writer = new (Windows.Storage.Streams.DataWriter)(connection.outputStream);
        var ready = {
            command: "ready",
            windowName: rainbowDriver.windowName,
            windowLoc: rainbowDriver.windowLoc,
            windowType: rainbowDriver.windowType,
            backgroundSupported: rainbowDriver.backgroundSupported,
            id: rainbowDriver.id
        };
        sendMessage(ready);
    }

    function receivedMessage(message) {
        var dataReader,
            receivedString,
            receivedData = null;

        if (message.type == 'messagereceived' && message.getDataReader) {
            try {
                dataReader = message.getDataReader();
            } catch (e) {
                return bridgeError('Error reading data');
            }
            receivedString = dataReader.readString(dataReader.unconsumedBufferLength);
            console.info("Message received: ", receivedString);
            try {
                receivedData = JSON.parse(receivedString);
            } catch (e) { }
        }

        if (receivedData) {
            executeCommand(receivedData);
        }
    }

    function sendMessage(message) {
        if(!message.command) {
            message = {
                command: 'log',
                message: 'Not implemented',
                originalMessage: message
            };
        }
        try {
            message = JSON.stringify(message);
        } catch (e) {
            message = JSON.stringify({
                command: 'log',
                message: "Error parsing command response"
            });
        }
        console.log("sending message: " + message);
        writer.writeString(message);
        writer.storeAsync().done(null, bridgeError.bind(writer, 'Error sending string, closing connection'));
    }

    function executeCommand(data) {
        try {
            if (data &&
                'command' in data &&
                rainbowDriver.commands &&
                data.command in rainbowDriver.commands) {
                var result = rainbowDriver.commands[data.command](data);
                sendMessage(result);
            }
            if (data && 'internalCommand' in data) {
                if(data.internalCommand === "resetBackgroundSupported") {
                    rainbowDriver.backgroundSupported = false;
                }
            }
        } catch(e) {
            sendMessage({
                log: "Error executing command"
            });
        }
    }

    function cleanUp() {
        if (connection) {
            connection.close();
        }
        if (writer) {
            writer.close();
        }
        writer = null;
        connection = null;
        tryAgain = true;
    }

    function bridgeError(message, error) {
        console.log(message);
        if (error) {
            console.log(error);
        }
        cleanUp();
    }

    rainbowDriver.connect = connect;
    rainbowDriver.sendMessage = sendMessage;

    if(typeof exports !== 'undefined') {
        exports.rainbowDriver = rainbowDriver;
    }

    setInterval(function reconnectTimer() {
        if (tryAgain) {
            connect();
        }
    }, 2 * 1000);

})();
