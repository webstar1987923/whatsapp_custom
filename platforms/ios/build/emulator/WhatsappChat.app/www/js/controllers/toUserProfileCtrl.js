app.controller('toUserProfileCtrl', function($scope,$state,$stateParams,$ionicHistory, UserService, $ionicNavBarDelegate, $rootScope, $ionicModal){
	 var userdata=$stateParams.toUserData;
	 $scope.toUserProfileName=userdata.name;
	 $scope.toUserProfileImage=userdata.avatar;
	 $scope.toUserProgileAbout=userdata.about;
	 $scope.toUserProfileworkAt=userdata.workAt;
	 $scope.UserNumber = userdata.phone;
	 $scope.toUserStatus = userdata.status;
	 console.log(userdata);

	 $scope.userData = userdata;
 

	//  $ionicNavBarDelegate.showBackButton(false);

	 $scope.myGoBack = function()
     {
       $ionicHistory.goBack();
     }
	 $scope.chating = function(toUserData){
		 UserService.setToUserData(toUserData);
		 $state.go('tab.chating')
 	}

	$scope.showImages = function() {
		$scope.showModal('templates/image-popover.html');
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

})
