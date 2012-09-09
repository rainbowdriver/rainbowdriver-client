/*globals Windows */
var rainbowDriver = rainbowDriver || {};

(function (argument) {
    "use strict";

    var connection,
        writer,
        tryAgain = true;

    function connect() {
        var host = rainbowDriver.host || "ws://localhost:8080",
            uri = new Windows.Foundation.Uri(host + '/browser_connection/websocket');

        tryAgain = false;
        connection = new Windows.Networking.Sockets.MessageWebSocket();
        connection.control.messageType = Windows.Networking.Sockets.SocketMessageType.utf8;

        connection.onclosed = closed;
        connection.onmessagereceived = receivedMessage;

        connection.connectAsync(uri).done(connected, connectionError);
    }

    function connected() {
        writer = new Windows.Storage.Streams.DataWriter(connection.outputStream);
        sendMessage('{ "status": "ready" }');
    }

    function connectionError(error) {
        console.log('Unable to connect: ', error);
        tryAgain = true;
    }

    function closed(error) {
        tryAgain = true;
        if (error) {
            console.log('Connection closed: ', error);
        }
        if (connection) {
            connection.close();
        }
        if (writer) {
            writer.close();
        }
        writer = null;
        connection = null;
    }

    function receivedMessage(message) {
        var dataReader,
            receivedString,
            receivedData = null;

        if (message.type == 'messagereceived' && message.getDataReader) {
            try {
                dataReader = message.getDataReader();
            } catch (e) {
                console.error('Error reading data');
                return closed();
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

    function executeCommand(data) {
        if (data &&
            'command' in data &&
            rainbowDriver.commands &&
            data.command in rainbowDriver.commands) {
                var result = rainbowDriver.commands[data.command](data);
                sendMessage(result);
            }
    }

    function sendMessage(message) {
        console.log("sending message: " + message);
        writer.writeString(message);
        writer.storeAsync().done("", sendError);
    }

    function sendError() {
        console.log('Error sending string, closing connection');
        closed();
    }

    rainbowDriver.connect = connect;
    rainbowDriver.sendMessage = sendMessage;

    setInterval(function reconnectTimer() {
        if (tryAgain) {
            connect();
        }
    }, 2 * 1000);

})();
