app.controller('UserProfileCtrl', function($scope,$state,$stateParams,$ionicNavBarDelegate,UserService,$ionicHistory,$ionicActionSheet,$cordovaCamera,CouchDBServices,$ionicLoading,$cordovaSQLite, $ionicModal){

	/*Like this we hide the back button default*/
	// $ionicNavBarDelegate.showBackButton(false);

	/*this function go to the screen before of current screen*/
	$scope.goBack = function(){
		$ionicHistory.goBack();
	}
	/*we are going to the user profile settings from main settings*/
	$scope.goToProfile = function(){
		$state.go('tab.userprofile');
	}
	$scope.goToAccount = function(){
		$state.go('tab.account');
	}
	$scope.goPrivacy = function(){
		$state.go('tab.privacy');
	}
	$scope.goSecurity = function(){
		$state.go('tab.security');
	}
	$scope.goChangeNumber = function(){
		$state.go('tab.change-number');
	}
	$scope.goDeleteAccount = function(){
		$state.go('tab.delete-account');
	}
	$scope.goSettingsChat = function(){
		$state.go('tab.settings-chat');
	}

	$scope.goSettingsWallpaper = function(){
		$state.go('tab.settings-wallpaper');
	}

	$scope.goWallpaperLibrary = function(){
		$state.go('tab.wallpaper-library');
		// socket.emit('Get All Wallpaper Files');
	}
	$scope.goPreviewWallpaper = function(src){
		$state.go('tab.wallpaper-preview');
		window.localStorage['wallpaper-preview'] = './'+ src;

	}

	$scope.goSettingsSound = function(){
		$state.go('tab.settings-sound');
	}

	/*Click on image to set the wallpaper on chat screen*/
	$scope.setWallpaper = function(){

		console.log("Set Wallpaper");
		var src = window.localStorage['wallpaper-preview'];
		$cordovaSQLite.execute(sqlitedb, 'update tbl_settings set settingvalue = "'+ src +'" where settingname == "wallpaper"').then(function(data) {
			console.log(angular.toJson(data));
			window.localStorage['wallpaper'] = src;
			$state.go('tab.wallpaper-library');
		})

	}

	$scope.goSettingsNotifications = function(){
		$state.go('tab.settings-notifications');
	}

	$scope.playSound = function(src, sound){
			$scope.soundNumber = sound;
			SoundPlayerService.playmssg(src);
			window.localStorage['sound-preview'] = src
	}

	$scope.setChatSound = function(){
		$cordovaSQLite.execute(sqlitedb, 'update tbl_settings set settingvalue = "'+ window.localStorage['sound-preview'] +'" where settingname == "sendsound"').then(function(data) {
			console.log(angular.toJson(data));
			window.localStorage['sendsound'] = window.localStorage['sound-preview'];
			$scope.goBack();
		})
	}

	$scope.update_profile={
       _id:UserService.getLoginUser(),
       name:UserService.getUser().name,
       about:UserService.getUser().about,
       email:UserService.getUser().email,
       fbid:UserService.getUser().fbid,
       phone:UserService.getLoginUser(),
       country:UserService.getUser().country,
       gender:UserService.getUser().gender,
       isActive:UserService.getUser().isActive,
       avatar:UserService.getUser().avatar,
       workAt:UserService.getUser().workAt,
       status:UserService.getUser().status
  };

    $scope.editprofile= function(){

		 var editProfile = $ionicActionSheet.show({
            // titleText: '<font color="black">Choose Picture Source</font>',
            buttons: [
                {
                    text: '<button class="button button-positive buttonDeletePhoto">Delete Photo</button>',
                    type: 'button'
                },
                {
                    text: '<button class="button button-positive">Take Photo</button>',
                    type: 'button'
                },
								{
                    text: '<button class="button button-positive">Choose Photo</button>',
                    type: 'button'
                }
            ],
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                if (index === 1) {
	                 var options = {
	                    quality: 75,
	                    destinationType: Camera.DestinationType.DATA_URL,
	                    sourceType: Camera.PictureSourceType.CAMERA,
	                    allowEdit: true,
	                    encodingType: Camera.EncodingType.JPEG,
	                    targetWidth: 300,
	                    targetHeight: 300,
	                    popoverOptions: CameraPopoverOptions,
	                    saveToPhotoAlbum: false
	                }
	                 editProfile();

                }  if (index === 2) {
                  //alert("inside gallary");
                   var options = {
                   quality: 75,
                   destinationType: Camera.DestinationType.DATA_URL,
                   sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                   allowEdit: true,
                   encodingType: Camera.EncodingType.JPEG,
                   targetWidth: 300,
                   targetHeight: 300,
                   popoverOptions: CameraPopoverOptions,
                   saveToPhotoAlbum: false
                   };
                    editProfile();

                }
                 $cordovaCamera.getPicture(options).then(function (imageData) {
                 	    $scope.update_profile.avatar = "data:image/jpeg;base64," +imageData;

                       $scope.sendImage($scope.update_profile.avatar)
                       }, function (err) {
                       // An error occured. Show a message to the user
                 });
			}
         });

    }



    $scope.sendImage= function(image) {
	    var profileData={
               _id:UserService.getLoginUser(),
               name:UserService.getUser().name,
               about:UserService.getUser().about,
               email:UserService.getUser().email,
               fbid:UserService.getUser().fbid,
               phone:UserService.getLoginUser(),
               country:UserService.getUser().country,
               gender:UserService.getUser().gender,
               isActive:UserService.getUser().isActive,
               avatar:image,
               workAt:UserService.getUser().workAt,
               status:UserService.getUser().status
        };

            CouchDBServices.updatuserprofile(profileData).then(function(res){
                    UserService.setUser({
                     name:res.name,
                     email:res.email,
                     fbid:res.fbid,
                     phone:res.phone,
                     country:res.country,
                     gender:res.gender,
                     isActive:res.isActive,
                     avatar:res.avatar,
                     //avatar:"http://192.168.1.9:1337/user/upload/"+res.fileName+"/",
                     status:res.status,
                     about:res.about,
                     workAt:res.workAt,
                     id:res._id,
                    })

                    $scope.$apply();

                 })
    }

    $scope.saveProfile = function(){
           $ionicLoading.show({
           	template:"Profile Uploading...."
           })
	      CouchDBServices.updatuserprofile($scope.update_profile).then(function(res){
	       		$ionicLoading.hide();
	            UserService.setUser({
	             name:res.name,
	             email:res.email,
	             fbid:res.fbid,
	             phone:res.phone,
	             country:res.country,
	             gender:res.gender,
	             isActive:res.isActive,
	             avatar:UserService.getUser().avatar,
	             status:res.status,
	             about:res.about,
	             workAt:res.workAt,
	             id:res._id,
	        })
     })
	}

	$scope.showImages = function() {
		$scope.showModal('templates/image-popoverProfile.html');
	}

	$scope.showModal = function(templateUrl) {
		$ionicModal.fromTemplateUrl(templateUrl, {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
			$scope.modal.show();
		});
	}

	// Close the modal
	$scope.closeModal = function() {
		$scope.modal.hide();
		$scope.modal.remove()
	};

	$scope.toUserProfileImage = $scope.update_profile.avatar;

})
