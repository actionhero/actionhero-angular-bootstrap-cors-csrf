const path = require('path')

exports['default'] = {
  plugins: (api) => {
    return {
      'myPlugin': { path: path.join(__dirname, '..', 'node_modules', 'ah-resque-ui') }
    }
  }
}
