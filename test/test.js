const should = require('should')
const ActionHero = require('actionhero')

const actionhero = new ActionHero.Process()
var api
var csrfToken
var connection

const truncate = async () => {
  try {
    await api.sequelize.sequelize.query('truncate table users')
  } catch (error) {
    if (!String(error).match(/Table .* doesn't exist/)) { throw error }
  }
}

describe('general:applicaiton', () => {
  before(async () => {
    api = await actionhero.start()
    await truncate()
    connection = new api.specHelper.Connection()
  })

  after(async () => { await actionhero.stop() })

  it('can boot', () => {
    api.running.should.equal(true)
  })

  it('can access unprotected actions without logging in', async () => {
    connection.params = {}
    let response = await api.specHelper.runAction('status', connection)
    should.not.exist(response.error)
    response.id.should.match(/test-server/)
  })

  it('cannot access protected actions without logging in', async () => {
    connection.params = {}
    let response = await api.specHelper.runAction('showDocumentation', connection)
    response.error.should.equal('Error: Please log in to continue')
  })

  it('can create a user (success)', async () => {
    connection.params = {
      firstName: 'first',
      lastName: 'last',
      email: 'fake@fake.com',
      password: 'password'
    }
    let response = await api.specHelper.runAction('user:create', connection)
    should.not.exist(response.error)
    should.exist(response.user)
  })

  it('can create a user (fail, duplicate)', async () => {
    connection.params = {
      firstName: 'first',
      lastName: 'last',
      email: 'fake@fake.com',
      password: 'otherpassword'
    }
    let response = await api.specHelper.runAction('user:create', connection)
    response.error.should.equal('Error: users_email must be unique')
    should.not.exist(response.user)
  })

  it('can create a user (fail, missing param)', async () => {
    connection.params = {
      firstName: 'first',
      email: 'fake@fake.com',
      password: 'password'
    }
    let response = await api.specHelper.runAction('user:create', connection)
    response.error.should.equal('Error: lastName is a required parameter for this action')
    should.not.exist(response.user)
  })

  it('can log in', async () => {
    connection.params = {
      email: 'fake@fake.com',
      password: 'password'
    }
    let response = await api.specHelper.runAction('session:create', connection)
    should.not.exist(response.error)
    should.exist(response.user)
    should.exist(response.csrfToken)
    csrfToken = response.csrfToken
  })

  it('can view my user', async () => {
    connection.params = { csrfToken: csrfToken }
    let response = await api.specHelper.runAction('user:view', connection)
    should.not.exist(response.error)
    should.exist(response.user)
  })

  it('can edit my user', async () => {
    connection.params = {
      csrfToken: csrfToken,
      firstName: 'newName'
    }
    let response = await api.specHelper.runAction('user:edit', connection)
    should.not.exist(response.error)
    should.exist(response.user)
    response.user.firstName.should.equal('newName')
  })

  it('can access protected actions when logged in + csrf', async () => {
    connection.params = { csrfToken: csrfToken }
    let response = await api.specHelper.runAction('showDocumentation', connection)
    should.not.exist(response.error)
  })

  it('cannot access protected actions when logged in without csrf', async () => {
    connection.params = {}
    let response = await api.specHelper.runAction('showDocumentation', connection)
    response.error.should.equal('Error: CSRF error')
  })
})
