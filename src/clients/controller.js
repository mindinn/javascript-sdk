const EventEmitterExtra = require('event-emitter-extra');

class ClientController extends EventEmitterExtra {
  static Events = {
    ADD_CLIENT: 'add_client',
    UPDATE_CLIENT: 'update_client',
    DELETE_CLIENT: 'delete_client',
    GET_CLIENT: 'get_client',
    GET_CURRENT_CLIENT: 'get_current_client'
  };

  /**
   * @class ClientController
   * @param  {LineClient} client Line client
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   const rooms = socketkit.Clients;
   * });
   */
  constructor(client) {
    super();
    this.client = client;
  }

  /**
   * @summary Add client
   *
   * @param {!Object} [payload={}] payload
   * @param {!string} payload.uniqueClientKey Unique client key
   * @param {!string} payload.token Token you wish to add to client
   * @param {!Object} payload.properties Additional properties for your client
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   accountId: 1,
   *   token: 'abc',
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .create({
   *       uniqueClientKey: 'user-1',
   *       token: 'user-1-token',
   *       properties: {}
   *     })
   *     .then(client => console.log('Client', client));
   * });
   */
  create({uniqueClientKey, token, properties} = {}) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    if (!token)
      return Promise.reject(new Error(`token is required`));

    if (!properties)
      return Promise.reject(new Error(`properties is required`));

    return this.client.send(this.Events.ADD_CLIENT, {
      uniqueClientKey,
      token,
      properties
    });
  }

  /**
   * @summary Insert client even if it exists
   *
   * @param {!string} uniqueClientKey Unique client key
   * @param {!Object} [payload={}] payload
   * @param {!string} payload.token Token you wish to add to client
   * @param {!Object} payload.properties Additional properties for your client
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   accountId: 1,
   *   token: 'abc'
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .upsert('unique-key', {token: 'token', properties: {}})
   *     .then(client => console.log('Client', client));
   * });
   */
  upsert(uniqueClientKey, {token, properties} = {}) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    if (!token)
      return Promise.reject(new Error(`token is required`));

    if (!properties)
      return Promise.reject(new Error(`properties is required`));

    return this.client.send(this.Events.ADD_CLIENT, {
      uniqueClientKey,
      token,
      properties,
      upsert: true
    });
  }

  /**
   * @summary Update client
   *
   * @param {!string} uniqueClientKey Unique client key
   * @param {!Object} [payload={}] payload
   * @param {!string} payload.token Token you wish to change
   * @param {!Object} payload.properties Additional properties for your client
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   accountId: 1,
   *   token: 'abc'
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .update('unique-key', {token: 'abc', properties: {}})
   *     .then(client => console.log('Client', client));
   * });
   */
  update(uniqueClientKey, {token, properties} = {}) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    const updateData = {
      uniqueClientKey
    };

    if (token)
      updateData.token = token;

    if (properties)
      updateData.properties = properties;

    return this.client.send(this.Events.UPDATE_CLIENT, updateData);
  }

  /**
   * @summary Delete a client
   * @param  {!string} uniqueClientKey Predefined client key
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   type: SocketKit.ConnectionType.SERVICE
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .delete('unique-key')
   *     .then(client => console.log('Client', client));
   * });
   */
  delete(uniqueClientKey) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    return this.client.send(this.Events.DELETE_CLIENT, {uniqueClientKey});
  }

  /**
   * @summary Get a client
   * @param  {!string} uniqueClientKey Predefined client key
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   accountId: 1,
   *   token: 'abc'
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .findByKey('unique-key')
   *     .then(client => console.log('Client', client));
   * });
   */
  findByKey(uniqueClientKey) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    return this.client.send(this.Events.GET_CLIENT, {uniqueClientKey});
  }


  /**
   * @summary Get current client information
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Clients
   *     .getCurrent()
   *     .then(client => console.log('Current client', client));
   * });
   */
  async getCurrent() {
    return this.client.send(this.Events.GET_CURRENT_CLIENT);
  }
}

module.exports = ClientController;
