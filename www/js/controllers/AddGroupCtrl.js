
app.controller('AddGroupCtrl', function($scope,$ionicHistory,$ionicActionSheet,$cordovaFileTransfer,$cordovaFile,$cordovaToast,$cordovaCamera,$timeout, $state,$ionicPlatform,$cordovaSQLite,$ionicSlideBoxDelegate,$rootScope,UserService,socket) {
  
    $scope.myGoBack = function(){
    	$ionicHistory.goBack();
    }
    

    $scope.$on("$ionicView.enter", function(event, data){
		  $rootScope.data={
	    	profileImage:'',
	    	groupName:''
	    }
	});
	
 
	$scope.uploadImage=function(){
		var editProfile = $ionicActionSheet.show({
	    titleText: '<font color="black">Choose Picture Source</font>',
	    buttons: [
	        {
	            text: '<button class="button button-positive"><i class="icon ion-camera">                               </i>Camera</button>',
	            type: 'button'
	        },
	        {
	            text: '<i class="icon ion-images"></i>Photo Gallery',
	            type: 'button button-positive'
	        }
	    ],
	    cancelText: 'Cancel',
	    buttonClicked: function (index) {
	        if (index === 0) {
	             var options = {
	                quality: 75,
	                destinationType: Camera.DestinationType.FILE_URI,
	                sourceType: Camera.PictureSourceType.CAMERA,
	                allowEdit: true,
	                encodingType: Camera.EncodingType.JPEG,
	                targetWidth: 300,
	                targetHeight: 300,
	                popoverOptions: CameraPopoverOptions,
	                saveToPhotoAlbum: false
	            } 
	             editProfile();         

	        }  if (index === 1) {
	          //alert("inside gallary");
	           var options = {
	           quality: 75,
	           destinationType: Camera.DestinationType.FILE_URI,
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
	         	    console.log("file url data"+imageData);
	         	    $rootScope.data.profileImage = imageData;

               //$scope.sendImage($scope.update_profile.avatar)
               }, function (err) {
	               // An error occured. Show a message to the user
	         });
		}
	 });
	}

	$scope.nextStep = function(){
		if($rootScope.data.profileImage!='' && $rootScope.data.groupName!='')
		{
			$state.go('creategroup');
		}
		else
		{
			if($rootScope.data.profileImage=='' && $rootScope.data.groupName!='')
			{
				 $cordovaToast.show('Please provide group icon and group subject ', 'short', 'center').then(function(success) {
	              }, function (error) {
	              });
			}
			else if($rootScope.data.profileImage=='')
			{	
				 $cordovaToast.show('Please provide group icon ', 'short', 'center').then(function(success) {
	              }, function (error) {
	              });
			}
			else
			{
				 $cordovaToast.show('Please provide group subject ', 'short', 'center').then(function(success) {
	              }, function (error) {
	              });
			}
		}
	}

})
