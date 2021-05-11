const webSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5000;

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: "CHAIN",
    transaction: "TRANSACTION",
    clear_transactions: "CLEAR_TRANSACTIONS"
}

class P2pServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.sockets = [];
        this.transactionPool = transactionPool;
    }

    listen() {
        const server = new webSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => {
            this.connectSocket(socket);
        });

        this.connectToPeers();
        console.log(`Listening for Peer-to-Peer connections on port : ${P2P_PORT}`);
    }
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket Connected!');
        this.messageHandler(socket);

        this.sendChain(socket);
    }
    connectToPeers() {
        peers.forEach((peer) => {
            const socket = new webSocket(peer);
            socket.on('open', () => this.connectSocket(socket));
        })
    }



    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
        });
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction
        }));
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }

    syncChain() {
        this.sockets.forEach(socket => {
            this.sendChain(socket);
        })
    }

    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
    }

    broadcastClearTransaction(transaction) {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
    }
}

module.exports = P2pServer;