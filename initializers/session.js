const crypto = require('crypto')
const util = require('util')
const {Initializer, api} = require('actionhero')

module.exports = class SessionInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'session'
  }

  async initialize () {
    const redis = api.redis.clients.client

    api.session = {
      prefix: 'session:',
      ttl: 60 * 60 * 24, // 1 day

      load: async (connection) => {
        const key = api.session.prefix + connection.fingerprint

        let data = await redis.get(key)
        if (!data) { return false }
        return JSON.parse(data)
      },

      create: async (connection, user) => {
        const key = api.session.prefix + connection.fingerprint
        const randomBuffer = await util.promisify(crypto.randomBytes)(64)
        const csrfToken = randomBuffer.toString('hex')

        const sessionData = {
          userId: user.id,
          csrfToken: csrfToken,
          sesionCreatedAt: new Date().getTime()
        }

        await user.updateAttributes({lastLoginAt: new Date()})
        await redis.set(key, JSON.stringify(sessionData))
        await redis.expire(key, api.session.ttl)
        return sessionData
      },

      destroy: async (connection) => {
        const key = api.session.prefix + connection.fingerprint
        await redis.del(key)
      },

      middleware: {
        'logged-in-session': {
          name: 'logged-in-session',
          global: false,
          priority: 1000,
          preProcessor: async (data) => {
            const sessionData = await api.session.load(data.connection)
            if (!sessionData) { throw new Error('Please log in to continue') }
            if (
              (data.action.indexOf('resque') < 0) &&
              (!data.params.csrfToken || data.params.csrfToken !== sessionData.csrfToken)
            ) { throw new Error('CSRF error') }

            data.session = sessionData
            const key = api.session.prefix + data.connection.fingerprint
            await redis.expire(key, api.session.ttl)
          }
        }
      }
    }

    api.actions.addMiddleware(api.session.middleware['logged-in-session'])
    api.params.globalSafeParams.push('csrfToken')
  }
}
