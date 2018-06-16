const LineClient = require('line-socket/client-node');
const {SocketKit} = require('./index');

SocketKit.LineClient = LineClient;

exports.SocketKit = SocketKit;
exports.Event = SocketKit.Event;
