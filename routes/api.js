// RESTful API support goes here

var path = require('path');
var express = require('express');
var router = express.Router();
var middleware = require( path.join(__dirname, '../lib/middleware.js') );
var handlers = require( path.join(__dirname, '../handlers') )


// TODO - ENHANCEMENT: plural 'logs' implies a user can submit multiple
// logs per single POST which is not the case here. This should be fixed.
router.post('/logs', handlers.api.logs.post, function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/logs', handlers.api.logs.get, function (req, res, next) {
  res.send(req.stash);
});

module.exports = router;