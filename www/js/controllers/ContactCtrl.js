    	
app.controller('ContactCtrl',function($scope,$state,$rootScope,$ionicPopover,$ionicLoading,$rootScope,UserService,CouchDBServices,ContactsServices,MessagesService,$ionicHistory,socket,$timeout){
    $ionicHistory.clearHistory();
   
    var userInfo = UserService.getUser();
    $ionicPopover.fromTemplateUrl('templates/settings.html', {
           scope: $scope,
           }).then(function(popover) {
          $scope.popover = popover;
    });

         
    //  =========== CONTACT NUMBER VEFIRY =======
    $scope.verifyContact = function(contactNumber){
        $ionicLoading.show({
          template:'Loading...'
        })
        
        var _countryCode;
      	if(isNaN(UserService.countrycode))
      	{
      		_countryCode='+91'
      	}
      	else
      	{
      		_countryCode=UserService.countrycode;
      	}
        window.localStorage['countryCode']=_countryCode;
        var country;
        if(UserService.country!='undefined')
        {
            country=UserService.country;
        }
        else
        {
            country='India';
        }
        $rootScope.userDetails={
              _id:contactNumber,
              name:userInfo.name,
              phone:contactNumber,
              email:userInfo.email,
              fbId:userInfo.fbid,
              country:country,
              avatar:userInfo.avatar,
              isActive:"1",
              gender:userInfo.gender,
              status:userInfo.status,   
          }
          
  	    	 $rootScope.fetchContacts(_countryCode,false)
        
      }               
})

      
               