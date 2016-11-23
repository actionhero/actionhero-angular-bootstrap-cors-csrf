var ActionheroPrototype = require('actionhero')

var specHelper = {
  actionhero: new ActionheroPrototype(),
  api: null,

  initialize: function (callback) {
    var self = this
    self.actionhero.initialize(function (error, a) {
      self.api = a
      callback(error)
    })
  },

  truncate: function (callback) {
    var self = this
    self.api.sequelize.sequelize.query('truncate table users').then(function () {
      callback()
    }).catch(function (error) {
      if (String(error).match(/ER_NO_SUCH_TABLE/)) { callback() } else { callback(error) }
    })
  },

  start: function (callback) {
    var self = this
    self.actionhero.start(function (error, a) {
      self.api = a
      callback(error, self.api)
    })
  },

  stop: function (callback) {
    var self = this
    self.actionhero.stop(function (error) {
      callback(error)
    })
  },

  login: function (connection, email, password, callback) {
    var self = this
    connection.params = {
      email: email,
      password: password
    }

    self.api.specHelper.runAction('session:create', connection, callback)
  },

  requestWithLogin: function (email, password, action, params, callback) {
    var self = this
    var connection = new self.api.specHelper.Connection()
    self.login(connection, email, password, function (loginResponse) {
      if (loginResponse.error) { return callback(loginResponse) }
      connection.params = params
      self.api.specHelper.runAction(action, connection, callback)
    })
  }
}

/* --- Init the server --- */
before(function (done) {
  specHelper.initialize(done)
})

/* --- Start up the server --- */
before(function (done) {
  specHelper.start(done)
})

/* --- Stop the server --- */
after(function (done) {
  specHelper.stop(done)
})

module.exports = specHelper
