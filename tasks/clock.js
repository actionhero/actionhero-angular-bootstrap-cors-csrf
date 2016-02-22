exports.task = {
  name:          'clock',
  description:   'clock',
  frequency:     10 * 1000,
  queue:         'default',
  plugins:       [],
  pluginOptions: {},

  run: function(api, params, next){
    api.chatRoom.broadcast({id: 'CLOCK'}, 'chat', 'the time is: ' + new Date(), next);
  }
};
