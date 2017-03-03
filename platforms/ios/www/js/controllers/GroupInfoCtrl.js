app.controller('GroupInfoCtrl', function($scope, $state,$ionicPlatform,$ionicHistory, $http,NODE_SERVER_ADDRESS,$timeout,$cordovaFileTransfer,$cordovaToast,$cordovaSQLite,$ionicSlideBoxDelegate,$rootScope,UserService,socket,$ionicLoading, $ionicNavBarDelegate,$ionicActionSheet,$cordovaCamera) {

//$ionicNavBarDelegate.showBackButton(true);

	$scope.$on('$ionicView.enter', function() {
	    $rootScope.hideTabs = 'tabs-item-hide';
		$scope._toUserDetail= UserService.getToUserData();
		
		 $scope.loginUid=UserService.getLoginUser();
	})

	$scope.$on('$ionicView.beforeEnter', function() {
	    $rootScope.hideTabs = 'tabs-item-hide';
	
	})
 	$scope.myGoBack = function(){
    	$ionicHistory.goBack();
    }

	$scope.addParticipants = function ()
	{
		$state.go('tab.addparticipants')
	}

	$scope.removeMember = function(data)
	{
	
		var groupId = UserService.getToUserData().groupId;
		if($scope.loginUid!=data._id && $scope.loginUid==$rootScope.groupAdmin)
		{
			var hideSheet = $ionicActionSheet.show({
	          buttons: [
	            { text: '<button class="button button-positive">Remove Member</button>',
	              type: 'button'
	            },
	          ],
	          cancelText: 'Cancel',
	          cancel: function() {
	               // add cancel code..
	             },
	          buttonClicked: function(index) {
	          	if(index==0)
	          	{
	          		$ionicLoading.show({
								template:'Member Removing...'
						})
	          		$timeout(function(){
			    		$cordovaToast.show('Remove member successfully ', 'short', 'center').then(function(success) {
				              }, function (error) {
				              });
			    		$ionicLoading.hide()
			    		$state.go('tab.chats')
		    		},2000)
	  			    socket.emit('Group Member Manage',{groupId:groupId,userId:data._id,isType:7})
	  			    //return true;
	          	}
	          }
		    })
		}
	}

	$scope.exitGroup = function()
	{
		if($scope.loginUid!=$rootScope.groupAdmin)
		{
			var groupId = UserService.getToUserData().groupId;
			$ionicLoading.show({
						template:'Please Wait...'
				})
      		$timeout(function(){
	    		$cordovaToast.show('Remove member successfully ', 'short', 'center').then(function(success) {
		              }, function (error) {
		              });
	    		$ionicLoading.hide()
	    		$state.go('tab.chats')
    		},2000)
			socket.emit('Group Member Manage',{groupId:groupId,userId:$scope.loginUid,isType:8})

		}
	}

	$scope.deleteGroup = function(){
		var groupId = UserService.getToUserData().groupId;
		if($scope.loginUid!=$rootScope.groupAdmin)
		{
			$ionicLoading.show({
				template:'Please wait'
			})
			
			var deleteGrp= "DELETE FROM tbl_groups where groupId='"+groupId+"'";
			$cordovaSQLite.execute(sqlitedb, deleteGrp, []).then(function(ress){
			
			})

			var deleteChats= "DELETE FROM tbl_message where groupId='"+groupId+"'";
			$cordovaSQLite.execute(sqlitedb, deleteChats, []).then(function(ress){
				
				$timeout(function(){
					$ionicLoading.hide();
					$state.go('tab.chats')

				},1000)
			})
		}
	}

	$scope.editImage=function(){
		if($rootScope.isActiveGroup==1)
		{
				var groupId = UserService.getToUserData().groupId;
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
			    	$ionicLoading.show({
								template:'Please Wait...'
						})
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
			          

			        }
			         $cordovaCamera.getPicture(options).then(function (imageData) {
			         	    console.log("file url data"+imageData);
			         	    var options = {
						        fileKey: "uploadFile",
						        fileName:groupId+'.jpg',
						        chunkedMode: false,
						        mimeType: "image/jpg",
						        httpMethod :'POST',
						    };
		    	    		var server = NODE_SERVER_ADDRESS+"getFile/";
						    var filePath = imageData;

						    $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
						    	$scope._toUserDetail.avatar = imageData;
					    	    $ionicLoading.hide();
								socket.emit('Group Member Manage',{groupId:groupId,userId:$scope.loginUid,isType:9})
					    	    $cordovaToast.show('update group icon successfully ', 'short', 'center').then(function(success) {
					              }, function (error) {
					              });

					    	})
			         	    
		               //$scope.sendImage($scope.update_profile.avatar)
		               }, function (err) {
			               // An error occured. Show a message to the user
			         });
			          return true;
				}
			 });
		}
		
	}

	$scope.editGroup = function()
	{
		$state.go('tab.editGroupName')
	}

	$scope.changeGroupName = function(){
		var groupId = UserService.getToUserData().groupId;

			
		if($rootScope.isActiveGroup==1)
		{

			$ionicLoading.show({
				template:'Please wait'
			})
           
            socket.emit('Group Member Manage',{groupId:groupId,userId:$scope.loginUid,groupName:$scope._toUserDetail.name,isType:10});
            $timeout(function(){
		    	$cordovaToast.show('Update group name successfully ', 'short', 'center').then(function(success) {
			           }, function (error) {
			    });
		    	$ionicLoading.hide()
		    	$state.go('tab.chats')
    		},2000)

           
		}
	}

})
