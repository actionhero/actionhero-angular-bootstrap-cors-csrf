const {Task, api} = require('actionhero')

exports.task = class Clock extends Task {
  constructor () {
    super()
    this.name = 'clock'
    this.description = 'clock'
    this.frequency = 10 * 1000
    this.queue = 'default'
  }

  async run (params) {
    await api.chatRoom.broadcast({id: 'CLOCK'}, 'chat', `the time is: ${new Date()}`)
  }
}
