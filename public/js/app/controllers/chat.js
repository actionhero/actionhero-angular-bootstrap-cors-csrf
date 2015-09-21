app.controller('chat', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location){
  
  $scope.formData = {};
  $scope.chats = [];
  $scope.room = 'chat';

  $scope.processForm = function(){
    $scope.ws.say($scope.room, $scope.formData.say);
    delete $scope.formData.say;
  };

  $scope.appendMessage = function(message){
    if(message.context === 'user'){
      var who;
      if(message.from === $scope.ws.id){
        who = 'me';
      }else{
        var parts = message.from.split('-');
        who = parts[0];
      }
      $scope.chats.unshift({
        when: new Date(message.sentAt),
        who: who,
        message: message.message,
      });
    }else{
      $scope.chats.unshift({
        when: new Date(),
        who: 'API',
        message: message.welcome,
      });
    }

    while($scope.chats.length > 10){
      $scope.chats.pop();
    }

    $rootScope.$apply();
  };
  
  $scope.ws = new ActionheroClient;

  $scope.ws.on('connected',    function(){ console.log('connected!'); });
  $scope.ws.on('disconnected', function(){ console.log('disconnected :('); });
  $scope.ws.on('error',        function(err){ console.log('error', err.stack); });
  $scope.ws.on('reconnect',    function(){ console.log('reconnect'); });
  $scope.ws.on('reconnecting', function(){ console.log('reconnecting'); });    
  $scope.ws.on('welcome',      function(message){ $scope.appendMessage(message); });
  $scope.ws.on('say',          function(message){ $scope.appendMessage(message); });
  
  $scope.ws.connect(function(err, details){
    if(err){
      console.log(err);
    }else{
      $scope.ws.action('session:wsAuthenticate', function(data){
        $scope.ws.roomAdd($scope.room);
      });
    }
  });

}]);