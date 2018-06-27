const EventEmitterExtra = require('event-emitter-extra');

const RoomController = require('./rooms/controller');
const ClientController = require('./clients/controller');


class SocketKit extends EventEmitterExtra {
  /**
   * @class  SocketKit
   * @extends {EventEmitterExtra}
   * @param  {!string} options.token Access token
   * @param  {!number} options.accountId Account Id
   * @param  {!string} options.endpoint Default endpoint for Socketkit servers
   *
   * @property {RoomController} Rooms Room controller
   * @property {ClientController} Clients Client controller
   */
  constructor({token, accountId, endpoint = 'wss://ws.socketkit.com'} = {}) {
    super();

    this.token = token;
    this.accountId = accountId;
    this.endpoint = endpoint;

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
   *   accountId: 1
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
      token: this.token
    };

    this.client = new SocketKit.LineClient(this.endpoint, {handshake: {payload}});

    this.bindEvents();

    this.client.connect();

    this.Rooms = new RoomController(this.client);
    this.Clients = new ClientController(this.client);
  }

  /**
   * @summary Disconnect the current client. Will trigger `SocketKit.Event.DISCONNECTED`.
   * @return {object|null}
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
    if (this.isConnected)
      return this.client.disconnect();
  }

  /*
   * @summary Bind events connection related events.`
   * @ignore
   * @private
   */
  bindEvents() {
    this.client.on(SocketKit.LineClient.Event.CONNECTED, () => {
      this.isConnected = true;
      this.emit(SocketKit.Event.CONNECTED);
    });

    this.client.on(SocketKit.LineClient.Event.DISCONNECTED, (code, reason) => {
      this.isConnected = false;
      this.emit(SocketKit.Event.DISCONNECTED, {code, reason});
    });

    this.client.on(SocketKit.LineClient.Event.ERROR, error => {
      this.emit(SocketKit.Event.ERROR, error);
    });

    this.client.on(SocketKit.LineClient.Event.CONNECTING_ERROR, error => {
      this.emit(Socketkit.Event.CONNECTING_ERROR, error);
    });
  }

  /**
   * @summary Returns the line client.
   * @return {LineClient} Line client.
   */
  getClient() {
    return this.client;
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
 * instance.on(SocketKit.Event.CONNECTING_ERROR, (error) => console.info('Error occurred', error));
 */
SocketKit.Event = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  CONNECTING_ERROR: 'connecting_error'
};

SocketKit.LineClient = require('line-socket/src/client/client-web');

exports.SocketKit = SocketKit;
exports.Event = SocketKit.Event;
