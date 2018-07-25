const EventEmitterExtra = require('event-emitter-extra');

class RoomsController extends EventEmitterExtra {
  /**
   * @class RoomController
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
   *   const rooms = socketkit.Rooms;
   * });
   */
  constructor(client) {
    super();
    this.client = client;

    this.bindEvents();
  }

  /**
   * @summary Bind necessary events
   * @private
   * @ignore
   */
  bindEvents() {
    this.client.on(RoomsController.InternalEvents.ROOM_EVENT, message => {
      this.emit(RoomsController.Events.ROOM_EVENT, message.payload);
    });

    this.client.on(RoomsController.InternalEvents.NEW_ROOM_CREATED, message => {
      this.emit(RoomsController.Events.NEW_ROOM_CREATED, message.payload);
    });

    this.client.on(RoomsController.InternalEvents.JOINED_TO_ROOM, message => {
      this.emit(RoomsController.Events.JOINED_TO_ROOM, message.payload);
    });

    this.client.on(RoomsController.InternalEvents.ROOM_UPDATED, message => {
      this.emit(RoomsController.Events.ROOM_UPDATED, message.payload);
    });
  }

  /**
   * @summary Create a room
   *
   * @param  {!Object} payload Parameters for the method
   * @param  {!string} payload.title Title of the room
   * @param  {Boolean} [isPrivate=false] payload.isPrivate If the room is private or not
   * @param  {Boolean} [allowPostsByDefault=true] payload.allowPostsByDefault
   *                                              Can participants post messages to room or not right away
   * @param  {Object} [properties={}] payload.properties Additional properties for the room
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
   *     .Rooms
   *     .create({
   *       title: 'Awesome Announcement Room',
   *       isPrivate: true,
   *       allowPostsByDefault: false,
   *       properties: {awesomeLink: 'https://socketkit.com'}
   *     });
   * });
   */
  create({title, isPrivate = false, allowPostsByDefault = true, properties = {}} = {}) {
    if (!title)
      return Promise.reject(new Error(`title is required`));

    return this.client.send(RoomsController.InternalEvents.CREATE_ROOM, {
      title,
      private: isPrivate,
      allowPostsByDefault,
      properties
    });
  }

  /**
   * @summary Send a message to room
   *
   * @param  {!Number} roomId Room id
   * @param  {!Object} [payload={}] payload Parameters for the method
   * @param  {!string} payload.text Message to be sent to the room
   * @param  {Object} payload.properties Message properties
   * @param  {Array<{reference: !String, type: String, name: String, size: Number, length: Number}>}
   *                                     payload.properties.attachments File Attachments sent with the message
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
   *     .Rooms
   *     .sendMessageById(1, {text: 'Jarvis is ready.', properties: {isCool: true}});
   * });
   */
  sendMessageById(roomId, {text, properties = {}} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!text)
      return Promise.reject(new Error(`text is required`));

