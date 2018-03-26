const LineClient = require('line-socket/client-node');
const {SocketKit} = require('./index');
const {Chat} = require('./chat');
const {Service} = require('./service');

SocketKit.LineClient = LineClient;

exports.SocketKit = SocketKit;
exports.ConnectionType = SocketKit.ConnectionType;
exports.Event = SocketKit.Event;
exports.ChatEvent = Chat.Event;
exports.ServiceEvent = Service.Event;
