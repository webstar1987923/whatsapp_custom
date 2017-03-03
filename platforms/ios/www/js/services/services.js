angular.module('starter.services', [])


.service('UserService', function() {
         
     var setUser = function(user_data) {
     window.localStorage.starter_facebook_user = JSON.stringify(user_data);
     };
     
     var getUser = function(){
     return JSON.parse(window.localStorage.starter_facebook_user || '{}');
     };
     var setUserRes = function(user_data) {
     window.localStorage.starter_facebook_user1 = JSON.stringify(user_data);
     };
     
     var getUserRes = function(){
     return JSON.parse(window.localStorage.starter_facebook_user1 || '{}');
     };
     
     var setUserChat=function(chat_data){
     window.localStorage.starter_facebook_user2 = JSON.stringify(chat_data);
     };
     
     var getUserChat=function()
     {
     return JSON.parse(window.localStorage.starter_facebook_user2 || '{}');
     }
     var setLoginUser=function(LoginUserID){
     window.localStorage.LoginUserID = JSON.stringify(LoginUserID);
     };
     
     var getLoginUser=function()
     {
     return JSON.parse(window.localStorage.LoginUserID || '{}');
     }

     var setSqldb=function(sqldata){
     window.localStorage.sqldata = JSON.stringify(sqldata);
     };
     
     var getSqldb=function()
     {
     return JSON.parse(window.localStorage.sqldata || 'null');
     }

     var setToUserData=function(toUser){
     window.localStorage.toUser = JSON.stringify(toUser);
     };
     var getToUserData=function(){
           return JSON.parse(window.localStorage.toUser || '{}');
     }
     
     var selectedContactId;
     var selectedToUserId;
     var selectedToUserName;
     var selectedToUserImg;
     var selectedImageUrl;
     var loginUserId;
     var loginStatus;
     var toUserProfileId;
     var countrycode;
     var country;
     return {
      setToUserData:setToUserData,
      getToUserData:getToUserData,
     getSqldb:getSqldb,
     setSqldb:setSqldb,  
     getLoginUser:getLoginUser,
     setLoginUser:setLoginUser,
     getUser: getUser,
     setUser: setUser,
     getUserRes: getUserRes,
     setUserRes: setUserRes,
     getUserChat: getUserChat,
     setUserChat:setUserChat,
     selectedContactId:selectedContactId,
     selectedToUserId:selectedToUserId,
     selectedToUserName:selectedToUserName,
     selectedToUserImg:selectedToUserImg,
     selectedImageUrl:selectedImageUrl,
     loginUserId:loginUserId,
     loginStatus:loginStatus,
     toUserProfileId:toUserProfileId,
     countrycode:countrycode,
     country:country
     };
})

