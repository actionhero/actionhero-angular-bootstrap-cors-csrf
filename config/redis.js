var host     = process.env.REDIS_HOST || '127.0.0.1';
var port     = process.env.REDIS_PORT || 6379;
var database = process.env.REDIS_DB   || 0;
var password = process.env.REDIS_PASS || null;

exports['default'] = {
  redis: function(api){
    var Redis;
    if(process.env.FAKEREDIS === 'false' || process.env.REDIS_HOST !== undefined){
      Redis = require('ioredis');
    }else{
      Redis = require('fakeredis');
    }

    return {
      '_toExpand': false,
      // create the redis clients
      // because we are using a cheap heroku redis with a connection limit, we'll use 1 client
      var client = new Redis({ port: port, host: host, password: password, db: database }),

      client:     client,
      subscriber: client,
      tasks:      client,
    };
  }
};

exports.test = {
  redis: function(api){
    if(process.env.FAKEREDIS === 'false'){
      var Redis = require('ioredis');
      return {
        '_toExpand': false,

        client:     new Redis({ port: port, host: host, password: password, db: database }),
        subscriber: new Redis({ port: port, host: host, password: password, db: database }),
        tasks:      new Redis({ port: port, host: host, password: password, db: database }),
      };
    }else{
      var Redis = require('fakeredis');
      return {
        '_toExpand': false,

        client:     Redis.createClient(port, host, {fast: true}),
        subscriber: Redis.createClient(port, host, {fast: true}),
        tasks:      Redis.createClient(port, host, {fast: true}),
      };
    }
  }
};
