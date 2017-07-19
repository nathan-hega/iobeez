// Centralizing DB access / configuration to a single file
// This file will be required instead of the module 'pg-pool' in subsequent files
// Node's module caching feature ensures that only one 'pool' variable is created
// per require of this file.



// TODO - ENHANCEMENT: it might be better to use prepared queries.
// Prepared queries _could_ speed up execution of the queries in a production environment.
// This assumes the production app serves few:many ratio of connections:users
// (unfortunately prepared queries are shared per connection, not per pool)
var nconf = require('nconf');
var Pool = require('pg-pool');

var pool = new Pool({
  user: nconf.get('PGUSER'),
  host: nconf.get('PGHOST'),
  database: nconf.get('PGDATABASE'),
  password: nconf.get('PGPASSWORD'),
  port: nconf.get('PGPORT')
});

module.exports = {
  query: function (text, params, callback) {
    // TODO - ENHANCEMENT: add logging support here for queries
    return pool.query(text, params, callback)
  }
}