/////////////
// HELPERS //
/////////////

var routes = [
  // ROUTE        PAGE PARTIAL                  PAGE TITLE    REQUIRE LOGIN?
  [ '/',          'pages/index.html',           'Demo Site!', false        ],
  [ '/about',     'pages/about.html',           'About',      false        ],
  [ '/login',     'pages/session/create.html',  'Log In',     false        ],
  [ '/logout',    'pages/session/destroy.html', 'Log Out',    false        ],
  [ '/dashboard', 'pages/dashboard.html',       'Dashboard',  true         ],
  [ '/sign-up',   'pages/user/create.html',     'Sign Up',    false        ],
  [ '/settings',  'pages/user/edit.html',       'Edit User',  true         ],
];

/////////////////
// APPLICATION //
/////////////////

var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider, $locationProvider){
  
  routes.forEach(function(collection){
    var route = collection[0];
    var page  = collection[1];
    var title = collection[2];
    $routeProvider.when(route, {
      'templateUrl': page, 
      'pageTitle': title
    });
  });

});

app.run(['$rootScope', '$http', function($rootScope, $http){

  $rootScope.sessionCheck = false;
  $rootScope.user         = null;
  $rootScope.csrfToken    = null;
  $rootScope.routes       = routes;

  $rootScope.actionHelper = function($scope, data, path, verb, successCallback, errorCallback, skipSessionCheck){
    var i;
    if(typeof errorCallback !== 'function'){
      errorCallback = function(errorMessage){
        $scope.error = errorMessage;
      };
    }

    if(!skipSessionCheck){ skipSessionCheck = false; }

    if(skipSessionCheck === false && $rootScope.sessionCheck === false){
      console.log('waiting for session...');
      setTimeout(function(){
        $rootScope.actionHelper($scope, data, path, verb, successCallback, errorCallback, skipSessionCheck);
      }, 100);
    }else{
      if($rootScope.sessionCheck && !data.csrfToken){ data.csrfToken = $rootScope.csrfToken; }

      for(i in data){
        if(data[i] === null || data[i] === undefined){ delete data[i]; }
      }

      if(Object.keys(data).length > 0 && (verb === 'get' || verb === 'GET') && path.indexOf('?') < 0){
        path += '?';
        for(i in data){
          path += i + '=' + data[i] + '&';
        }
      }

      $http({
        method  : verb,
        url     : path,
        data    : $.param(data),  // pass in data as strings
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
       }).success(function(data){
        successCallback(data);
      }).catch(function(data){
        var errorMessage = '';
        if(data.data && data.data.error){
          errorMessage = data.data.error;
        }else{
          errorMessage = data.statusText + ' | ' + data.status;
        }
        errorCallback(errorMessage);
      });
    }
  };

  $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
    $rootScope.pageTitle = current.$$route.pageTitle;
  });
}]);
