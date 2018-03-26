const LineClient = require('line-socket/client-web');
const EventEmitterExtra = require('event-emitter-extra');


class Chat extends EventEmitterExtra {
  /**
   * @class Chat
   * @param  {LineClient} client Line client
   */
  constructor(client) {
    super();

    this.me = null;
    this.client = client;
  }

  /**
   * @summary Bind necessary events
   * @private
   * @ignore
   */
  bindEvents() {
    this.client.on(LineClient.Event.CONNECTED, async () => {
      this.getCurrentClient();
    });

    this.client.on(Chat.InternalEvent.ROOM_EVENT, message => {
      this.emit(Chat.Event.ROOM_EVENT, message.payload);
    });

    this.client.on(Chat.InternalEvent.NEW_ROOM_CREATED, message => {
      this.emit(Chat.Event.NEW_ROOM_CREATED, message.payload);
    });

    this.client.on(Chat.InternalEvent.JOINED_TO_ROOM, message => {
      this.emit(Chat.Event.JOINED_TO_ROOM, message.payload);
    });

    this.client.on(Chat.InternalEvent.ROOM_UPDATED, message => {
      this.emit(Chat.Event.ROOM_UPDATED, message.payload);
    });
  }

  /**
   * @summary Get rooms
   *
   * @param  {?Date} payload.startDate Optional start date for pagination
   * @param  {?Date} payload.endDate Optional end date for pagination
   * @param  {?Number} payload.offset Optinal offset for pagination
   * @param  {?Number} [limit=50] payload.limit Optional limit
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .getRooms()
   *     .then(rooms => console.log('Rooms', rooms));
   * });
   */
  async getRooms({startDate, endDate, offset, limit = 50} = {}) {
    return this.client.send(Chat.InternalEvent.GET_CLIENT_ROOMS,
        {pagination: {startDate, endDate, offset, limit}});
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
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .getCurrentClient()
   *     .then(client => console.log('Current client', client));
   * });
   */
  async getCurrentClient() {
    this.me = await this.client.send(Chat.InternalEvent.GET_CURRENT_CLIENT);
    this.emit(Chat.Event.CLIENT_UPDATED, this.me);
    return this.me;
  }

  /**
   * @summary Get messages by room id
   *
   * @param  {!Number} roomId Room id
   * @param  {?Date} options.startDate Start date for pagination
   * @param  {?Date} options.endDate End date for pagination
   * @param  {?Number} options.offset Offset for pagination
   * @param  {Number} [limit=50] options.limit Limit
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .getMessagesByRoomId(1)
   *     .then(messages => console.log('Messages', messages));
   * });
   */
  async getMessagesByRoomId(roomId, {startDate, endDate, offset, limit = 50} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client
      .send(Chat.InternalEvent.GET_MESSAGES, {roomId, pagination: {startDate, endDate, offset, limit}});
  }

  /**
   * @summary Send a message to room
   *
   * @param  {!Number} roomId Room id
   * @param  {!text} text Message to be sent to the room
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .sendMessageToRoom(1, 'Hello world');
   * });
   */
  async sendMessageToRoom(roomId, text) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!text)
      return Promise.reject(new Error(`text is required`));

    return this.client.send(Chat.InternalEvent.SEND_MESSAGE_TO_ROOM, {roomId, text});
  }

  /**
   * @summary Set typing of current user in a given room.
   * @param {number} roomId Room id
   * @return {Promise}
   */
  async setTyping(roomId) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client
      .send(Chat.Events.SET_TYPING, {roomId, typing: true});
  }

  /**
   * @summary Clear typing of the current user in the room.
   * @param  {number} roomId Room id
   * @return {Promise}
   */
  async clearTyping(roomId) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client
      .send(Chat.Events.SET_TYPING, {roomId, typing: false});
  }

  /**
   * @summary Gets room information by room id.
   * @param {!number} roomId Room id.
   * @return {Promise}
   */
  async getRoomInfo(roomId) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client
      .send(Chat.Event.GET_ROOM_INFO, {roomId});
  }

  /**
   * @summary Add a participant to a room
   *
   * @param {!Number} roomId Room id
   * @param {!Number} targetClientId Target client id
   * @param {Object} [properties={}] properties Additional properties for the participant
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .addParticipant(1, 15, {joinedDate: new Date()})
   * });
   */
  async addParticipant(roomId, targetClientId, properties = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetClientId)
      return Promise.reject(new Error(`targetClientId is required`));

    return this.client.send(Chat.InternalEvent.ADD_PARTICIPANT, {roomId, targetClientId, properties});
  }

  /**
   * @summary Create a room
   *
   * @param  {!string}  title Title of the room
   * @param  {Boolean} [private_=false] private_ If the room is private or not.
   * @param  {Object}  properties Additional properties for the room
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .createRoom('New room', true, {link: 'https://socketkit.com'})
   * });
   */
  async createRoom(title, private_ = false, properties = {}) {
    if (!title)
      return Promise.reject(new Error(`title is required`));

    return this.client.send(Chat.InternalEvent.CREATE_ROOM, {title, private: private_, properties});
  }

  /**
   * @summary Update a room
   *
   * @param  {!Number} roomId Room id
   * @param  {!string} title New title of the room
   * @param  {Object} properties Additional properties
   *
   * @return {Promise}
   *
   * @example
   *
   * const socketkit = new SocketKit({
   *   token: 'abc',
   *   accountId: 1,
   *   type: Socketkit.ConnectionType.CLIENT
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .updateRoom(1, 'Edited title', {link: 'https://socketkit.com'})
   * });
   */
  async updateRoom(roomId, title, properties = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!title)
      return Promise.reject(new Error(`title is required`));

    return this.client.send(Chat.InternalEvent.UPDATE_ROOM, {roomId, title, properties});
  }
}

/**
 * @static
 * @readonly
 * @enum {string}
 * @ignore
 */
Chat.InternalEvent = {
  ROOM_EVENT: 'room_event',
  NEW_ROOM_CREATED: 'new_room_created',
  JOINED_TO_ROOM: 'joined_to_room',
  ROOM_UPDATED: 'room_updated',
  GET_CLIENT_ROOMS: 'get_client_rooms',
  GET_CURRENT_CLIENT: 'get_current_client',
  GET_MESSAGES: 'get_messages',
  SEND_MESSAGE_TO_ROOM: 'send_message_to_room',
  CREATE_ROOM: 'create_room',
  ADD_PARTICIPANT: 'add_participant',
  UPDATE_ROOM: 'update_room'
};

/**
 * @static
 * @readonly
 * @enum {string}
 */
Chat.Event = {
  NEW_ROOM_CREATED: 'new_room_created',
  JOINED_TO_ROOM: 'joined_to_room',
  ROOM_UPDATED: 'room_updated',
  MESSAGE_RECEIVED: 'message_received',
  CLIENT_UPDATED: 'client_updated',
  ROOM_EVENT: 'room_event',
  GET_ROOM_INFO: 'get_room_info',
  SET_TYPING: 'set_typing'
};

exports.Chat = Chat;
exports.Event = Chat.Event;
