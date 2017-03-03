app.controller('GroupChatingCtrl', function($scope,$ionicModal,$cordovaToast, $stateParams,$ionicLoading,$cordovaGeolocation,$cordovaLocalNotification,$cordovaCamera, socket,$sanitize,$ionicHistory, $state, $rootScope, $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicPopover,UserService,$ionicViewService,$ionicModal,$ionicPopover,MessagesService,$cordovaSQLite,CouchDBServices,$ionicNavBarDelegate) {

  // $ionicNavBarDelegate.showBackButton(false);
  $scope._toUserDetail= UserService.getToUserData();
  var usernm=UserService.getUser().name;
  var userid=UserService.getLoginUser();
  var useravatar=UserService.getUser().avatar;
  var groupName = $scope._toUserDetail.name;
  var groupId= $scope._toUserDetail.groupId;
  $rootScope.currentGrpId = groupId;
  var groupImage= $scope._toUserDetail.avatar;
  $scope.loginUid=UserService.getLoginUser();
  // $scope.useravatar=UserService.getUser().avatar;
  $scope.input= {
    message:''
  }

  $scope.$on('$ionicView.enter', function() {
      $scope._toUserDetail= UserService.getToUserData();

      if(!$rootScope.isGroupChatReload){
         $scope.getMessages(0);
      }
      else
      {
          $scope.messages = $rootScope.perviousMessage;
          $scope.offset = $rootScope.offset ;

      }

      $timeout(function() {
               footerBar = document.body.querySelector('#userMessagesView .bar-footer');
               scroller = document.body.querySelector('#userMessagesView .scroll-content');
               txtInput = angular.element(footerBar.querySelector('textarea'));
               }, 0);
      messageCheckTimer = $interval(function() {

              }, 20000);

  })
  sqlitedb = $cordovaSQLite.openDB("my.db");
    //update readFlage
    var updatereadflag="UPDATE tbl_message SET readUnreadFlg='0' where groupId='"+$scope._toUserDetail.groupId+"'";
    $cordovaSQLite.execute(sqlitedb, updatereadflag, []).then(function(res){
    })

     // === get group member ====
    var selectGroup = "SELECT * FROM tbl_groups where groupId='"+groupId+"'";
    $cordovaSQLite.execute(sqlitedb,selectGroup,[]).then(function(res){
          console.log("responce"+JSON.stringify(res))
          $rootScope.isActiveGroup = res.rows.item(0).isActive;
          $rootScope.groupMembers = [];
          $rootScope.groupAdmin = res.rows.item(0).createdById;
          var _groupMember= JSON.parse(res.rows.item(0).groupMembers);
          for(var i=0; i<_groupMember.length;i++)
          {
             (function(i) {
                   setTimeout(function() {
                    CouchDBServices.getUserDetail(_groupMember[i].memberId).then(function(res){
                          $scope.groupMembers.push(res)
                    });
                    }, i * 100);
              })(i);
          }
    })


   $scope.$on('$ionicView.leave', function() {
          console.log('leaving UserMessages view, destroying interval');
          if (angular.isDefined(messageCheckTimer)) {
          $interval.cancel(messageCheckTimer);
          messageCheckTimer = undefined;
          }
  });

  $scope.showGroupInfo = function(){
    $rootScope.isGroupChatReload = true;
    $state.go('tab.groupinfo')
  }

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
       scope: $scope,
       }).then(function(popover) {
               $scope.popover = popover;
  });

  $scope.myGoBack = function()
  {
    $rootScope.hideTabs = '';
    $ionicHistory.goBack();
  }

    var self=this;
    var connected= true;
    var typing = false;
    var lastTypingTime;
    var TYPING_TIMER_LENGTH = 400;
    //Add colors
    var COLORS = [
               '#e21400', '#91580f', '#f8a700', '#f78b00',
               '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
               '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
               ];

    //initializing messages array
    self.messages=[]

   //Generate color for the same user.
   function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }


  // Adds the visual chat typing message
  function addChatTyping (data) {
    self.messages = data.currentUser + " is typing";
    $scope.chatstatus = 'typing...';
  }

  // Removes the visual chat typing message
  function removeChatTyping (username) {
    self.messages = "";
    $scope.chatstatus = 'online';

  }

  function message_string(number_of_users)
  {
  return number_of_users === 1 ? "there's 1 participant":"there are " + number_of_users + " participants"
  }



  var messageCheckTimer;

  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  var footerBar; // gets set in $ionicView.enter
  var scroller;
  var txtInput; // ^^^

  socket.on('typing', function (data) {
           addChatTyping(data);
           });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
           removeChatTyping("");
           });

  $scope.getMessages = function(offset){
    if(offset==0)
    {
      $scope.messages=[];
    }
    $scope.offset=offset;
    var selectchat="SELECT * FROM tbl_message where groupId='"+groupId+"' order by id DESC LIMIT "+$scope.offset+", 5" ;
    $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
        if(res.rows.length >0)
        {
              $scope.offset=+$scope.offset+5;

          for(var i=0; i<res.rows.length; i++)
          {
            // alert("sender detail"+res.rows.item(i).senderDetails);
            // alert("receverDetail"+res.rows.item(i).receiverDetails);
            var senderDetail=JSON.parse(res.rows.item(i).senderDetails);
            var receverDetail=JSON.parse(res.rows.item(i).receiverDetails);
            $scope.messages.unshift(
                                {
                                "_id":res.rows.item(i).id,
                                "date":res.rows.item(i).dateCreated,
                                "senderId":res.rows.item(i).senderId,
                                "receiverId":res.rows.item(i).receiverId,
                                "senderName":senderDetail.name,
                                "senderImage":'',
                                "receiverName":senderDetail.avatar,
                                "groupId":res.rows.item(i).groupId,
                                "groupImage":res.rows.item(i).groupImage,
                                "groupName":res.rows.item(i).groupName,
                                "loginUid":res.rows.item(i).loginUserId,
                                "text":res.rows.item(i).message,
                                "contactName":'',
                                "imgFlag":res.rows.item(i).imgFlag
                                });

            $timeout(function() {
                   // viewScroll.scrollBottom(true);
                   $ionicScrollDelegate.scrollBottom();
                    }, 0);
          }
        
           $rootScope.offset =  $scope.offset
          $rootScope.perviousMessage = $scope.messages;

        }
      var jsonArray = JSON.parse(JSON.stringify($scope.messages))
      return jsonArray;
      }, function (err) {
      console.error("-********error------"+JSON.stringify(err));
      });
      $scope.$broadcast('scroll.refreshComplete');

  }

  var cleanUp = $scope.$on('whisperGrpMsg',function(event,args){
    if(UserService.getLoginUser()!=args.senderId && groupId==args.groupId)
    {
      $scope.messages.push({
                        "_id":args.groupId,
                        "date":moment(new Date()),
                        "senderId":args.senderId,
                        "receiverId":UserService.getLoginUser(),
                        "senderName":args.senderName,
                        "senderImage":args.senderImage,
                        "receiverName":'',
                        "groupId":args.groupId,
                        "groupImage":args.groupImage,
                        "groupName":args.groupName,
                        "loginUid":UserService.getLoginUser(),
                        "text":args.message,
                        "contactName":'',
                        "imgFlag":args.imgFlag
                        })
    }

    $timeout(function() {
         $ionicScrollDelegate.scrollBottom();
    }, 0);

  })


 $scope.$on('$destroy', function() {
          cleanUp();
      });


  $scope.sendMessage = function(sendMessageForm) {

    
      socket.emit('send group Messages',{"message":$scope.input.message,"isType":0,"name":groupName,"groupId":groupId,"groupImage":groupImage,"senderName":usernm,"senderImage":UserService.getUser().avatar})
      // insert msg here
      $scope.messages.push({
          "_id":groupId,
          "date":moment(new Date()),
          "senderId":UserService.getLoginUser(),
          "receiverId":'',
          "senderName":usernm,
          "senderImage":useravatar,
          "receiverName":'',
          "groupId":groupId,
          "groupImage":groupImage,
          "groupName":groupName,
          "loginUid":UserService.getLoginUser(),
          "text":$scope.input.message,
          "contactName":'',
          "imgFlag":'0'
          })
      keepKeyboardOpen();

      $scope.input.message = '';

      $timeout(function() {
              keepKeyboardOpen();
      $ionicScrollDelegate.scrollBottom();
             // viewScroll.scrollBottom(true);
              }, 0);
  
  };


  function keepKeyboardOpen() {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
                console.log('textarea blur, focus back on it');
                txtInput[0].focus();
                });
  }

  $scope.$on('taResize', function(e, ta) {
          console.log('taResize');
          if (!ta) return;

          var taHeight = ta[0].offsetHeight;
          console.log('taHeight: ' + taHeight);

          if (!footerBar) return;

          var newFooterHeight = taHeight + 10;
          newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

          footerBar.style.height = newFooterHeight + 'px';
          scroller.style.bottom = newFooterHeight + 'px';
          });

})
// fitlers
.filter('nl2br', ['$filter', function($filter) {
                  return function(data) {
                  if (!data) return data;
                  return data.replace(/\n\r?/g, '<br />');
                  };
                  }
                  ])
