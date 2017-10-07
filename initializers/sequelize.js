const path = require('path')
const fs = require('fs')
const Sequelize = require('sequelize')
const {Initializer, api} = require('actionhero')

module.exports = class SequelizeInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'sequelize'
    this.loadPriority = 100
    this.startPriority = 100
  }

  async initialize () {
    api.models = {}

    const sequelizeInstance = new Sequelize(
      api.config.sequelize.database,
      api.config.sequelize.username,
      api.config.sequelize.password,
      api.config.sequelize
    )

    api.sequelize = {
      sequelize: sequelizeInstance,

      connect: async () => {
        const dir = path.normalize(api.projectRoot + '/models')
        fs.readdirSync(dir).forEach((file) => {
          var nameParts = file.split('/')
          var name = nameParts[(nameParts.length - 1)].split('.')[0]
          api.models[name] = api.sequelize.sequelize.import(dir + '/' + file)
        })

        await api.sequelize.sequelize.sync()
      },

      disconnect: async () => {
        await api.sequelize.sequelize.close()
      }
    }
  }

  async start () {
    await api.sequelize.connect()
  }

  async stop () {
    await api.sequelize.disconnect()
  }
}
