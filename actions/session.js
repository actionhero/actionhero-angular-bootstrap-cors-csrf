const {Action, api} = require('actionhero')

exports.SessionCreate = class SessionCreate extends Action {
  constructor () {
    super()
    this.name = 'session:create'
    this.inputs = {
      email: { required: true },
      password: { required: true }
    }
  }

  async run (data) {
    data.response.success = false
    let user = await api.models.user.findOne({where: {email: data.params.email}})
    if (!user) { throw new Error('user not found') }

    let match = await user.checkPassword(data.params.password)
    if (!match) { throw new Error('password does not match') }

    let sessionData = await api.session.create(data.connection, user)
    data.response.user = user.apiData(api)
    data.response.success = true
    data.response.csrfToken = sessionData.csrfToken
  }
}

exports.SessionDestroy = class SessionDestroy extends Action {
  constructor () {
    super()
    this.name = 'session:destroy'
    this.inputs = {}
  }

  async run (data) {
    data.response.success = false
    await api.session.destroy(data.connection)
    data.response.success = true
  }
}

exports.SessionCheck = class SessionCheck extends Action {
  constructor () {
    super()
    this.name = 'session:check'
    this.inputs = {}
  }

  async run (data) {
    data.response.success = false
    let sessionData = await api.session.load(data.connection)
    if (!sessionData) { throw new Error('Please log in to continue') }

    let user = await api.models.user.findOne({where: {id: sessionData.userId}})
    if (!user) { throw new Error('user not found') }

    data.response.user = user.apiData(api)
    data.response.csrfToken = sessionData.csrfToken
    data.response.success = true
  }
}

exports.SessionWSAuthenticate = class SessionWSAuthenticate extends Action {
  constructor () {
    super()
    this.name = 'session:wsAuthenticate'
    this.inputs = {}
    this.blockedConnectionTypes = ['web']
  }

  async run (data) {
    data.response.success = false
    let sessionData = await api.session.load(data.connection)
    if (!sessionData) { throw new Error('Please log in to continue') }
    data.connection.authorized = true
    data.response.authorized = true
    data.response.success = true
  }
}
