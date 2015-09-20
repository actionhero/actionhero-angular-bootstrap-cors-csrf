exports.default = {
  sequelize: function(api){
    return {
      "autoMigrate" : false,
      "loadFixtures": false,
      "dialect"     : "mysql",
      "port"        : parseInt( process.env.MYSQL_PORT ),
      "database"    : process.env.MYSQL_DATABASE,
      "host"        : process.env.MYSQL_HOST,
      "username"    : process.env.MYSQL_USER,
      "password"    : process.env.MYSQL_PASS,
      "logging"     : false,
    };
  }
};

exports.development = exports.default.sequelize();