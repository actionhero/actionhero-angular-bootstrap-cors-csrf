app.controller('dashboard', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location){
  if(!$rootScope.user){ $location.path('/'); }

  $rootScope.actionHelper($scope, {}, '/api/docs', 'GET', function(data){
    var actions = [];
    for(var key in data.documentation){
      for(var version in data.documentation[key]){
        actions.push(data.documentation[key][version]);
      }
    }

    $scope.actions = actions;
  });
}]);