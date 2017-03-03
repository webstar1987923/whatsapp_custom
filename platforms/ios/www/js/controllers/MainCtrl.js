
app.controller('MainCtrl', function($scope, $state,socket,$timeout,$cordovaToast,$ionicPopover,$ionicHistory,$rootScope,CouchDBServices,ContactsServices,$ionicLoading,MessagesService,UserService) {
            // Called to navigate to the main app
var refreshContact = $rootScope.$on('refreshContact',function(){
  
    var countrycode=window.localStorage['countryCode'];
  $rootScope.fetchContacts(countrycode);
})
$scope.$on('$destroy', function() {
      refreshContact();
});


$scope.updateUserInfo = function(simContacts,isToster){
        // check phone number exits or not
        CouchDBServices.getDocuments(simContacts).then(function(appUsers){
          // console.log("fetched app users"+JSON.stringify(appUsers));
          if(appUsers.rows.length!=0)
          {
              angular.forEach(appUsers.rows,function(user){
                 
                  if('doc' in user){

                      if(user.doc!=null){
                          
                          CouchDBServices.updateContactPouchDB(user.doc.phone,user.doc).then(function(success){
                   
                              console.log("updated remote contacts, saving to local storage"+JSON.stringify(success));
                                  // $state.go('tab.chats');
                              

                           },function(err){
                              console.log("error when updating document");
                              q.reject(err);
                          });

                      }
                    }

              })

          }
          
         
          if($ionicHistory.currentStateName()=='contact-number')
          {
           
              $ionicLoading.hide();
              $state.go('tab.chats');
          }    
          else
          {
            $ionicLoading.hide();
            $timeout(function(){
            $rootScope.$broadcast('updateContact')

            },1500)
          }

          if(isToster)
          {
              $cordovaToast.showShortCenter('Your contact update successfully...').then(function(success) {
                // success
              }, function (error) {
                // error
              });
          }
                
        })  
}

$rootScope.fetchContacts = function(_countryCode,isToster){
            console.log("after fetchContacts")
            
       $rootScope.isLoadUpdateSpinner=true;
       if($ionicHistory.currentStateName()=='tab.contact')
       {
            $scope.popover.hide();
       }
      ContactsServices.getSimJsonContacts(_countryCode).then(function(responce){
            console.log("after getSimJsonContacts")

          $scope.simContacts=responce.mobiles;
          $scope.simJsonContacts=responce.phones;
          // alert("Before Insert >>>"+$scope.simJsonContacts);
          // insert data into pouchDb
          CouchDBServices.insertContactPouchDB($scope.simJsonContacts).then(function(res){
                        console.log("after insertContactPouchDB")

            // IF IS TOSTER IS FALSE IT MEANS USER LOGIN FIRST TIME , TRUE MENAS USER REFRESH HIS CONTACT
            if(!isToster)
            {
              CouchDBServices.registeruser($rootScope.userDetails).then(function(res){
                if(res!=false)
                {
                  UserService.setUser(res)
                  UserService.setLoginUser(res._id);
                  // PushNotification.registerDevices().then(function(response){
                  // });
                  socket.emit('new user',$rootScope.userDetails.phone,function(data){
                     if(data){
                     } else{
                     alert('That username is already taken!  Try again.');
                     }
                  })  
                }
                // else
                // {
                //   UserService.setLoginUser(contactNumber);
                // }
               })  
            }
            $scope.updateUserInfo($scope.simContacts,isToster);                     
          })
      })

};

   
})
