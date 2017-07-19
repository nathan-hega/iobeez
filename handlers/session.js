var path = require('path');
var db = require( path.join(__dirname, '../lib/database/index.js') );
var _ = require('lodash');

module.exports = {
  login: function (req, res, next) {
    var query = "SELECT id FROM account where name = $1";
    var value = [req.body.account];

    db.query(query, value, function (error, results) {
      if (error) {
        return next({
          message: error.message,
          status: 503
        });
      } else {
        // check 'results' for an id which means the user is valid
        if (results && results.rows && results.rows.length) {
          var id = results.rows[0].id;

          // set appropriate session cookies for later use
          res.cookie('account_id', id);
          res.cookie('account_name', req.body.account);

          // redirect to dashboard
          return res.redirect('/dashboard');

        } else {
          // TODO - ENHANCEMENT: improve error support by defining a user-friendly error message
          // and taking users back to the login form to try again
          return next({
            message: 'Unable to find user in database.',
            status: 401
          });
        }
      }
    });
  },

  logout: function (req, res, next) {
    // unset the cookies that keep a user logged in
    res.clearCookie('account_id');
    res.clearCookie('account_name');

    return res.redirect('/login');
  }
}