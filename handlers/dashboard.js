var path = require('path');
var middleware = require( path.join(__dirname, '../lib/middleware.js') );

module.exports = {
  sensor_data: function (req, res, next) {
    var query = "SELECT * FROM v_sensor_data where account_name = $1";
    var values = [req.cookies.account_name];

    var sharedSensorData = middleware.sensor_data(query, values);
    return sharedSensorData(req, res, next);
  }
}