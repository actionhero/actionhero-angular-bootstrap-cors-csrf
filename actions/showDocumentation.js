'use strict'
const ActionHero = require('actionhero')

module.exports = class ShowDocumentation extends ActionHero.Action {
  constructor () {
    super()
    this.name = 'showDocumentation'
    this.description = 'return API documentation'
    this.middleware = ['logged-in-session']
  }

  outputExample () {
    return {
      documentation: {
        status: {
          1: {
            name: 'status',
            version: 1,
            description: 'I will return some basic information about the API',
            inputs: {

            }
          }
        }
      }
    }
  }

  run ({ response }) {
    const { documentation } = ActionHero.api
    response.documentation = documentation.documentation
  }
}
