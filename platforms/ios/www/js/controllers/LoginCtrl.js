app.controller('LoginCtrl', function($scope,$state,$ionicLoading,UserService,$q,$ionicHistory){

//Remove all history
$ionicHistory.clearHistory();
// var openDatabase = require('websql');
// alert(openDatabase)

var fbUserSuccess = function(auth_response){

var authResponse = auth_response;
getFacebookProfileInfo(authResponse).then(function(profileInfo){

    //for the purpose of this example I will store user data on local storage
     UserService.setUser({
         authResponse:authResponse,
         fbid: profileInfo.id,
         name: profileInfo.name,
           email: profileInfo.email,
           first_name:profileInfo.first_name,
         last_name:profileInfo.last_name,
         gender:profileInfo.gender,
         birthday:profileInfo.birthday,
        // likes:profileInfo.likes.data,
         about:profileInfo.bio,
         workAt:profileInfo.work,  
         status:"Hey There i am using SOTERIA", 
         avatar : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
     });

     $ionicLoading.hide();
     
     $state.go('contact-number');
      // alert("fb login success"+JSON.stringify(profileInfo));

     },function(fail){
        //fail get profile info
        console.log('profile info fail', fail);
     });

};


var fbLoginSuccess = function(response)
{
    if(!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;
    fbUserSuccess(authResponse);
};
               //This is the fail callback from the login method
var fbLoginError = function(error){
    $ionicLoading.hide();
};

//this method is to get the user profile info from the facebook api
var getFacebookProfileInfo = function(authResponse){

     var info = $q.defer();
     facebookConnectPlugin.api('/me?fields=id,name,email,first_name,last_name,about,gender,bio,birthday,likes&access_token=' + authResponse.accessToken, null,
               function (response) {
                  //  console.log(response);
                  info.resolve(response);
               },
               function (response) {
                  // console.log(response);
                  info.reject(response);
      });
      return info.promise;
};

//This method is executed when the user press the "Login with facebook" button
$scope.facebookSignIn = function() {
     facebookConnectPlugin.getLoginStatus(function(success)
     {
         if(success.status === 'connected')
         {
            var user = UserService.getUser('facebook');
            if(!user.fbid)
            {
              fbUserSuccess(success.authResponse);
            }
            else
            {
                //alert("Login status connected..."+JSON.stringify(user));
                $state.go('contact-number');
            }

         } 
         else
         {
             $ionicLoading.show({
                template: 'Logging in...'
             });
             ///  , 'public_profile','user_likes','user_about_me','user_birthday','user_friends','user_relationships','user_work_history'
             facebookConnectPlugin.login(['email','public_profile'], fbLoginSuccess, fbLoginError);
         
         }

      });
    };


    
})