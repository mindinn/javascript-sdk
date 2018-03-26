const LineClient = require('line-socket/client-web');
const EventEmitterExtra = require('event-emitter-extra');
const {Chat} = require('./chat');
const {Service} = require('./service');


class SocketKit extends EventEmitterExtra {
  /**
   * @class  SocketKit
   * @extends {EventEmitterExtra}
   * @param  {!string} options.token Access token
   * @param  {!number} options.accountId Account Id
   * @param  {!SocketKit.ConnectionType} options.type
   */
  constructor({token, accountId, type} = {}) {
    super();

    this.token = token;
    this.accountId = accountId;
    this.type = type;

    this.client = null;
    this.isConnected = false;
  }

  /**
   * @summary Initialize connection. Will trigger `SocketKit.Event.DISCONNECTED` event if handshake fails.
   * @return {null}
   *
   * @example
   * const instance = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: SocketKit.ConnectionType.CLIENT
   * });
   *
   * instance.connect();
   *
   * instance.on(SocketKit.Event.CONNECTED, () => console.info('Connected'));
   * instance.on(SocketKit.Event.DISCONNECTED, () => console.info('Disconnected'));
   */
  connect() {
    if (this.isConnected)
      return console.warn('Client is already connected');

    const payload = {
      accountId: this.accountId,
      token: this.token,
      type: this.type
    };

    this.client = new LineClient('wss://ws.socketkit.com', {handshake: {payload}});

    this.bindEvents();

    if (this.type === SocketKit.ConnectionType.CLIENT) {
      this.chat = new Chat(this.client);
      this.chat.bindEvents();
    } else if (this.type === SocketKit.ConnectionType.SERVICE) {
      this.service = new Service(this.client);
      this.service.bindEvents();
    }

    this.client.connect();
  }

  /**
   * @summary Disconnect the current client. Will trigger `SocketKit.Event.DISCONNECTED`.
   *
   * @example
   * const instance = new SocketKit({
   *   token: 'abc',
   *   type: SocketKit.ConnectionType.CLIENT
   * });
   *
   * instance.connect();
   *
   * setTimeout(() => instance.disconnect(), 1000);
   *
   * instance.on(SocketKit.Event.CONNECTED, () => console.info('Connected'));
   * instance.on(SocketKit.Event.DISCONNECTED, () => console.info('Disconnected'));
   */
  disconnect() {
    if (this.client)
      this.client.disconnect();
  }

  /**
   * @summary Bind events connection related events.`
   * @ignore
   * @private
   */
  bindEvents() {
    this.client.on(LineClient.Event.CONNECTED, () => {
      this.isConnected = true;
      this.emit(SocketKit.Event.CONNECTED);
    });

    this.client.on(LineClient.Event.DISCONNECTED, (code, reason) => {
      this.isConnected = false;
      this.emit(SocketKit.Event.DISCONNECTED, {code, reason});
    });

    this.client.on(LineClient.Event.ERROR, error => {
      this.emit(SocketKit.Event.ERROR, error);
    });
  }

  /**
   * @summary Returns the line client.
   * @return {LineClient} Line client.
   */
  getClient() {
    return this.client;
  }

  /**
   * @summary Return the connection instance according to connection type.
   * @return {Service|Chat|null}
   */
  getInstance() {
    if (this.type === SocketKit.ConnectionType.CLIENT)
      return this.chat;

    if (this.type === SocketKit.ConnectionType.SERVICE)
      return this.service;

    return null;
  }
}

/**
 * @static
 * @readonly
 * @enum {string}
 *
 * @example
 * instance.on(SocketKit.Event.CONNECTED, () => console.info('Connected'));
 * instance.on(SocketKit.Event.DISCONNECTED, () => console.info('Disconnected'));
 * instance.on(SocketKit.Event.ERROR, (error) => console.info('Error occurred', error));
 */
SocketKit.Event = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

/**
 * @static
 * @readonly
 * @enum {string}
 *
 * @example
 *
 * // Login as client
 * const client = new SocketKit({
 *   token: 'abc',
 *   type: SocketKit.ConnectionType.CLIENT
 * });
 *
 * // Login as service
 * const service = new SocketKit({
 *   token: 'abc',
 *   type: SocketKit.ConnectionType.SERVICE
 * });
 */
SocketKit.ConnectionType = {
  CLIENT: 'client',
  SERVICE: 'service'
};

exports.SocketKit = SocketKit;
exports.ConnectionType = SocketKit.ConnectionType;
exports.Event = SocketKit.Event;
exports.ChatEvent = Chat.Event;
exports.ServiceEvent = Service.Event;
