/*globals Windows */
var rainbowDriver = rainbowDriver || {};

(function (argument) {
    "use strict";

    var messageWebSocket,
        messageWriter;

    function sendMessage(msg) {
        messageWriter.writeString(msg);
        messageWriter.storeAsync().done("", sendError);
    }

    function onMessageReceived(args) {
        try {
            // The incoming message is already buffered.
            var dataReader = args.getDataReader(),
                receivedString = dataReader.readString(dataReader.unconsumedBufferLength),
                receivedData;
            try {
                receivedData = JSON.parse(receivedString);
            } catch (e) {}
            // Use the dataReader to read data from the received message
            console.log(receivedString);

            if (rainbowDriver.commands && receivedData && 'command' in receivedData && receivedData.command in rainbowDriver.commands) {
                console.log('recognized command');
                rainbowDriver.commands[receivedData.command](receivedData);
            }
        } catch (e) {
            console.error('fail to read response ', e);
            onClosed();
        }
    }

    function onClosed(args) {
        // You can add code to log or display the code and reason
        // for the closure (stored in args.code and args.reason)
        if (messageWebSocket) {
            messageWebSocket.close();
        }
        messageWebSocket = null;
    }

    function sendError() {
        console.log('sendError', arguments);
    }

    function startSend(url) {
        url = url || "ws://localhost:8080";
        if (!messageWebSocket) {
            var serverAddress,
                webSocket = new Windows.Networking.Sockets.MessageWebSocket();
            // MessageWebSocket supports both utf8 and binary messages.
            // When utf8 is specified as the messageType, then the developer
            // promises to only send utf8-encoded data.
            webSocket.control.messageType = Windows.Networking.Sockets.SocketMessageType.utf8;
            // Set up callbacks
            webSocket.onmessagereceived = onMessageReceived;
            webSocket.onclosed = onClosed;

            serverAddress = new Windows.Foundation.Uri(url + '/browser_connection/websocket');

            try {
                webSocket.connectAsync(serverAddress).done(function () {
                    messageWebSocket = webSocket;
                    // The default DataWriter encoding is utf8.
                    messageWriter = new Windows.Storage.Streams.DataWriter(webSocket.outputStream);
                    sendMessage('created connection');

                }, function (error) {
                    console.error('The connection failed: ', error);
                    // The connection failed; add your own code to log or display
                    // the error, or take a specific action.
                });
            } catch (error) {
                // An error occurred while trying to connect; add your own code to
                // log or display the error, or take a specific action.
                console.error('An error occurred while trying to connect: ', error);
            }

        }
        else {
            // The connection already exists; go ahead and send the message.
            sendMessage('reused connection');
        }
    }

    rainbowDriver.connect = startSend;

})();

