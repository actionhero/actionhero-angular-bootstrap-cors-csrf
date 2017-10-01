const {Action, api} = require('actionhero')

exports.UserCreate = class UserCreate extends Action {
  constructor () {
    super()
    this.name = 'user:create'
    this.description = this.name
    this.inputs = {
      email: { required: true },
      password: { required: true },
      firstName: { required: true },
      lastName: { required: true }
    }
  }

  async run (data) {
    let user = await api.models.user.build(data.params)
    await user.updatePassword(data.params.password)
    await user.save()
    await user.reload()
    data.response.user = user.apiData(api)
  }
}

exports.UserView = class UserView extends Action {
  constructor () {
    super()
    this.name = 'user:view'
    this.description = this.name
    this.middleware = [ 'logged-in-session' ]
    this.inputs = {}
  }

  async run (data) {
    let user = await api.models.user.findOne({where: {id: data.session.userId}})
    if (!user) { throw new Error('user not found') }
    data.response.user = user.apiData(api)
  }
}

exports.UserEdit = class UserEdit extends Action {
  constructor () {
    super()
    this.name = 'user:edit'
    this.description = this.name
    this.middleware = [ 'logged-in-session' ]
    this.inputs = {
      email: { required: false },
      password: { required: false },
      firstName: { required: false },
      lastName: { required: false }
    }
  }

  async run (data) {
    let user = await api.models.user.findOne({where: {id: data.session.userId}})
    if (!user) { throw new Error('user not found') }

    await user.updateAttributes(data.params)
    data.response.user = user.apiData(api)

    if (data.params.password) {
      await user.updatePassword(data.params.password)
      await user.save()
    }
  }
}
