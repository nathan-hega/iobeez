var path = require('path');
var db = require( path.join(__dirname, './database/index.js') );
var _ = require('lodash');
var async = require('async');
var nconf = require('nconf');

module.exports = {
  sessionCheck: function (req, res, next) {
    if (!req.cookies.account_id) {
      return res.redirect(302, '/login');
    } else {
      return next();
    }
  },
  averages: function (req, res, next) {
    if (!req.stash || !req.stash.sensor_data) {
      return next({
        message: 'Unable to fetch averages from the DB.',
        status: 503
      });
    }
    var query = "SELECT \"get_average\"($1, $2, $3)";
    var times = nconf.get('times');

    // array of queries to execute
    var queries = [];
    // only look up averages for the sensors that returned data
    _.each(_.keys(req.stash.sensor_data), function (key) {
      _.each(times, function (time) {
        queries.push(function (callback) {
          var values = [time, key, req.cookies.account_name];

          db.query(query, values, function (error, results) {
            if (error) {
              return callback({
                message: error.message,
                status: 503
              });
            } else {
              if (results && results.rows && results.rows.length) {
                var data = {
                  time: time,
                  sensor: key,
                  average: results.rows[0].get_average
                }
                return callback(null, data);
              } else {
                return callback({
                  message: 'Unable to find averages in database.',
                  status: 401
                });
              }
            }
          });
        });
      });
    });

    // execute all of the queries in parallel
    // reflectAll lets all of the functions execute even if one errors
    async.parallel(async.reflectAll(queries), function (error, results) {
      var averages = {};
      _.each(results, function (result) {
        if (result.value) {
          if (!averages[result.value.sensor]) {
            averages[result.value.sensor] = {};
          }

          // TODO - ENHANCEMENT: change this logic to allow for more dynamic application
          // via config file - i.e. do not hardcode 15/60 in the code as these values could change
          if (result.value.time === 15) {
            averages[result.value.sensor]['fifteen'] = result.value.average;
          } else if (result.value.time === 60) {
            averages[result.value.sensor]['sixty'] = result.value.average;
          }
        }
      })

      // attach averages to req for later use
      req.stash.averages = averages;
      return next();
    })
  },
  // create a closure to store query and values and then return a middleware function
  sensor_data: function (query, values) {
    return function (req, res, next) {
      db.query(query, values, function (error, results) {
        if (error) {
          return next({
            message: error.message,
            status: 503
          });
        } else {
          // Note: Normally I would create 'parsers' to handle this data manipulation
          // but due to both the simplicity of the project and the parsing, I am handling it here
          if (results && results.rows && results.rows.length) {
            var sensor_data = {};

            _.each(results.rows, function (row) {
              if (!sensor_data[row.sensor_name]) {
                sensor_data[row.sensor_name] = [];
              }

              sensor_data[row.sensor_name].push({
                timestamp: row.created,
                value: row.value,
                account_name: row.account_name
              });

            });

            // attach sensor_data to req
            req.stash = req.stash || {};
            req.stash.sensor_data = sensor_data;

            return next();
          } else {
            return next({
              message: 'No data for: ' + req.params.sensor_name,
              status: 401
            });
          }
        }
      });
    }
  }
}