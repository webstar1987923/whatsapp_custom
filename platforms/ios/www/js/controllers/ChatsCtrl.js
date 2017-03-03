app.controller('ChatsCtrl',function($scope,socket,$timeout,$cordovaContacts,$ionicPopover,GroupMessageService,GroupMembersService,$ionicListDelegate,$ionicScrollDelegate,$state,$rootScope,$ionicLoading,$cordovaLocalNotification,$ionicHistory,MessagesService,UserService,socket,$cordovaSQLite,CouchDBServices,$timeout, $ionicModal) {
	$ionicHistory.clearHistory();
	$ionicPopover.fromTemplateUrl('templates/popoverChat.html', {
	       scope: $scope,
	       }).then(function(popover) {
	      $scope.popover = popover;
	});
	$scope.addGroup = function(){

	 	$scope.popover.hide();
	 	$state.go('addgroup')
	}
	$scope.scrollTop = function() {
    	$ionicScrollDelegate.scrollTop();
    };
  	$scope.perviouschat=[];
	
	$scope.$on("$ionicView.enter", function(event, data){
	   // handle event
	   if(window.localStorage['isTimeout']==1)
		{
			socket.emit('new user', UserService.getLoginUser(), function(data){
                 if(data){
                  } else{
                  alert('That username is already taken!  Try again.');
                 }
              });
			window.localStorage['isTimeout']=0;
			$timeout(function(){
				chatrefresh();
			},2000)
		}
		else
		{
			chatrefresh();
		}
	});
	// ===== user typing
	// socket.on('typing',function (data) {

	// 	for(var i=0;i<$scope.perviouschat.length;i++)
	// 	{

	// 		// if($scope.perviouschat[i].phone===data.){
	// 		// 	$scope.perviouschat[i].message='typing...';
	// 		// 	$scope.$apply()
	// 		//     break;
	// 		// }

	// 	}

	//   });


	var cleanUp = $scope.$on('refreshChats',function(event,args){
		$scope.loadChats(args)

	})

	var cleanUp1 = $scope.$on('whisperGrpMsg',function(event,args){
		loadGrpChats(args)

	})
	$scope.$on('$destroy', cleanUp);

	// $scope.$on('$destroy', function() {
 //          cleanUp();
 //          cleanUp1();
 //      });

    var count=0;
	var isFind=false;
	socket.emit('request load old msgs',UserService.getLoginUser(),function(args){
		var count=args.length;
		for(var i=0;i<args.length;i++)
		{
			 (function(i) {
			    setTimeout(function() {
			    	if(args[i].groupId)
			    	{
			    		if(args[i].groupMembers.length)
					    {
					    	console.log('-------offline msg-----'+JSON.stringify(args[i]))
					        GroupMembersService.insertMsg({
					        	"groupId":args[i].groupId,
					        	"groupName":args[i].groupName,
					        	"groupMembers":args[i].groupMembers,
					        	"createdById":args[i].createdById})
					    }
			    		GroupMessageService.insertMsg({
		                  senderId:args[i].nick,
		                  senderName:args[i].senderName,
			              senderImage:args[i].senderImage,
		                  receiverId:UserService.getLoginUser(),
		                  message:args[i].msg,
		                  groupId:args[i].groupId,
		                  groupOwnerId:'',
		                  groupImage:args[i].img,
		                  groupName:args[i].groupName,
		                  loginUserId:UserService.getLoginUser(),
		                  unReadflag:'1',
		                  imgFlag:args[i].imgFlag,
		                  imageSize:args[i].imageSize,

		                }).then(function(result){
		                	count--;
		                	if(count==0)
		                	{
			                	//chatrefresh();
		                		//chatrefresh();
		                		socket.emit('get oldmsg done',args[i],function(res){

		                		})
		                	}
		                	chatrefresh();
		                });
		            }
		            else
		            {
		            	MessagesService.insertMsg({
		                      senderId:args[i].nick,
		                      receiverId:UserService.getLoginUser(),
		                      message:args[i].msg,
		                      loginUserId:UserService.getLoginUser(),
		                      unReadflag:'1',
		                      imgFlag:args[i].imgFlag,
		                      imageSize:args[i].imageSize,
		                }).then(function(result){
		                	count--;
		                	if(count==0)
		                	{
		                		//chatrefresh();
		                		socket.emit('get oldmsg done',args[i],function(res){

		                		})
		                	}
		                	chatrefresh();
		                });
		            }
		        }, i * 1000);
			  })(i);



		}

	})

	$scope.deleteChat=function(chatData)
	{
		var deleteQuery="delete from tbl_message where(senderId='"+chatData.phone+"' or receiverId='"+chatData.phone+"') ";
		 $cordovaSQLite.execute(sqlitedb, deleteQuery, []).then(function(res) {

		 	chatrefresh();
		 })
		 $ionicListDelegate.closeOptionButtons();

	}

	$scope.loadChats = function(args){

		var dataArray={};
		var isFind=false;
		if(args.imgFlag==1)
		{
			$scope._msg='Image'
		}
		else if(args.imgFlag==2)
		{
			$scope._msg='Location'
		}
		else
		{
			$scope._msg=args.message;
		}
		MessagesService.insertMsg({
                      senderId:args.nick,
                      receiverId:UserService.getLoginUser(),
                      message:args.message,
                      loginUserId:UserService.getLoginUser(),
                      unReadflag:'1',
                      imgFlag:args.imgFlag,
                      imageSize:args.imageSize,
                });
       var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+args.nick+"' and readUnreadFlg='1'";
        $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
			CouchDBServices.getUserDetails(args.nick).then(function(doc){
	           var userInfo={
	                id:args.nick,
	                title:doc.name,
	                text:$scope._msg,
	                badge:res.rows.item(0).buge,
	                data:doc,
	            }
	              $cordovaLocalNotification.schedule(userInfo).then(function (result) {
	              })
       		})
       	})


		for(var i=0;i<$scope.perviouschat.length;i++)
		{

			if($scope.perviouschat[i].phone===args.nick){
				$scope.perviouschat[i].message=args.message;
				$scope.perviouschat[i].imgFlag=args.imgFlag ;
				$scope.perviouschat[i].readUnreadFlg=$scope.perviouschat[i].readUnreadFlg+1;
			   	$scope.perviouschat[i].time=moment(new Date()).format("HH:mm")
			   	isFind=true;
			    break;
			}

		}
		if(!isFind)
		{

			CouchDBServices.getUserDetails(args.nick).then(function(doc){
				var dataArray={};
				dataArray.name=doc.name;
			    dataArray.message=args.message;
			    dataArray.imgFlag=args.imgFlag;
			    dataArray.time=moment(new Date()).format("HH:mm");
			    dataArray.avatar=doc.avatar;
			    dataArray.email=doc.email;
			    dataArray.phone=doc.phone;
			    dataArray.status=doc.status;
			    dataArray.workAt=doc.workAt;
			    dataArray.about=doc.about;
				dataArray.isUser=1;
				dataArray.readUnreadFlg=1;
			    $scope.perviouschat.push(dataArray);
			})
		}
	$scope.scrollTop()
	}

	 function loadGrpChats(args){
		var dataArray={};
		var isFind=false;
		// if(args.imgFlag==1)
		// {
		// 	$scope._msg='Image'
		// }
		// else if(args.imgFlag==2)
		// {
		// 	$scope._msg='Location'
		// }
		// else
		// {
		// 	$scope._msg=args.message;
		// }
		for(var i=0;i<$scope.perviouschat.length;i++)
		{

			if($scope.perviouschat[i].groupId===args.groupId){
				// if(args.imgFlag =='5' && args.senderId == UserService.getLoginUser() )
				// {
				// 	$scope.perviouschat[i].message='You created group "'+args.groupName+'"';
				// }
				// else if(args.imgFlag =='5' && args.senderId != UserService.getLoginUser() )
				// {
				// 	$scope.perviouschat[i].message=args.message;
				// }
				// else
				// {
				// 	$scope.perviouschat[i].message="<b>"+args.senderName+":</b> "+args.message;
				// }
				$scope.perviouschat[i].message="<b>"+args.senderName+":</b> "+args.message;
				$scope.perviouschat[i].imgFlag=args.imgFlag ;
				$scope.perviouschat[i].name = args.groupName;
				$scope.perviouschat[i].readUnreadFlg=$scope.perviouschat[i].readUnreadFlg+1;
			   	$scope.perviouschat[i].time=moment(new Date()).format("HH:mm")
			   	isFind=true;
			   	$scope.$apply()
			    break;
			}

		}
		if(!isFind)
		{
			var dataArray={};
			dataArray.name=args.groupName;
			dataArray.groupId=args.groupId;
			// if(args.imgFlag=='5' && args.senderId == UserService.getLoginUser() )
			// {
			// 	dataArray.message= 'You created group "'+args.groupName+'"';
			// }
			// else if(args.imgFlag=='5' && args.senderId != UserService.getLoginUser() )
			// {
			// 	dataArray.message= args.message;;
			// }
			// else
			// {
			// 	dataArray.message= "<b>"+args.senderName+":</b> "+args.message;
			// }
			dataArray.message= "<b>"+args.senderName+":</b> "+args.message;
			dataArray.avatar=args.groupImage;
		    dataArray.imgFlag=args.imgFlag;
		    dataArray.time=moment(new Date()).format("HH:mm");
			dataArray.readUnreadFlg=1;
		    $scope.perviouschat.push(dataArray);
		}
		$scope.scrollTop()

	}

	$scope.getMessage=function(data)
	{
		if(data.imgFlag==1)
		{
			return  "<i class='ion-ios-camera'></i> Image";

		}
		else if(data.imgFlag==2)
		{
			return  "<i class='ion-ios-location'></i> Location";

		}
		else if(data.imgFlag==3)
		{
			return  "<i class='ion-android-contact'></i> Contact";
		}
		else
		{
			return data.message;
		}

	}

	function chatrefresh()
	{
		$scope.perviouschats=[];
	    var username=UserService.getUser().name;
		var userid=UserService.getLoginUser();
		var useravatar=UserService.getUser().avatar;
		//var selectchat="SELECT *, SUM(readUnreadFlg) as unReadCount FROM tbl_message where(senderId='"+userid+"' or receiverId='"+userid+"') and groupId='' group by chatId ORDER BY dateCreated DESC";
 		var selectchat="SELECT *, SUM(readUnreadFlg) as unReadCount FROM tbl_message group by chatId ORDER BY dateCreated DESC";
			$cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(data) {
			console.log("selectchat"+JSON.stringify(data))
			if(data.rows.length >0)
			{
				for(i=0; i<data.rows.length; i++)
 				{
 					if(data.rows.item(i).groupId!='')
 					{
						var senderDetails = JSON.parse(data.rows.item(i).senderDetails);
						var dataArray={};
	 					dataArray.name=data.rows.item(i).groupName;
	 					if(data.rows.item(i).imgFlag=='5')
	 					{
							dataArray.message=data.rows.item(i).message;
	 					}
	 					else
	 					{
							dataArray.message="<b>"+senderDetails.name+":</b> "+data.rows.item(i).message;
	 					}
						dataArray.imgFlag=data.rows.item(i).imgFlag;
						dataArray.time=moment(data.rows.item(i).dateCreated).format("HH:mm");
						dataArray.avatar=data.rows.item(i).groupImage;
						dataArray.email=senderDetails.email;
						dataArray.phone=senderDetails.phone;
						dataArray.status=senderDetails.status;
						dataArray.workAt=senderDetails.workAt;
						dataArray.about=senderDetails.about;
					    dataArray.isUser=senderDetails.isUser;
						dataArray.readUnreadFlg=data.rows.item(i).unReadCount;
						dataArray.groupId=data.rows.item(i).groupId;
						dataArray.groupImage=data.rows.item(i).groupImage;
						dataArray.groupName=data.rows.item(i).groupName;
						$scope.perviouschats.push(dataArray);
 					}
 					else
 					{
						var senderDetails = JSON.parse(data.rows.item(i).senderDetails)
	 					var receiverDetails = JSON.parse(data.rows.item(i).receiverDetails)
	   					var dataArray={};
	  			        //var countUchat="select * from tbl_message where chatId='"+data.rows.item(i).chatId+"' and readUnreadFlg='1'" ;

						// $cordovaSQLite.execute(sqlitedb, countUchat, []).then(function(res) {
						// 	dataArray.unreadmessage=res.rows.length
						// })
					    if(data.rows.item(i).senderId!=data.rows.item(i).loginUserId)
						{
							 dataArray.name=senderDetails.name;
							 dataArray.message=data.rows.item(i).message;
							 dataArray.imgFlag=data.rows.item(i).imgFlag;
							 dataArray.time=moment(data.rows.item(i).dateCreated).format("HH:mm");
							 dataArray.avatar=senderDetails.avatar;
							 dataArray.email=senderDetails.email;
							 dataArray.phone=senderDetails.phone;
							 dataArray.status=senderDetails.status;
							 dataArray.workAt=senderDetails.workAt;
							 dataArray.about=senderDetails.about;
	 						 dataArray.isUser=senderDetails.isUser;
	 						 dataArray.readUnreadFlg=data.rows.item(i).unReadCount;
	 						 dataArray.groupId='';
							 dataArray.groupImage='';
						     dataArray.groupName='';
							 $scope.perviouschats.push(dataArray);
						}
						else
						{
							 dataArray.name=receiverDetails.name;
							 dataArray.message=data.rows.item(i).message;
							 dataArray.imgFlag=data.rows.item(i).imgFlag;
							 dataArray.time=moment(data.rows.item(i).dateCreated).format("HH:mm");
							 dataArray.avatar=receiverDetails.avatar;
							 dataArray.email=receiverDetails.email;
							 dataArray.phone=receiverDetails.phone;
							 dataArray.status=receiverDetails.status;
							 dataArray.workAt=receiverDetails.workAt;
							 dataArray.about=receiverDetails.about;
							 dataArray.isUser=receiverDetails.isUser;
	 						 dataArray.readUnreadFlg=data.rows.item(i).unReadCount;

							 $scope.perviouschats.push(dataArray);
						}
 					}
				}
				setTimeout(function() {
		          $scope.$apply(function() {
		           $scope.perviouschat=$scope.perviouschats;
		          });
		        });
		    }
		    else
		    {
		    	setTimeout(function() {
		          $scope.$apply(function() {
		           $scope.perviouschat=$scope.perviouschats
		          });
		        });
		    }
		}, function (err) {
		console.error(JSON.stringify(err))
		});
	}

	$scope.chating = function(toUserData){

	       UserService.setToUserData(toUserData);
	       	if(toUserData.groupId)
	       	{
       		    $rootScope.isGroupChatReload = false;
				$state.go('groupchating');
	       	}
	       	else
	       	{
				$state.go('chating');
	       	}
			for(var i=0;i<$scope.perviouschat.length;i++)
			{
				if($scope.perviouschat[i].phone===toUserData.phone){
					$scope.perviouschat[i].readUnreadFlg=0;
				    break;
				}
			}

	}

	/*********************************************************************/
	/*                SHOW MODAL WITH CONTACTS TO CHAT                   */
	/*                     Params in: none                               */
	/*                     Params out: none                              */
	/*********************************************************************/
	    $scope.showModalContacts = function() {
	      $scope.showModal('templates/newChat.html');
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
