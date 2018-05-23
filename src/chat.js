const LineClient = require('line-socket/src/client/client-web');
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
   * @param  {!Object} payload Parameters for the method
   * @param  {!Number} payload.roomId Room id
   * @param  {!text} payload.text Message to be sent to the room
   * @param  {Object} payload.properties Message properties
   * @param  {Array<{reference: !String, type: String, name: String, size: Number, length: Number}>} payload.properties.attachments File Attachments sent with the message
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
  async sendMessageToRoom({roomId, text, properties} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!text)
      return Promise.reject(new Error(`text is required`));

    return this.client.send(Chat.InternalEvent.SEND_MESSAGE_TO_ROOM, {roomId, text, properties});
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
   * @param {!Number} payload.roomId Room id
   * @param {!Number} payload.targetUniqueClientKey Target client id
   * @param {Boolean} payload.isAllowedToPost Optional PostMessage priviledge of the participant
   * @param {Object} [properties={}] payload.properties Additional properties for the participant
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
   *     .addParticipant({
   *       roomId: 1,
   *       targetUniqueClientKey: 15,
   *       isAllowedToPost: false,
   *       properties: {joinedDate: new Date()}
   *     })
   * });
   */
  async addParticipant({roomId, targetUniqueClientKey, isAllowedToPost, properties = {}} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetUniqueClientKey)
      return Promise.reject(new Error(`targetUniqueClientKey is required`));

    const participant = {roomId, targetUniqueClientKey, isAllowedToPost, properties};

    return this.client.send(Chat.InternalEvent.ADD_PARTICIPANT, participant);
  }

  /**
   * @summary Update a participant of a room
   *
   * @param {!Number} payload.roomId Room id
   * @param {!Number} payload.targetClientId Target client id
   * @param {Boolean} payload.isAllowedToPost PostMessage priviledge of the participant
   * @param {Object} payload.properties Additional properties for the participant
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
   *     .updateParticipant({
   *       roomId: 1,
   *       targetUniqueClientKey: 15,
   *       isAllowedToPost: true
   *     });
   * });
   */
  async updateParticipant({roomId, targetUniqueClientKey, isAllowedToPost, properties} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetUniqueClientKey)
      return Promise.reject(new Error(`targetUniqueClientKey is required`));

    const participant = {roomId, targetUniqueClientKey, isAllowedToPost, properties};

    return this.client.send(Chat.InternalEvent.UPDATE_PARTICIPANT, participant);
  }

  /**
   * @summary Create a room
   *
   * @param  {!string} payload.title Title of the room
   * @param  {Boolean} [isPrivate=false] payload.isPrivate If the room is private or not
   * @param  {Boolean} [allowPostsByDefault=true] payload.allowPostsByDefault Can participants post messages to room or not right away
   * @param  {Object} [properties={}] payload.properties Additional properties for the room
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
   *     .createRoom({
   *       title: 'Awesome Announcement Room',
   *       isPrivate: true,
   *       allowPostsByDefault: false,
   *       properties: {awesomeLink: 'https://socketkit.com'}
   *     });
   * });
   */
  async createRoom({title, isPrivate = false, allowPostsByDefault = true, properties = {}} = {}) {
    if (!title)
      return Promise.reject(new Error(`title is required`));

    const room = {title, private: isPrivate, allowPostsByDefault, properties};

    return this.client.send(Chat.InternalEvent.CREATE_ROOM, room);
  }

  /**
   * @summary Update a room
   *
   * @param  {!Number} payload.roomId Room id
   * @param  {!string} payload.title New title of the room
   * @param  {Object} [properties={}] payload.properties Additional properties
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
   *     .updateRoom({
   *       roomId: 1,
   *       title: 'Edited title',
   *       properties: {link: 'https://socketkit.com'}
   *     });
   * });
   */
  async updateRoom({roomId, title, properties = {}} = {}) {
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
  UPDATE_PARTICIPANT: 'update_participant',
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
