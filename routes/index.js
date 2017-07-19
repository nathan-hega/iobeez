var express = require('express');
var router = express.Router();
var path = require('path');
var middleware = require( path.join(__dirname, '../lib/middleware.js') );
var handlers = require( path.join(__dirname, '../handlers') )

router.get('/', middleware.sessionCheck, function (req, res, next) {
  return res.redirect('/dashboard');
});

router.get('/login', function (req, res, next) {
  return res.render('login', {});
});

router.post('/login', handlers.session.login);
router.get('/logout', handlers.session.logout);

router.get('/dashboard',
  middleware.sessionCheck,
  handlers.dashboard.sensor_data,
  middleware.averages,
  function (req, res, next) {
    return res.render('dashboard', req.stash);
});

router.get('/history/:sensor_name',
  middleware.sessionCheck,
  handlers.history.sensor_data,
  middleware.averages,
  function (req, res, next) {
    // adjust the data to accomodate the handlebars partials context expectations
    var context = {
      title: req.params.sensor_name,
      sensor_data: req.stash.sensor_data[req.params.sensor_name],
      averages: req.stash.averages[req.params.sensor_name]
    }

    return res.render('history', context);
})

module.exports = router;