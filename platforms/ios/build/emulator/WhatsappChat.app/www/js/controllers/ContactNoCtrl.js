app.controller('ContactsNoCtrl', function($scope,$q,$http,$rootScope,$ionicPopover,$state,CouchDBServices,UserService,$rootScope,$ionicScrollDelegate) {

     var db_contact = new PouchDB('contact',{adapter: 'localstorage'});

  $scope.countrycode=window.localStorage['countryCode'];
  $scope.loginUser=UserService.getLoginUser();
  $ionicPopover.fromTemplateUrl('templates/settings.html', {
       scope: $scope,
       }).then(function(popover) {
      $scope.popover = popover;
  });

  $scope.Profile = function(){
        $scope.popover.hide();
      $state.go('userprofile');
  }

  var updateContact = $rootScope.$on('updateContact',function(){
    $scope.getContact('0');
  })
  $scope.$on('$destroy', function() {
          updateContact();
      });


 
  $scope.loginUser=UserService.getLoginUser();
  $scope.results=[];
  $scope.myValue=true;
  $scope.mySpinner=false;
  $scope.contactCheck=false;



  $scope.getContact = function(offset)
  {
    //$scope.results=[];
       $scope.offset=offset;

       console.log("all docs fetch.....");
       db_contact.allDocs({
          include_docs:true,
          attachments:true,
        }, function(err, response){
          
          if(err) { 
            return console.log(err); 
          }
            console.log('get contact '+JSON.stringify(response));
            $rootScope.userContactList = response;
            $scope.contactCheck=true;
            $scope.myValue=false;
            $scope.mySpinner=false;

            var contactArrays2=[];
            var contactArrays1=response.rows.filter(function(a){
              if(a.doc.isUser=='0')
              contactArrays2.push(a);
              return a.doc.isUser=='1';
            });

            contactArrays1.sort(function(a,b){
              var keyA = a.doc.name, keyB = b.doc.name;
             
                  if(a.doc.name!=undefined && a.doc.name!=null){             
                      keyA=a.doc.name+"";
                  }else{
                      keyA='';
                  }

                  if(b.doc.name!=undefined && b.doc.name!=null){              
                      keyB=b.doc.name;
                  }else{
                      keyB='';
                  }

                  if(keyA.toUpperCase() < keyB.toUpperCase()) {
                    return -1;
                  }               
                  else if(keyA.toUpperCase() > keyB.toUpperCase()){   
                    return 1;
                  }
            });

            contactArrays2.sort(function(a,b){
              var keyA = a.doc.name, keyB = b.doc.name;
             
                  if(a.doc.name!=undefined && a.doc.name!=null){             
                      keyA=a.doc.name+"";
                  }else{
                      keyA='';
                  }

                  if(b.doc.name!=undefined && b.doc.name!=null){              
                      keyB=b.doc.name;
                  }else{
                      keyB='';
                  }

                  if(keyA.toUpperCase() < keyB.toUpperCase()) {
                    return -1;
                  }               
                  else if(keyA.toUpperCase() > keyB.toUpperCase()){   
                    return 1;
                  }
            });

            var contactArrays = contactArrays1.concat(contactArrays2);

            var newArray = contactArrays.filter(function(obj) {
                return obj.doc.phone!==$scope.loginUser;
            });

            $rootScope.isLoadUpdateSpinner=false;
            $scope.results=newArray;
            // handle result
            console.log("all docs contacts >>>"+JSON.stringify($scope.results)); 

            $scope.$apply();
        });
  }

  $scope.chating = function(toUserData){
    if(toUserData.isUser==1)
    {
      UserService.setToUserData(toUserData);
      $state.go('chating')
    }
  }


})

