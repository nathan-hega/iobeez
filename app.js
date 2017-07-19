var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var nconf = require('nconf');
var middleware = require( path.join(__dirname, 'lib/middleware.js') );
var socketEmitter = require( path.join(__dirname, 'lib/socketEmitter.js') );
var hbs = require('hbs');
var fs = require('fs');
var _ = require('lodash');
var index = require('./routes/index');
var api = require('./routes/api');

// configure nconf
nconf.argv()
   .env()
   .file({ file: path.join(__dirname, 'config.json') });

// configure socket.io
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function(socket){
  var token = socket.handshake.query.token;

  // if we get a token, create a seperate room for user-specific alerts
  if (token) {
    socket.join('user_room_'+token);
  }
});


// TODO - ENHANCEMENT: Right now, averages aren't updated when new logs come in.
// To be feature complete, I should add support to make this happen.
socketEmitter.on('log_entry', function (data) {
  io.to('user_room_'+data.account_name).emit('update', {
    value: data.value,
    timestamp: data.timestamp,
    sensor_name: data.sensor_name
  });
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// middleware set up
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// routing
app.use('/', index);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// register all handlebars partials to allow dynamic additions / removals
var partialsDir = path.join(__dirname, '/views/partials');
var filenames = fs.readdirSync(partialsDir);

_.each(filenames, function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }

  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');

  return hbs.registerPartial(name, template);
});


var port = nconf.get("IOBEEZ_WEB_PORT");
if (port) {
  server.listen(port, function () {
    console.log("Listening on port: " + port);
  });
} else {
  console.error("Unable to begin server. Port must be specified as: IOBEEZ_WEB_PORT");
}

module.exports = app;