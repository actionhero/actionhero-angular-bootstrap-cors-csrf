exports.sessionCreate = {
  name:                   'session:create',
  description:            'session:create',
  outputExample:          {},

  inputs: {
    email:     { required: true },
    password:  { required: true },
  },

  run: function(api, data, next){
    data.response.success = false;
    api.models.user.findOne({where: {email: data.params.email}}).then(function(user){
      if(!user){ return next(new Error('user not found')); }
      user.checkPassword(data.params.password, function(error, match){
        if(error){ return next(error); }
        else if(!match){ return next(new Error('password does not match')); }
        else{
          api.session.create(data.connection, user, function(error, sessionData){
            if(error){ return next(error); }
            data.response.user      = user.apiData(api);
            data.response.success   = true;
            data.response.csrfToken = sessionData.csrfToken;
            next();
          });
        }
      });
    })
    .catch(next)
    ;
  }
};

exports.sessionDestroy = {
  name:                   'session:destroy',
  description:            'session:destroy',
  outputExample:          {},

  inputs: {},

  run: function(api, data, next){
    data.response.success = false;
    api.session.destroy(data.connection, next);
  }
};

exports.sessionCheck = {
  name:                   'session:check',
  description:            'session:check',
  outputExample:          {},

  inputs: {},

  run: function(api, data, next){
    api.session.load(data.connection, function(error, sessionData){
      if(error){ return next(error); }
      else if(!sessionData){ 
        return next(new Error('Please log in to continue')); 
      }else{ 
        api.models.user.findOne({where: {id: sessionData.userId}}).then(function(user){
          if(!user){ return next(new Error('user not found')); }
          data.response.user      = user.apiData(api);
          data.response.csrfToken = sessionData.csrfToken;
          data.response.success   = true;
          next();
        }).catch(next);
      }
    });
  }
};