    return this.client.send(RoomsController.InternalEvents.SEND_MESSAGE_TO_ROOM, {roomId, text, properties});
  }

  /**
   * @summary Gets room information by room id.
   * @param {!Number} roomId Room id.
   * @return {Promise}
   */
  findById(roomId) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client.send(RoomsController.Events.GET_ROOM_INFO, {roomId});
  }

  /**
   * @summary Get rooms
   *
   * @param  {object} [options={}] options Options for pagination
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
   *     .Rooms
   *     .findAll()
   *     .then(rooms => console.log('Rooms', rooms));
   * });
   */
  findAll(options = {}) {
    return this.client
      .send(RoomsController.InternalEvents.GET_CLIENT_ROOMS, {
        pagination: options
      });
  }

  /**
   * @summary Get messages by room id
   *
   * @param  {!Number} roomId Room id
   * @param  {?Date} [options={}] options Pagination options.
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
   *     .Rooms
   *     .getMessagesById(1)
   *     .then(messages => console.log('Messages', messages));
   * });
   */
  getMessagesById(roomId, options = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client
      .send(RoomsController.InternalEvents.GET_MESSAGES, {roomId, pagination: options});
  }

  /**
   * @summary Update a room
   *
   * @param  {!Number} roomId Room id
   * @param  {Object}  payload
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
   *   accountId: 1
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .getInstance()
   *     .updateRoom(1, {
   *       title: 'Edited title',
   *       properties: {link: 'https://socketkit.com'}
   *     });
   * });
   */
  updateById(roomId, {title, properties = {}} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!title)
      return Promise.reject(new Error(`title is required`));

    return this.client.send(RoomsController.InternalEvents.UPDATE_ROOM, {roomId, title, properties});
  }


  /**
     * @summary Remove a room
     *
     * @param  {!Number} roomId Room id
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
     *     .getInstance()
     *     .removeRoom(1);
     * });
     */
  removeById(roomId) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    return this.client.send(RoomsController.InternalEvents.REMOVE_ROOM, {roomId});
  }

  /**
   * @summary Add a participant to a room
   *
   * @param {!Number} roomId Room id
   * @param {!Object} [payload={}] payload Parameters for the method
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
   *   accountId: 1
   * });
   *
   * socketkit.connect();
   *
   * socketkit.on(SocketKit.Event.CONNECTED, () => {
   *   socketkit
   *     .Rooms
   *     .addMemberById(1, {
   *       targetUniqueClientKey: 15,
   *       isAllowedToPost: false,
   *       properties: {joinedDate: new Date()}
   *     })
   * });
   */
  addMemberById(roomId, {targetUniqueClientKey, isAllowedToPost, properties = {}} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetUniqueClientKey)
      return Promise.reject(new Error(`targetUniqueClientKey is required`));

    return this.client.send(RoomsController.InternalEvents.ADD_PARTICIPANT, {
      roomId,
      targetUniqueClientKey,
      isAllowedToPost,
      properties
    });
  }

  /**
   * @summary Update a member of a room
   *
   * @param {!Number} roomId Room id
   * @param {!Object} [payload={}] payload Parameters for the method
   * @param {!Number} payload.targetUniqueClientKey Target client unique key
   * @param {Boolean} payload.isAllowedToPost PostMessage priviledge of the member
   * @param {Object} payload.properties Additional properties for the member
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
   *     .Rooms
   *     .updateMemberById(1, {
   *       targetUniqueClientKey: 'fooman',
   *       isAllowedToPost: true,
   *       properties: {}
   *     });
   * });
   */
  updateMemberById(roomId, {targetUniqueClientKey, isAllowedToPost, properties} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetUniqueClientKey)
      return Promise.reject(new Error(`targetUniqueClientKey is required`));

    return this.client.send(RoomsController.InternalEvents.UPDATE_PARTICIPANT, {
      roomId,
      targetUniqueClientKey,
      isAllowedToPost,
      properties
    });
  }


  /**
   * @summary Remove member from a room
   *
   * @param {!Number} roomId Room id
   * @param {!Object} [payload={}] payload Parameters for the method
   * @param {!Number} payload.targetUniqueClientKey Target client unique key
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
   *     .Rooms
   *     .removeMemberById(1, {
   *       targetUniqueClientKey: 'foo man',
   *     });
   * });
   */
  removeMemberById(roomId, {targetUniqueClientKey} = {}) {
    if (!roomId)
      return Promise.reject(new Error(`roomId is required`));

    if (!targetUniqueClientKey)
      return Promise.reject(new Error(`targetUniqueClientKey is required`));

    return this.client.send(RoomsController.InternalEvents.REMOVE_PARTICIPANT, {
      roomId,
      targetUniqueClientKey,
    });
  }
}


/**
 * @summary InternalEvents
 * @enum {string}
 * @type {Object}
 * @static
 */
RoomsController.InternalEvents = {
  ROOM_EVENT: 'room_event',
  NEW_ROOM_CREATED: 'new_room_created',
  JOINED_TO_ROOM: 'joined_to_room',
  ROOM_UPDATED: 'room_updated',
  GET_CLIENT_ROOMS: 'get_client_rooms',
  GET_MESSAGES: 'get_messages',
  SEND_MESSAGE_TO_ROOM: 'send_message_to_room',
  CREATE_ROOM: 'create_room',
  ADD_PARTICIPANT: 'add_participant',
  UPDATE_PARTICIPANT: 'update_participant',
  REMOVE_PARTICIPANT: 'remove_participant',
  REMOVE_ROOM: 'remove_room',
  UPDATE_ROOM: 'update_room'
};


/**
 * @summary Events
 * @enum {string}
 * @type {Object}
 * @static
 */
RoomsController.Events = {
  NEW_ROOM_CREATED: 'new_room_created',
  JOINED_TO_ROOM: 'joined_to_room',
  ROOM_UPDATED: 'room_updated',
  MESSAGE_RECEIVED: 'message_received',
  CLIENT_UPDATED: 'client_updated',
  ROOM_EVENT: 'room_event',
  GET_ROOM_INFO: 'get_room_info',
  SET_TYPING: 'set_typing'
};

module.exports = RoomsController;
