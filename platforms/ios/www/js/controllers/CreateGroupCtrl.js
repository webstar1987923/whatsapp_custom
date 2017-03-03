         app.controller('CreateGroupCtrl', function($scope,$ionicHistory,$ionicLoading,$http,$cordovaFileTransfer, $cordovaToast,GroupMessageService,NODE_SERVER_ADDRESS,$ionicScrollDelegate,CouchDBServices,$location,$ionicActionSheet,$cordovaToast,$timeout, $state,$ionicPlatform,$cordovaSQLite,$ionicSlideBoxDelegate,$rootScope,UserService,socket) {
 
    $scope.myGoBack = function(){
    	$ionicHistory.goBack();
    }
     var db_contact = new PouchDB('contact',{adapter: 'localstorage'});
	$scope.contactList =[];
	$scope.groupMemberContact = [];
	$scope.TopHeader = "115px";
	$scope.data={
		searchContact:''
	}

	// === initial blank contact list array ====//
	$scope.$on('$ionicView.enter', function() {
		$scope.contactList = [];
		$scope.groupMemberContact = []
  	})  

   //  =====  GET CONTACT FROM POUCH DB ======
	$scope.getContact = function(isPage){

		if($rootScope.userContactList)
		{
			$scope.userContact($rootScope.userContactList,isPage)
		}
		else
		{
			$ionicLoading.show({
				template:"Fetch contact..."
			})
			db_contact.allDocs({
			  include_docs: true,
			  attachments: true
			}).then(function (result) {
				$ionicLoading.hide();
				$scope.userContact(result,isPage);
				// $rootScope.userContactList =  result;
			  // handle result
			}).catch(function (err) {
				$ionicLoading.hide();
			  console.log(err);
			});
		}
		
	}

	$scope.userContact = function(result,isPage)
	{	
		for(var i=0;i<result.rows.length;i++)
		{   

			// ====== add only those member who use over app.
			if(result.rows[i].doc.isUser==1 && result.rows[i].doc._id!=UserService.getLoginUser())
			{
				if(result.rows[i].doc.name)
				{
					$scope.contactList.push(result.rows[i]);
				}
				else
				{
					result.rows[i].doc.name = result.rows[i].doc.phone;
					$scope.contactList.push(result.rows[i]);
				}
			}
			
			// ==== all contact of phonebook
				
		}
		// $scope.$apply();
		$scope.contactList
	    .sort(function(a, b) {
	      return a.doc.name.toUpperCase() > b.doc.name.toUpperCase() ? 1 : -1;
	    })
		$scope.shortContact();	
	    if(isPage=='addparticipant')
	    {
	    	$scope.userContactList = [];
	    	// console.log("userContactList"+JSON.stringify($scope.contactList))
	    	// console.log("groupMembers"+JSON.stringify($rootScope.groupMembers))
	    	
	    	$scope.tempContactList = $scope.contactList;

	    	for(var i=0;i<$rootScope.groupMembers.length;i++)
	    	{
	    		for(var j=0;j<$scope.tempContactList.length;j++)
	    		{
	    			if($rootScope.groupMembers[i]._id==$scope.tempContactList[j].doc._id)
	    			{
	    				$scope.tempContactList.splice(j, 1);
	    				break;
	    			}
	    		}
	    	}
	    	//$scope.tempContactList

	    }
		
	}

    // ==== ADD GROUP MEMBER INTO GROUP =====
	$scope.addContact = function(data)
	{
		var memberData={
			userID:data.id,
			name:data.doc.name,
			phoneNumber:data.doc.phone,	
			avatar:data.doc.avatar
		}
		if(data.checked)
		{
			$scope.TopHeader = "165px";
			$scope.groupMemberContact.push(memberData);
			$scope.$apply();
		}
		else
		{
			for(var i=0; i<$scope.groupMemberContact.length; i++)
			{
				if($scope.groupMemberContact[i].userID==data.id)
				{
					$scope.groupMemberContact.splice(i,1)
					$scope.$apply();
					console.log("after remove contact"+JSON.stringify($scope.groupMemberContact));
					break;
				}	
			}
			if($scope.groupMemberContact.length<1)
			{
				$scope.TopHeader = "115px";
				$scope.$apply();
			}
		}
	}
   //Create alphabet object
	function iterateAlphabet()
	{
	    var str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	    var numbers = new Array();
	    for(var i=0; i<str.length; i++)
	    {
	      var nextChar = str.charAt(i);
	      numbers.push(nextChar);
		}
	   return numbers;
	}
    $scope.shortContact= function(){
		$scope.alphabet = iterateAlphabet();
		var tmp={};
		
		var users = $scope.contactList;
		// alert("$scope contactList length"+users.length)
		 for(i=0;i<users.length;i++){
		    var letter=users[i].doc.name.toUpperCase().charAt(0);
		    if( tmp[ letter] ==undefined){
		      tmp[ letter]=[]
		    }
		      tmp[ letter].push( users[i] );
		  }
	      $scope.sorted_users = tmp;
    } 

    // ======  custom search =====
    $scope.searchData = function()
    {
	  	var search =$scope.data.searchContact;
	  	$scope.alphabet = iterateAlphabet();
		var tmp={};
	  	$scope.dt=[];
	  	angular.forEach($scope.contactList, function(item){
	       	 var itemDoesMatch = !search ||
	        item.doc.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
	        item.doc.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
	      	if(itemDoesMatch)
	      	{
	      		$scope.dt.push(item)
	      	}
	      });
	  	var users = $scope.dt;
		 for(i=0;i<users.length;i++){
		    var letter=users[i].doc.name.toUpperCase().charAt(0);
		    if( tmp[ letter] ==undefined){
		      tmp[ letter]=[]
		    }
		      tmp[ letter].push( users[i] );
		  }
	      $scope.sorted_users = tmp;
	  
	      $scope.$apply();
      //Click letter event
	}

	$scope.createGroup = function(){
		$scope.isCreateButtonDisable = true;
		$ionicLoading.show({
			template:"Please Wait..."
		})
		
		$scope.groupMember = angular.copy($scope.groupMemberContact);

		$scope.groupMember.push({
			userID:UserService.getLoginUser(),
			name:UserService.getUser().name,
			phoneNumber:UserService.getUser().phone,
			avatar:UserService.getUser().avatar	
		})

	    var parameters={
				groupName:$rootScope.data.groupName,
				groupImage:'',
				createdByName:UserService.getUser().name,
				createdById:UserService.getLoginUser(),
				userId:UserService.getLoginUser(),
				groupMember:$scope.groupMember
		};

	    $http.post(NODE_SERVER_ADDRESS+'createGroup?'+JSON.stringify(parameters)).then(function (response) {
	           
	            var responseData=response.data.data;
	            var groupImage = NODE_SERVER_ADDRESS+'groupImages/'+responseData._id+'.jpg';
	            var parameter={
	            	id:responseData._id,
	            	groupImage:groupImage
	            }
	            $http.post(NODE_SERVER_ADDRESS+'updateGroupImage?'+JSON.stringify(parameter)).then(function(response){
	            });

	    		var server = NODE_SERVER_ADDRESS+"getFile/";
				var filePath = $rootScope.data.profileImage;
				var options = {
			        fileKey: "uploadFile",
			        fileName:responseData._id+'.jpg',
			        chunkedMode: false,
			        mimeType: "image/jpg",
			        httpMethod :'POST',
			    };
			    $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
			    	   $ionicLoading.hide();
			    	   socket.emit('send group Messages',{"message":UserService.getUser().name+" added you","isType":5,"name":responseData.name,"groupId":responseData._id,"groupImage":groupImage,"senderName":UserService.getUser().name,"senderImage":UserService.getUser().avatar,groupMembers:$scope.groupMember,createdById:responseData.userId})
						console.log('------groupImage----'+JSON.stringify(result))
						$cordovaToast.show('Group Created successfully ', 'short', 'center').then(function(success) {
				        }, function (error) {
				        });

				        $timeout(function(){
				    		$state.go('tab.chats')
				    	},2000)
			    }, function(err) {
			        console.log("ERROR: " + JSON.stringify(err));
			        //alert(JSON.stringify(err));
			    }, function (progress) {
			        // constant progress updates
			    });
	    });

	}
	$scope.addParticipant = function(userData)
	{	
		$ionicLoading.show({
			template:'Loading...'
		})
		var groupId = UserService.getToUserData().groupId;
		console.log("userData"+JSON.stringify(userData))
        console.log("add group member"+JSON.stringify({groupId:groupId,userId:userData.id}))

	    socket.emit('Group Member Manage',{groupId:groupId,userId:userData.id,isType:6})
	    
    	$timeout(function(){
    		$cordovaToast.show('Add member successfully ', 'short', 'center').then(function(success) {
	              }, function (error) {
	              });
    		$ionicLoading.hide()
    		$state.go('tab.chats')
    	},2000)
		//socket.emit('send group Messages',{"message": userData.phone+" addred by admin","isType":5,"name":UserService.getToUserData().name,"groupId":UserService.getToUserData().groupId,"groupImage":UserService.getToUserData().avtar,"senderName":UserService.getUser().name,"senderImage":UserService.getUser().avatar,groupMembers:$scope.groupMember,createdById:UserService.getLoginUser()})
	}
})