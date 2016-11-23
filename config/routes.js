exports.default = {
  routes: function (api) {
    return {

      get: [
        { path: '/user', action: 'user:view' },
        { path: '/docs', action: 'showDocumentation' },
        { path: '/status', action: 'status' }
      ],

      post: [
        { path: '/session', action: 'session:create' },
        { path: '/user', action: 'user:create' }
      ],

      put: [
        { path: '/session', action: 'session:check' },
        { path: '/user', action: 'user:edit' }
      ],

      delete: [
        { path: '/session', action: 'session:destroy' },
        { path: '/registry', action: 'registry:destroy' }
      ]

    }
  }
}
