app.controller('about', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
  $rootScope.actionHelper($scope, {}, '/api/status', 'GET', function (data) {
    $scope.serverStatus = JSON.stringify(data, null, '    ')
  })
}])
