app.controller('NewChatCtrl',function($scope,socket,$timeout,$cordovaContacts,$ionicListDelegate,$ionicScrollDelegate,$state,$rootScope,$ionicLoading,$cordovaLocalNotification,$ionicHistory,MessagesService,UserService,socket,$cordovaSQLite,CouchDBServices,$ionicActionSheet, $cordovaCamera, $ionicNavBarDelegate) {

  // $ionicNavBarDelegate.showBackButton(false);

  $scope.myGoBack = function(){
      $ionicHistory.goBack();
  }

  $scope.chooseImage = function() {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: '<button class="button button-positive"><i class="icon ion-camera">                               </i>Take Photo</button>',
              type: 'button'
            },
            { text: '<i class="icon ion-images"></i>Photo Gallery',
              type: 'button button-positive'
            }
          ],
          cancelText: 'Cancel',
          cancel: function() {
               // add cancel code..
             },
          buttonClicked: function(index) {

            if(index === 0){ // Manual Button
               var options = {
                  quality : 75,
                  destinationType : Camera.DestinationType.DATA_URL,
                  sourceType : Camera.PictureSourceType.CAMERA,
                  allowEdit : true,
                  encodingType: Camera.EncodingType.JPEG,
                  targetWidth: 220,
                  targetHeight: 220,
                  popoverOptions: CameraPopoverOptions,
                  saveToPhotoAlbum: false
              };
             }
             else if(index === 1){
                var options = {
                      quality : 75,
                      destinationType : Camera.DestinationType.DATA_URL,
                      sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
                      allowEdit : true,
                      encodingType: Camera.EncodingType.JPEG,
                      targetWidth: 200,
                      targetHeight: 200,
                      popoverOptions: CameraPopoverOptions,
                      saveToPhotoAlbum: false
                };
             }

             $cordovaCamera.getPicture(options).then(function(imageData) {
                  $scope.imgChatURI = "data:image/jpeg;base64," + imageData;
              }, function(err) {
                  // An error occured. Show a message to the user
                  console.log('helpppp a error ocurred');
              });
            return true;
          }
        });
    };

    $scope.shownCategory = false;

    $scope.toggleCategory = function() {
          $scope.shownCategory = !$scope.shownCategory;
    }




})
/*END APP.CONTROLLER*/
