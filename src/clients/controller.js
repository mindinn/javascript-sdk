const EventEmitterExtra = require('event-emitter-extra');

class ClientController extends EventEmitterExtra {
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

    return this.client.send(ClientController.Events.ADD_CLIENT, {
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

    return this.client.send(ClientController.Events.ADD_CLIENT, {
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

    return this.client.send(ClientController.Events.UPDATE_CLIENT, updateData);
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

    return this.client.send(ClientController.Events.DELETE_CLIENT, {uniqueClientKey});
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

    return this.client.send(ClientController.Events.GET_CLIENT, {uniqueClientKey});
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
    return this.client.send(ClientController.Events.GET_CURRENT_CLIENT);
  }


  /**
   * @summary Send push notification to target clients
   * @param  {!Object} notification Notification configuration
   * @param  {!String} notification.title Heading of the notification
   * @param  {!String} notification.text Text content of the notification
   * @param  {Object} [notification.data={}] notification.data Data to be passed upon opening notification on app
   * @param  {!Array<String>} notification.targets UniqueClientKeys of recipient clients
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
   *     .sendPushNotification({
   *       title: 'Welcome',
   *       text: 'You needed a socket connection, and socketkit brought it to you',
   *       data: {firstNotification: true},
   *       targets: ['John Doe', 'Jane Doe']
   *     })
   * });
   */
  async sendPushNotification(notification = {}) {
    if (!notification.title)
      return Promise.reject(new Error(`title is required`));

    if (!notification.text)
      return Promise.reject(new Error(`text is required`));

    if (!notification.data)
      return Promise.reject(new Error(`data is required`));

    if (!notification.targets)
      return Promise.reject(new Error(`targets is required`));

    return this.client.send(ClientController.Events.SEND_PUSH_NOTIFICATION, notification);
  }
}


ClientController.Events = {
  ADD_CLIENT: 'add_client',
  UPDATE_CLIENT: 'update_client',
  DELETE_CLIENT: 'delete_client',
  GET_CLIENT: 'get_client',
  GET_CURRENT_CLIENT: 'get_current_client',
  SEND_PUSH_NOTIFICATION: 'send_push_notification',
};


module.exports = ClientController;
