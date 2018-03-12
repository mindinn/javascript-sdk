const EventEmitterExtra = require('event-emitter-extra');


class Service extends EventEmitterExtra {
  /**
   * @class Service
   * @param  {LineClient} client Line client
   */
  constructor(client) {
    super();
    this.client = client;
  }

  /**
   * @summary Bind necessary events.
   * @private
   * @ignore
   */
  bindEvents() {}

  /**
   * @summary Add client
   *
   * @param {!string} uniqueClientKey Unique client key
   * @param {!string} token Token you wish to add to client
   * @param {!Object} properties Additional properties for your client
   *
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
   *     .getInstance()
   *     .addClient('unique-key', 'token', {})
   *     .then(client => console.log('Client', client));
   * });
   */
  async addClient(uniqueClientKey, token, properties) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    if (!token)
      return Promise.reject(new Error(`token is required`));

    if (!properties)
      return Promise.reject(new Error(`properties is required`));

    const user = {uniqueClientKey, token, properties};
    return this.client.send(Service.Event.ADD_CLIENT, user);
  }

  /**
   * @summary Insert client even if it exists
   *
   * @param {!string} uniqueClientKey Unique client key
   * @param {!string} token Token you wish to add to client
   * @param {!Object} properties Additional properties for your client
   *
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
   *     .getInstance()
   *     .upsertClient('unique-key', 'token', {})
   *     .then(client => console.log('Client', client));
   * });
   */
  async upsertClient(uniqueClientKey, token, properties) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    if (!token)
      return Promise.reject(new Error(`token is required`));

    if (!properties)
      return Promise.reject(new Error(`properties is required`));

    const user = {uniqueClientKey, token, properties, upsert: true};
    return this.client.send(Service.Event.ADD_CLIENT, user);
  }

  /**
   * @summary Update client
   *
   * @param {!string} uniqueClientKey Unique client key
   * @param {!Object} payload
   * @param {!string} payload.token Token you wish to change
   * @param {!Object} payload.properties Additional properties for your client
   *
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
   *     .getInstance()
   *     .updateClient('unique-key', {token: 'abc', properties: {}})
   *     .then(client => console.log('Client', client));
   * });
   */
  async updateClient(uniqueClientKey, {token, properties} = {}) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    const updateData = {
      uniqueClientKey
    };

    if (token)
      updateData.token = token;

    if (properties)
      updateData.properties = properties;

    return this.client.send(Service.Event.UPDATE_CLIENT, updateData);
  }

  /**
   * @summary Delete a client
   *
   * @param  {!string} uniqueClientKey Predefined client key
   *
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
   *     .getInstance()
   *     .deleteClient('unique-key')
   *     .then(client => console.log('Client', client));
   * });
   */
  async deleteClient(uniqueClientKey) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    return this.client.send(Service.Event.DELETE_CLIENT, {uniqueClientKey});
  }

  /**
   * @summary Get a client
   *
   * @param  {!string} uniqueClientKey Predefined client key
   *
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
   *     .getInstance()
   *     .getClient('unique-key')
   *     .then(client => console.log('Client', client));
   * });
   */
  async getClient(uniqueClientKey) {
    if (!uniqueClientKey)
      return Promise.reject(new Error(`uniqueClientKey is required`));

    return this.client.send(Service.Event.GET_CLIENT, {uniqueClientKey});
  }
}

/**
 * @static
 * @readonly
 * @enum {string}
 * @private
 * @ignore
 */
Service.Event = {
  ADD_CLIENT: 'add_client',
  UPDATE_CLIENT: 'update_client',
  DELETE_CLIENT: 'delete_client',
  GET_CLIENT: 'get_client'
};

exports.Service = Service;
exports.Event = Service.Event;