.service('MessagesService',function($q,$rootScope,$state,$cordovaSQLite,UserService){
         
        var insertMsg= function(data){
        var q = $q.defer();
          var db_contact = new PouchDB('contact',{adapter: 'localstorage'}); 
          var sid=data.senderId;
          var rid=data.receiverId;
          // var senderDetails=data.senderDetails;
          // var receiverDetails=data.receiverDetails;
          var text=data.message;
          var loginUid=data.loginUserId;
          var unread=data.unReadflag;
          var imgFlag=data.imgFlag;
          var imageSize = data.imageSize;
          var isDownload;
          var date=new Date();
          
          if(sid==loginUid)
          {
            isDownload=1;
            var senderDetails=JSON.stringify(UserService.getUser());
            db_contact.get(rid).then(function (doc) {
            var receiverDetails=JSON.stringify(doc)
            
             insertData(senderDetails,receiverDetails)
            })
        
          }
          else
          {
            isDownload=0;
            var receiverDetails=JSON.stringify(UserService.getUser());
            db_contact.get(sid).then(function (doc) {
            var senderDetails=JSON.stringify(doc)
            insertData(senderDetails,receiverDetails)
            }).catch(function(err){
              var sData={
                _id:sid,
                name:sid,
                phone:sid,
                isUser:1
              }
              insertData(JSON.stringify(sData),receiverDetails)
            })
          }
          // get chatid from database

          function insertData(senderDetails,receiverDetails)
          {
              var getchatid="select * from tbl_message where(senderId='"+sid+"' and receiverId='"+rid+"') or (senderId='"+rid+"' and receiverId='"+sid+"') and groupOwnerId=''";
                $cordovaSQLite.execute(sqlitedb, getchatid, []).then(function(result){
                  if(result.rows.length>0)
                  {
                  var chatid=result.rows.item(0).chatId;
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupImage,groupName,isBlocked,loginUserId,imgFlag,isDownload,imageSize) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,chatid,unread,'','','','','',loginUid,imgFlag,isDownload,imageSize]).then(function(res) {
                            console.log("INSERT resolve -> " + JSON.stringify(res));
                            q.resolve(res.insertId);
                            }, function (err) {
                            console.error(err);
                            q.reject(err);
                  });
                  
                  }
                  else
                  {
                  // insert chatid 
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupImage,groupName,isBlocked,loginUserId,imgFlag,isDownload,imageSize) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,'',unread,'','','','','',loginUid,imgFlag,isDownload,imageSize]).then(function(res) {                                                                                                            //update chat id
                     var updatechatid="UPDATE tbl_message SET chatid='"+res.insertId+"' where id='"+res.insertId+"'";
                     $cordovaSQLite.execute(sqlitedb, updatechatid, []).then(function(ress){
                                 q.resolve(res.insertId);

                                 }, function (err) {
                                    alert(err)
                                 console.error(err);
                                 q.reject(err);
                                 
                                 });
                     })
                  }  
                })
          }
        return q.promise;

        }
        return{
         insertMsg:insertMsg
        }
})

.service('GroupMessageService',function($q,$rootScope,$state,$cordovaSQLite,UserService){
   var insertMsg= function(data){
          
          var q = $q.defer();
          var db_contact = new PouchDB('contact',{adapter: 'localstorage'});

          var sid=data.senderId;
          var rid=data.receiverId;
          var senderName=data.senderName;
          var senderImage=data.senderImage;
          // var senderDetails=data.senderDetails;
          // var receiverDetails=data.receiverDetails;
          var text=data.message;
          var loginUid=data.loginUserId;
          var unread=data.unReadflag;
          var imgFlag=data.imgFlag;
          var groupId=data.groupId;
          var groupOwnerId='';
          var groupImage=data.groupImage;
          var groupName=data.groupName;
          var date=new Date();
          var sData={"name":senderName,"phone":loginUid,"avatar":senderImage}
             var senderDetails=JSON.stringify(sData);
             var receiverDetails=JSON.stringify(UserService.getUser());
             insertData(senderDetails,receiverDetails)

          function insertData(senderDetails,receiverDetails)
          {
              var getchatid="select * from tbl_message where groupId='"+groupId+"'";
                $cordovaSQLite.execute(sqlitedb, getchatid, []).then(function(result){
                  if(result.rows.length>0)
                  {
                  var chatid=result.rows.item(0).chatId;
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupImage,groupName,isBlocked,loginUserId,imgFlag,isDownload,imageSize) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,chatid,unread,groupId,groupOwnerId,groupImage,groupName,'',loginUid,imgFlag,'0','']).then(function(res) {
                             console.log("INSERT resolve -> " + JSON.stringify(res));
                             q.resolve(res.insertId);
                             }, function (err) {
                             console.error(err);
                             q.reject(err);
                             });

                  }
                  else
                  {
                  // insert chatid
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupImage,groupName,isBlocked,loginUserId,imgFlag,isDownload,imageSize) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  console.log("data"+JSON.stringify(data))
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,'',unread,groupId,groupOwnerId,groupImage,groupName,'',loginUid,imgFlag,'0','']).then(function(res) {
                    var updatechatid="UPDATE tbl_message SET chatid='"+res.insertId+"' where id='"+res.insertId+"'";
                    $cordovaSQLite.execute(sqlitedb, updatechatid, []).then(function(ress){
                              console.log("insert id"+res.insertId);
                                 q.resolve(res.insertId);
                                 }, function (err) {
                                    console.log(err)
                                 console.error(err);
                                 q.reject(err);

                                 });
                     }, function (err) {
                          console.error("Insert Chat error"+JSON.stringify(err));
                        })
                  }
                })
          }
        return q.promise;

        }
        return{
         insertMsg:insertMsg
        }
})

