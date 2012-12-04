var assert = require('assert'),
    sinon = require('sinon'),
    bridge;

describe('Bridge', function(){
    // var clock;

    // beforeEach(function () { clock = sinon.useFakeTimers(); });
    // afterEach(function () { clock.restore(); });

    describe('connect and disconnect cycle', function(){

        afterEach(function(){
            Windows.Networking.Sockets.MessageWebSocket.reset();
            doneConnectAsync.reset();
            connectAsync.reset();
        });

        it('creates a new connection', function(){
            bridge.connect();
            assert(Windows.Networking.Sockets.MessageWebSocket.calledOnce);
            assert(Windows.Networking.Sockets.MessageWebSocket.calledWithNew);
            Windows.Networking.Sockets.MessageWebSocket.reset();
        });

        it('set properties', function(){
            bridge.connect();
            var connection = Windows.Networking.Sockets.MessageWebSocket.returnValues[0];
            assert.equal(connection.control.messageType, 'utf8');
            assert.equal(typeof connection.onclosed, 'function');
            assert.equal(typeof connection.onmessagereceived, 'function');
            Windows.Networking.Sockets.MessageWebSocket.reset();
        });

        it('sets promisse', function(){
            bridge.connect();
            assert.equal(connectAsync.getCall(0).args[0].uri, 'ws://localhost:8080/browser_connection/websocket');
            assert.equal(typeof doneConnectAsync.getCall(0).args[0], 'function');
            assert.equal(typeof doneConnectAsync.getCall(0).args[1], 'function');
            Windows.Networking.Sockets.MessageWebSocket.reset();
        });

    });

});


function SocketStub() {
    return this;
}
SocketStub.prototype.control = {};
var doneConnectAsync = sinon.stub();
var connectAsync = sinon.spy(function() {
    return {
        done: doneConnectAsync
    };
});
SocketStub.prototype.connectAsync = connectAsync;

function UriStub(uri) {
    this.uri = uri;
    return this;
}

global.Windows = {
    Networking: { Sockets: { MessageWebSocket: sinon.spy(SocketStub), SocketMessageType: { utf8: "utf8" } } },
    Storage: { Streams: { DataWriter: { } } },
    Foundation: { Uri: UriStub }
};

bridge = require('../src/bridge.js').rainbowDriver;