// directives
.directive('autolinker', ['$timeout', function($timeout) {
  return {
  restrict: 'A',
  link: function(scope, element, attrs) {
  $timeout(function() {
           var eleHtml = element.html();
           if (eleHtml === '') {
           return false;
           }
           var text = Autolinker.link(eleHtml, {
                                      className: 'autolinker',
                                      newWindow: false
                                      });

           element.html(text);

           var autolinks = element[0].getElementsByClassName('autolinker');

           for (var i = 0; i < autolinks.length; i++) {
           angular.element(autolinks[i]).bind('click', function(e) {
                                              var href = e.target.href;
                                              console.log('autolinkClick, href: ' + href);

                                              if (href) {
                                              //window.open(href, '_system');
                                              window.open(href, '_blank');
                                              }

                                              e.preventDefault();
                                              return false;
                                              });
           }
           }, 0);
  }
  }
  }
  ])
function onProfilePicError(ele) {
    this.ele.src = ''; // set a fallback
}
// configure moment relative time
moment.locale('en', {
              relativeTime: {
              future: "in %s",
              past: "%s ago",
              s: "%d sec",
              m: "a minute",
              mm: "%d minutes",
              h: "an hour",
              hh: "%d hours",
              d: "a day",
              dd: "%d days",
              M: "a month",
              MM: "%d months",
              y: "a year",
              yy: "%d years"
              }
              });