.service('GroupMembersService',function($q,$rootScope,$state,$cordovaSQLite,UserService){

   var insertMsg= function(data){
     var q = $q.defer();
     var groupId = data.groupId;
     var groupName = data.groupName;
     var createdById = data.createdById;
     var isType=data.isType;
     var groupMembers = JSON.stringify(data.groupMembers);
     var select = "SELECT * from tbl_groups where groupId='"+groupId+"' " ;
     $cordovaSQLite.execute(sqlitedb,select,[]).then(function(res){
        if(res.rows.length>0)
        {
            if(isType==7 ||  isType==8)
            {
                
                var isUserNotIn = false;
                for(var i=0;i<data.groupMembers.length;i++)
                {
                  if(data.groupMembers[i].memberId==UserService.getLoginUser())
                  { 
                    isUserNotIn = true;
                    break;
                  }
                }
                if(isUserNotIn)
                {
                   var update="UPDATE tbl_groups SET groupMembers='"+groupMembers+"' where groupId='"+groupId+"'";
                  $cordovaSQLite.execute(sqlitedb,update,[]).then(function(res){
                  console.log('insertData---------------'+res.insertId)
                  },function(err){
                    console.log(err)
                  })
                }
                else
                {
                  if(res.rows.item(0).isActive==1)
                  {
                    var _isActive=0;
                  }
                  else
                  {
                    var _isActive=1;
                  }
                  var update="UPDATE tbl_groups SET isActive='"+_isActive+"' where groupId='"+groupId+"'";
                  $cordovaSQLite.execute(sqlitedb,update,[]).then(function(res){
                  },function(err){
                    console.log(err)
                  })
                }
               
             
            }
            else
            {
               var update="UPDATE tbl_groups SET groupMembers='"+groupMembers+"', isActive='1' where groupId='"+groupId+"'";
                $cordovaSQLite.execute(sqlitedb,update,[]).then(function(res){
                console.log('insertData---------------'+res.insertId)
                },function(err){
                  console.log(err)
                })
            }
            
            
        }
        else
        {
            var query = "INSERT INTO tbl_groups (groupId,groupName,groupMembers,createdById,isActive) VALUES (?,?,?,?,?)";
            $cordovaSQLite.execute(sqlitedb, query,[groupId,groupName,groupMembers,createdById,1]).then(function(res){
              q.resolve(res.insertId);
              console.log('insertData--------------'+res.insertId)
            }, function (err) {
                 console.error(err);
                 q.reject(err);
            });
        }
     },function(err){
      console.log('error'+JSON.stringify(err))
     })

     
       return q.promise;
   }
   return{
         insertMsg:insertMsg
        }
})

// .service('PushNotification',function($cordovaPush,$q,$rootScope,$ionicPopup,$http,UserService,NOTIFICATION_SERVER_ADDRESS){
  
//   var registerDevices = function()
//   {
//       var q = $q.defer();
//       if (ionic.Platform.isIOS())
//       {
//           var iosConfig = {
//              "badge": true,
//              "sound": true,
//              "alert": true,
//           };
//           $cordovaPush.register(iosConfig).then(function(deviceToken) {
//             console.log("Token>>"+deviceToken);
//             // $rootScope.deviceToken=deviceToken;
//             var req = {
//               method: 'POST',
//               url:NOTIFICATION_SERVER_ADDRESS+'subscribe',
//               headers: {
//                 'Content-Type': 'application/json'
//               },
//               data: {
//                 "user":UserService.getLoginUser(),
//                 "type":"ios",
//                 "token":deviceToken
//               }
//             };
             
//             // Make the API call
//             $http(req).success(function(resp){
//               // Handle success
//                  q.resolve(resp);

//               console.log("Ionic Push: Push success!"+resp);
//             }).error(function(error){
//               // Handle error 
//                        q.reject(error);
//               console.log("Ionic Push: Push error..."+error);
//             });
//           }, function(err) {
//                q.reject(err);
//           })
//           $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
//               if (notification.alert) {
//                 $ionicPopup.alert({
//                     title: 'Notification',
//                     content: '<div class="popup-desc text-center"><p>'+notification.alert+'</p></div>'
//                 })
//                 .then(function(result) {
//                   if(result) {  
                   
