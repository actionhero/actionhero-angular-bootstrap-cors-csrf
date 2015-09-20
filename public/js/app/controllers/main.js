app.controller('pageController', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location){
  
  $scope.date = new Date();

  $rootScope.actionHelper($scope, {}, '/api/session', 'PUT', function(data){
    $rootScope.sessionCheck = true;
    if(data.user){ 
      $rootScope.user      = data.user; 
      $rootScope.csrfToken = data.csrfToken; 
    }
  }, function(error){
    $rootScope.sessionCheck = true;
    var matchedAndOK = false;
    var path = $location.path();

    if(path.indexOf('/r/') === 0){
      matchedAndOK = true;
    }

    $rootScope.routes.forEach(function(r){
      if( !matchedAndOK && path === r[0] && r[3] === false ){
        matchedAndOK = true;
      } 
    });

    if(matchedAndOK){
      // OK to be here logged-out
    }else{
      $location.path('/');
    }
  }, true);
  
  $scope.getNavigationHighlight = function(path){
    var parts = $location.path().split('/');
    var simplePath = parts[(parts.length - 1)];
    if (simplePath == path) {
      return "active";
    }else{  
      return "";
    }
  };
}]);