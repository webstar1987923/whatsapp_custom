// Ionic Starter App
 var sqlitedb=null;
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// var app=angular.module('starter', ['ionic','starter.services','intlpnIonic','couchDB.services','contacts.services','pouchdb'])

var app= angular.module('starter',
        ['ionic',
         'starter.services',
         'pouchdb',
         'couchDB.services',
         'contacts.services',
         'angularMoment',
         'ngSanitize',
         'btford.socket-io',
         'ngCordova',
         'angularMoment',
         'intlpnIonic',
         'ionicLazyLoadCache',
         'ionic.contrib.ui.hscrollcards'
         ]
    )

.run(function($ionicPlatform,$state,UserService,socket,$rootScope,$cordovaFile,MessagesService,GroupMembersService,GroupMessageService,$timeout,$ionicHistory, $cordovaSQLite ,$cordovaLocalNotification,CouchDBServices,$cordovaDevice,$ionicGesture) {
  $ionicPlatform.ready(function()
  {
      if(window.cordova && window.cordova.plugins.Keyboard){

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
     
      cordova.plugins.Keyboard.disableScroll(true);

      }

      if(ionic.Platform.isIOS()){
        navigator.splashscreen.hide();
      }

      if(window.StatusBar){
        StatusBar.styleDefault();
      }
    
      // ============----scoket-========//
      
      // CREATE
    $cordovaFile.createDir(cordova.file.externalRootDirectory, "WhatsappChat", false)
      .then(function (success) {
       
        // success
      }, function (error) {
       
        // error
      });

    document.addEventListener("resume", function() {
      console.log(">>>>>>>>>>>>>>>>>>The application is resuming from the background");



      // cordova.plugins.backgroundMode.enable();
      //
      // cordova.plugins.backgroundMode.onactivate = function () {
      //
      // setTimeout(function () {
      //         console.log('background mode is now disabled----jobs done-----going to sleep--');
      //         // Modify the currently displayed notification
      //         cordova.plugins.backgroundMode.disable();
      //     }, 10000);
      //
      // }


      // socket.emit('request load old msgs',UserService.getLoginUser(),function(args){
      //   var count=args.length;
      //   for(var i=0;i<args.length;i++)
      //   {

      //      (function(i) {
      //         setTimeout(function() {
      //          MessagesService.insertMsg({
      //                         senderId:args[i].nick,
      //                         receiverId:UserService.getLoginUser(),
      //                         message:args[i].msg,
      //                         loginUserId:UserService.getLoginUser(),
      //                         unReadflag:'1',
      //                         imgFlag:args[i].imgFlag
      //                   }).then(function(result){
      //                     count--;
      //                     if(count==0)
      //                     {
      //                       socket.emit('get oldmsg done',args[i],function(res){

      //                       })
      //                     }
      //                     chatrefresh();
      //                   });
      //             }, i * 1000);
      //       })(i);

      //   }

      // });


      socket.emit('new user', UserService.getLoginUser(), function(data){
        if(data){
        } else{
          console.log('That username is already taken!  Try again.');
        }
      });

      console.log(">>>>>>>>>>>>>>>>>>The application is resuming from the background------done-----");

    }, false);

    sqlitedb = $cordovaSQLite.openDB({name: "my.db", createFromLocation: 1});
    $cordovaSQLite.execute(sqlitedb, 'CREATE TABLE IF NOT EXISTS "tbl_contact" ("id" INTEGER PRIMARY KEY  NOT NULL ,"name" VARCHAR,"phone" VARCHAR,"avatar" VARCHAR,"isActive" INTEGER, "status" VARCHAR,"fbid" VARCHAR, "country" VARCHAR,"gender" VARCHAR, "resid" VARCHAR)');
    $cordovaSQLite.execute(sqlitedb,'CREATE TABLE IF NOT EXISTS "tbl_message" ("id" INTEGER PRIMARY KEY  NOT NULL , "senderId" VARCHAR, "receiverId" VARCHAR, "senderDetails" VARCHAR, "receiverDetails" VARCHAR, "message" TEXT, "dateCreated" DATETIME, "chatId" VARCHAR, "readUnreadFlg" INTEGER, "groupId" INTEGER, "groupOwnerId" INTEGER, "groupImage" VARCHAR , "groupName" VARCHAR, "isBlocked" INTEGER, "loginUserId" VARCHAR, "imgFlag" INTEGER,"isDownload" INTEGER,"imageSize" INTEGER)')
    $cordovaSQLite.execute(sqlitedb,'CREATE TABLE IF NOT EXISTS  "tbl_groups" ("id" INTEGER PRIMARY KEY NOT NULL, "groupId" VARCHAR,"groupName" VARCHAR,"groupMembers" VARCHAR,"createdById" VARCHAR,"isActive" INTEGER)')
     // alert("Contacts >>>"+navigator.contacts);
     UserService.setSqldb(sqlitedb);

    // ##############----scoket----###########//
    socket.on('login', function (data) {
      //Set the value of connected flag
      console.log('we log in now');
      self.connected = true
      self.number_message= message_string(data.numUsers)

    });

    // ==== member typing =====
    socket.on('User Last Seen Status',function (data) {
      console.log('last seen-------------------');
      console.log(data);
     $rootScope.$broadcast('onlineStatus',data)
    });
    socket.on('new message', function(data){
      console.log("herrrr------tab chats new message before if");
      if(data.msg&&data.nick)
      {
        addMessageToList(data.username,true,data.message);


        console.log("herrrr------tab chats 55555 inside the iff");
      }
    });
    socket.on('user image', function(data){
      if($ionicHistory.currentStateName()=='chating')
      {

        var jGeneratedImg={"nick":data.nick,"image":data.image,"imageSize":data.imageSize};
        $rootScope.$broadcast('whisperimg',jGeneratedImg);
        console.log("herrrr------tab chats 44444");

        var fromUser = "";
        var toUser = "";
        var msg = data.msg;
        var isImage = true;

        //get current chat user remote
        var toFullUser = UserService.getToUserData();
        toUser = toFullUser.name;

        // get to whom the message is directed
        CouchDBServices.getUserDetails(data.nick).then(function(doc){
          fromUser = doc.name;
          console.log(toUser + ', ' + fromUser);
          if(toUser != fromUser){
            $rootScope.closeAllNt();
            $rootScope.showOutOfChatMessaget(toUser,fromUser, msg, isImage);
          }
        });

      }
      else if($ionicHistory.currentStateName()=='tab.chats'){
        console.log("herrrr------tab chats image");
        var jGeneratedMsg ={ "nick" : data.nick , "message" : data.image , "imgFlag":'1' ,"imageSize":data.imageSize};
        $rootScope.$broadcast('refreshChats',jGeneratedMsg)
      }
      else{
        var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+data.nick+"' and readUnreadFlg='1'";
        $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
          CouchDBServices.getUserDetails(data.nick).then(function(doc){
            var userInfo={
              id:data.nick,
              title:doc.name,
              text:'Image',
              badge:res.rows.item(0).buge+1,
              data:doc,
            }
            $cordovaLocalNotification.schedule(userInfo).then(function (result) {
            });
          })
        })
        console.log("herrrr------tab chats 3333");
        MessagesService.insertMsg({
          senderId:data.nick,
          receiverId:UserService.getLoginUser(),
          message:data.image,
          loginUserId:UserService.getLoginUser(),
          unReadflag:'1',
          imgFlag:'1',
          imageSize:data.imageSize,
        });
      }
    });

    socket.on('share contact',function(data){
      var jGeneratedContact={"nick":data.nick,"contact":data.contact}

      $scope.$broadcast('whispercontact',jGeneratedContact);
    });

    socket.on('whisper', function(data){
      // $timeout(function(){
      //      $rootScope.$broadcast('refreshChats')
      //     // chatrefresh()
      // },2000)
      var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+data.nick+"' and readUnreadFlg='1'";
      if($ionicHistory.currentStateName()=='chating')
      {

        console.log("herrrr------tab chats 1111");

        var jGeneratedMsg ={ "nick" : data.nick , "message" : data.msg,"imgFlag":data.isType};
        $rootScope.$broadcast('whispermsg',jGeneratedMsg);

        // var audio = ngAudio.load(window.localStorage['receivesound']);
        // audio.play();

        var fromUser = "";
        var toUser = "";
        var msg = data.msg;
        var isImage = false;

        //get current chat user remote
        var toFullUser = UserService.getToUserData();
        toUser = toFullUser.name;

        // get to whom the message is directed
        CouchDBServices.getUserDetails(data.nick).then(function(doc){
          fromUser = doc.name;
          console.log(toUser + ', ' + fromUser);
          if(toUser != fromUser){
            $rootScope.closeAllNt();
            $rootScope.showOutOfChatMessaget(toUser,fromUser, msg, isImage);
          }
        });

      }

      else if($ionicHistory.currentStateName()=='tab.chats'){

        console.log("herrrr------tab chats whisper");
        var jGeneratedMsg ={ "nick" : data.nick , "message" : data.msg , "imgFlag":data.isType };
        $rootScope.$broadcast('refreshChats',jGeneratedMsg)
      }

      else{

        console.log("herrrr------tab chats 2222");
        MessagesService.insertMsg({
          senderId:data.nick,
          receiverId:UserService.getLoginUser(),
          message:data.msg,
          loginUserId:UserService.getLoginUser(),
          unReadflag:'1',
          imgFlag:data.isType
        })
        $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
          var msg;
          if(data.isType==2)
          {
            msg='Location';
          }
          else if(data.isType==3)
          {
            msg='Location';
          }
          else
          {
            msg=data.msg;
          }
          CouchDBServices.getUserDetails(data.nick).then(function(doc){
            var userInfo={
              id:data.nick,
              title:doc.name,
              text:msg,
              badge:res.rows.item(0).buge,
              data:doc,
            }
            $cordovaLocalNotification.schedule(userInfo).then(function (result) {

            })
          })
        })
      }
    });
    // ==== group memeber ===
    socket.on('whisperGroup', function (data) {
      // ==== check message type ====== //
      if(data.isType=='5' && data.senderId == UserService.getLoginUser())
      {
        var message='You created group "'+data.groupName+'"';
      }
      else if(data.isType=='8' && data.senderId == UserService.getLoginUser())
      {
        var message ='You left'
      }
      else if(data.isType=='9' && data.senderId == UserService.getLoginUser())
      {
        var message = "You change group icon."
      }
       else if(data.isType=='10' && data.senderId == UserService.getLoginUser())
      {
        var message = "You change group name "+data.groupName;
      }
      else
      {
        var message = data.message;
      }
      // ==== message read / unread flag ====
      if( $ionicHistory.currentStateName()=='groupchating' && $rootScope.currentGrpId==data.groupId)
      {
        var unReadflag='0'
      }
      else
      {
        var unReadflag='1'
      }
      // ==== insert groupMember into database ===
      if(data.groupMembers.length)
      {
        GroupMembersService.insertMsg(data)
      }

      // ===== brodcast message ====
       if($ionicHistory.currentStateName()=='tab.chats' || $ionicHistory.currentStateName()=='groupchating'){
          var GrpMsg =
          {
            "groupId" : data.groupId ,
            "message" : data.message,
            "imgFlag":data.isType,
            "groupImage":data.groupImage,
            "groupName":data.groupName,
            "senderId":data.senderId,
            "senderName":data.senderName,
            "senderImage":data.senderImage,
          };
           $rootScope.$broadcast('whisperGrpMsg',GrpMsg);
       }
      GroupMessageService.insertMsg({
            senderId:data.senderId,
            senderName:data.senderName,
            senderImage:data.senderImage,
            receiverId:UserService.getLoginUser(),
            message:message,
            groupId:data.groupId,
            groupOwnerId:'',
            groupImage:data.groupImage,
            groupName:data.groupName,
            loginUserId:UserService.getLoginUser(),
            unReadflag:unReadflag,
            imgFlag:data.isType
      });
    });

    // ==== member typing =====
    socket.on('User Last Seen Status',function (data) {
     $rootScope.$broadcast('onlineStatus',data)
    });

    // ===== Get Group Members ====
    //  socket.on('Get Group Members',function (data) {
    //  $rootScope.$broadcast('getGroupMember',data)
    // });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      addMessageToList("",false,data.username + " joined")
      addMessageToList("",false,message_string(data.numUsers))
    });
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      addMessageToList("",false,data.username+" left")
      addMessageToList("",false,message_string(data.numUsers))
    });
    
      
      // ========== Events =====
      $rootScope.$on('$cordovaLocalNotification:schedule',
      function (event, notification, state) {
      
      });
      
      $rootScope.$on('$cordovaLocalNotification:getScheduled',
      function (event, notification, state) {
      
      });
      $rootScope.$on('$cordovaLocalNotification:trigger',
      function (event, notification, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:update',
      function (event, notification, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:clear',
      function (event, notification, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:clearall',
      function (event, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:cancel',
      function (event, notification, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:cancelall',
      function (event, state) {
      });
      
      $rootScope.$on('$cordovaLocalNotification:click',
      function (event, notification, state) {
        if(notification.data){
         UserService.setToUserData(JSON.parse(notification.data))
         $state.go('chating')
         if($ionicHistory.currentStateName()=='chating')
         {
             $state.go($state.current, {}, {reload: true});
         }

        }
        else
        {
          $state.go('tab.chats');
        }
        // ...
      });
      $rootScope.$on('$cordovaLocalNotification:added',
      function (event, notification, state) {

      });      
      // =========/ Events

      // =====  PUSH NOTIFICATION ======

     if(JSON.stringify(UserService.getLoginUser())!='{}')
     {
      // // PushNotification.registerDevices().then(function(response){
      //  });
     }
     
       // ### ---- cordovasqlite -- ### //
     
  });
})


.constant('SERVER_ADDRESS', 'http://162.243.225.225:5984/registeruser')
.constant('NODE_SERVER_ADDRESS','http://162.243.225.225:3002/')
.constant('NOTIFICATION_SERVER_ADDRESS','http://162.243.225.225:8000/')

// .constant('SERVER_ADDRESS', 'http://138.68.3.205:5984/registeruser')
// .constant('NODE_SERVER_ADDRESS','http://138.68.3.205:3001/')
// .constant('NOTIFICATION_SERVER_ADDRESS','http://138.68.3.205:8000/')


// .constant('SERVER_ADDRESS', 'http://192.168.1.118:5984/registeruser')
// .constant('NODE_SERVER_ADDRESS','http://192.168.1.118:3001/')
// .constant('NOTIFICATION_SERVER_ADDRESS','http://192.168.1.118:8000/')


.config(function($stateProvider, $urlRouterProvider,$compileProvider) {
 
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(geo):/);
    $stateProvider
      .state('intro', {
         url: '/',
         templateUrl: 'templates/intro.html',
         controller: 'IntroCtrl',
         onEnter: function($state, UserService,$rootScope,socket,$timeout,$ionicPlatform){
             
           var _loginStatus=UserService.getLoginUser();
              if(!isNaN(_loginStatus))
              {
                $state.go('tab.chats');
                window.localStorage['isTimeout']=1;         
              }
              // else
              // {
              //   $state.go('tab.chats');
              // }
         }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/sign-in.html',
        controller: 'LoginCtrl'
      })

      .state('contact-number', {
        url: '/contact-number',
        templateUrl: 'templates/contact-number.html',
        controller: 'ContactCtrl'
      })

      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })

      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })

      .state('tab.contact', {
        url: '/contacts',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts.html',
            controller: 'ContactsNoCtrl'
          }
        }
      })

      .state('chating', {
        url: '/chating',
        templateUrl: 'templates/chating.html',
        controller: 'ChatingCtrl'
      })

      .state('groupchating', {
        url: '/group-chating',
        templateUrl: 'templates/group-chating.html',
        controller: 'GroupChatingCtrl'
      })

      .state('touserprofile', {
        url: '/touserprofile',
        templateUrl: 'templates/to-user-profile.html',
        controller: 'toUserProfileCtrl',
        params:{
          toUserData:''
        }
      })

      .state('addgroup', {
        url: '/add-group',
        templateUrl: 'templates/add-group.html',
        controller: 'AddGroupCtrl'
      })

      .state('creategroup', {
        url: '/create-group',
        templateUrl: 'templates/create-group.html',
        controller: 'CreateGroupCtrl'
      })

       .state('userprofile', {
        url: '/userprofile',
        templateUrl: 'templates/user-profile.html',
        controller: 'UserProfileCtrl',
       
      })
      .state('groupinfo', {
        url: '/group-info',
        templateUrl: 'templates/group-info.html',
        controller: 'GroupChatingCtrl',
      })
    //$urlRouterProvider.otherwise('/tab/chats');
      $urlRouterProvider.otherwise('/');
})
