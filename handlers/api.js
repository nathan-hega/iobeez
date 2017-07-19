var path = require('path');
var db = require( path.join(__dirname, '../lib/database/index.js') );
var middleware = require( path.join(__dirname, '../lib/middleware.js') );
var socketEmitter = require( path.join(__dirname, '../lib/socketEmitter.js') );
var moment = require('moment');


module.exports = {
  logs: {
    post: function (req, res, next) {
      if (!req.body || !(req.body.account_name && req.body.sensor_name && req.body.value)) {
        return next({
          message: "Please supply the required data for this request.",
          status: 400 // for lack of a better status code..
        });
      }
      var query = "INSERT INTO v_sensor_data (value, account_name, sensor_name) VALUES ($1, $2, $3)";
      var values = [req.body.value, req.body.account_name, req.body.sensor_name];

      db.query(query, values, function (error, results) {
        if (error) {
          return next({
            message: error.message,
            status: 503
          });
        } else {
          // Assume this is a success if we didn't get an error

          // emit an event so that the user viewing his/her dashboard gets an update
          socketEmitter.emit('log_entry', {
            sensor_name: req.body.sensor_name,
            account_name: req.body.account_name,
            value: req.body.value,
            // TODO - ENHANCEMENT: there could be a minor discrepency in timestamps since
            // one timestamp comes from the postgresql server and the other comes from moment()
            // TODO - ENHANCEMENT: format the timestamp to match the DB formatting
            timestamp: moment.now()
          });
          return next();
        }
      });
    },
    get: function (req, res, next) {
      var query = "SELECT * FROM v_sensor_data";
      var values = [];

      var sharedSensorData = middleware.sensor_data(query, values);
      return sharedSensorData(req, res, next);
    }
  }
}