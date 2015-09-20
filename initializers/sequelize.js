var path              = require('path');
var fs                = require('fs');
var Sequelize         = require('sequelize');

module.exports = {
  loadPriority:  100,
  startPriority: 100,

  initialize: function(api, next){
    api.models = {};

    var sequelizeInstance = new Sequelize(
      api.config.sequelize.database,
      api.config.sequelize.username,
      api.config.sequelize.password,
      api.config.sequelize
    );

    api.sequelize = {

      sequelize: sequelizeInstance,

      connect: function(callback){
        var dir = path.normalize(api.projectRoot + '/models');
        fs.readdirSync(dir).forEach(function(file){
          var nameParts = file.split("/");
          var name = nameParts[(nameParts.length - 1)].split(".")[0];
          api.models[name] = api.sequelize.sequelize.import(dir + '/' + file);
        });

        api.sequelize.sequelize.sync().then(function(){
          callback();
        }).catch(function(error){
          callback(error);
        });
      }
    };

    next();
  },

  start: function(api, next){
    api.sequelize.connect(next);
  }
};