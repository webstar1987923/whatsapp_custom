
app.controller('IntroCtrl', function($scope, $state,$ionicPlatform,$cordovaSQLite,$ionicSlideBoxDelegate,$rootScope,UserService,socket) {
            // Called to navigate to the main app
     
      $scope.next = function() {
            $ionicSlideBoxDelegate.next();
      };
      $scope.previous = function() {
            $ionicSlideBoxDelegate.previous();
      };
      $scope.startApp = function() {
            
            $state.go('login');
      };
      // Called each time the slide changes
      $scope.slideChanged = function(index) {
            $scope.slideIndex = index;
      };  
      
        
})
