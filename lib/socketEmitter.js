// This Event Emitter will be used to signal logs being added to the database via
// the /api/logs POST route. The api handler for submitting a log will emit an event
// and the event handler will be created in app.js so it has access to socket.io
var events = require('events');
var obj = new events.EventEmitter();
module.exports = obj;