//                   }
//                 });
                  
//               }
//               if(notification.sound) {
//                 var snd = new Media(event.sound);
//                 snd.play();
//               }

//               if(notification.badge) {
            
//               }
//           });
//       } 
//       else if(ionic.Platform.isAndroid()){
//           var androidConfig = {
//             "senderID": "892871832862",
//           };
//           $cordovaPush.register(androidConfig).then(function(result) {
//               q.resolve(result);

//           }, function(err) {
//             // Error
//              q.reject(err);
//              console.log("Error register....");
//           })
//           $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {

//             switch(notification.event) {
//               case 'registered':
                      
//                 var deviceToken=notification.regid;
            
//                 console.log("Token>>"+deviceToken);
//                 $rootScope.deviceToken=deviceToken;

//                  var req = {
//                     method: 'POST',
//                     url:NOTIFICATION_SERVER_ADDRESS+'subscribe',
//                     headers: {
//                       'Content-Type': 'application/json'
//                     },
//                     data: {
//                       "user":UserService.getLoginUser(),
//                       "type":"android",
//                       "token":deviceToken
//                     }
//                   };
//                   // Make the API call
//                   $http(req).success(function(resp){
//                     // Handle success
//                        q.resolve(resp);
//                     console.log("Ionic Push: Push success!"+resp);
//                   }).error(function(error){
//                     // Handle error 
//                              q.reject(error);

//                     console.log("Ionic Push: Push error..."+error);
//                   });

//                 break;

//               case 'message':
//              // AlertsService.totalUnreadAlerts=(AlertsService.totalUnreadAlerts)+parseInt(notification.msgcnt);
//                 $ionicPopup.alert({
//                   title: 'Notification',
//                   content: '<div class="popup-desc text-center"><p>'+notification.message+'</p></div>'
//                 })
//                 .then(function(result) {
//                   if(result) {  
                   
//                   }
//                 });

//                 break;

//               case 'error':
//                 console.log('GCM error = ' + notification.msg);
//                 break;

//               default:
//                 console.log('An unknown GCM event has occurred');
//                 break;
//             }
//           });
//       }
//        return q.promise;
//   }
//    return{
//          registerDevices:registerDevices
//         }
  
// })

// .filter('custom', function() {
//   return function(input, search) {
//     if (!input) return input;
//     if (!search) return input;
//     var expected = ('' + search).toLowerCase();
//     var result = {};
//     angular.forEach(input, function(value, key) {

//       var data=[];
//       for(var i=0;i<value.length;i++)
//       {
//          var actual = ('' + value[i].doc.name).toLowerCase();
//           if (actual.indexOf(expected) !== -1) {
//             data.push(value[i])
//           }
//       }
//       if(data.length>0)
//       {

//               result[key]=data;
//       }
      
//     });
//     return result;
//   }
// })

.directive('actualSrc', function () {
        return{
            link: function postLink(scope, element, attrs) {
                attrs.$observe('actualSrc', function(newVal){
                     if(newVal !== undefined){
                         var img = new Image();
                         img.src = attrs.actualSrc;
                         angular.element(img).bind('load', function () {
                             element.attr("src", attrs.actualSrc);
                         });
                     }
                });
 
            }
        }
})

.directive('map', function() {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){

          var zValue = scope.$eval(attrs.zoom);
          var lat = scope.$eval(attrs.lat);
          var lng = scope.$eval(attrs.lng);
          var myLatlng = new google.maps.LatLng(lat,lng),
          mapOptions = {
                zoom: zValue,
                center: myLatlng,
                zoomControl: false,
                scaleControl: false,
                scrollwheel:false,
                navigationControl:false,
                mapTypeControl: false,
                draggable: false,
                disableDoubleClickZoom: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP

          },
          map = new google.maps.Map(element[0],mapOptions);
          marker = new google.maps.Marker({
                position: myLatlng,
                map: map
          });

        }
    };
})