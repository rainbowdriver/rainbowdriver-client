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
        sendMessage('{ "status": "ready" }');
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
        console.log("sending message: " + message);
        writer.writeString(message);
        writer.storeAsync().done(null, bridgeError.bind(writer, 'Error sending string, closing connection'));
    }

    function executeCommand(data) {
        if (data &&
            'command' in data &&
            rainbowDriver.commands &&
            data.command in rainbowDriver.commands) {
                var result = rainbowDriver.commands[data.command](data);
                sendMessage(result);
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
