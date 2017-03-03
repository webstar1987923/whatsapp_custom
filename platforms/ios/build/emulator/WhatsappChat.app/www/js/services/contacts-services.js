angular.module('contacts.services', []).factory('ContactsServices', ContactsServices);

ContactsServices.$inject = ['$q','CouchDBServices'];

/**
 * @name ContactsServices
 * @desc Singleton service class with static methods for actions with user contacts.
 * @param $q - service that helps you run functions asynchronously, and use their return values
 *              when they are done processing
 * @param CouchDBServices - service for actions with CouchDB
 * @param UserSessionServices - service for checking user data and session
 */
function ContactsServices($q,CouchDBServices,$cordovaContacts) {

    return {
        getSimJsonContacts:getSimJsonContacts,
        checkAndUpdateContacts:checkAndUpdateContacts
    };
    
   function getSimJsonContacts(countrycode){
        console.log("ContactsServices.getSimContacts()");
        var q = $q.defer();
        //var phoneContacts=[];
        var phoneContactsJson=[];
        var mobileContactsJson=[];
        function onSuccess(contacts)
        {
            
            
            for (var i = 0; i < contacts.length; i++)
            {
                var contact = contacts[i];
                var no =contacts[i].name.formatted;
                var phonenumber=contacts[i].phoneNumbers;
                if(phonenumber != null)
                {
                    for(var n=0;n<phonenumber.length;n++)
                    {
                        var type=phonenumber[n].type;
                        if(type=='mobile')
                        {

                            var phone=phonenumber[n].value;
                            // console.log("Phone Number >>>"+phone);
                            var mobile;
                            if(phone.slice(0,1)=='+' || phone.slice(0,1)=='0')
                            {
                                mobile=phone.replace(/[^a-zA-Z0-9+]/g, "");
                            }
                            else
                            {
                                var mobile_no=phone.replace(/[^a-zA-Z0-9]/g, "");
                                mobile=countrycode+mobile_no;
                            }
                            var contactData={
                                "_id":mobile,
                                "name":no,
                                "phone":mobile,
                                "isUser":'0'
                            }
                            phoneContactsJson.push(contactData);
                            mobileContactsJson.push(mobile);

                        }
                    }
                }
            }

            var collection={
                phones:phoneContactsJson,
                mobiles:mobileContactsJson
            };

            q.resolve(collection);
        }
        
        function onError(contactError) {
            
            console.log("on Error"+contactError);
            console.log('onError!');
        }
        
        var options =  new ContactFindOptions();;
        options.filter = "";
        options.multiple=true;
        options.hasPhoneNumber=true;
        var fields = ["*"];
        
        navigator.contacts.find(fields,onSuccess, onError, options);
        return q.promise;

   }
 
   function checkAndUpdateContacts(){
        console.log("ContactsServices.checkAndUpdateContacts()");
        var q = $q.defer();
        this.getSimContacts().then(function(simContacts){
            console.log("fetched sim contacts");
            CouchDBServices.getDocuments(simContacts).then(function(appUsers){
                if(appUsers.rows.length!=0){
                    var contacts=[];
                    angular.forEach(appUsers.rows,function(user){
                        if('doc' in user){
                            if(user.doc!=null){
                                console.log("fetched contacts info that are app users");
                                contacts.push(
                                    {
                                        'firstName'  : user.doc.firstName,
                                        'lastName'   : user.doc.lastName,
                                        'phone'      : user.doc.phone
                                    }
                                );
                            }
                        }
                    });
                    var userData=UserSessionServices.getUser();
                    if(JSON.stringify(userData.contacts)!=JSON.stringify(contacts)){
                        console.log("local contacts != remote app users that are sim contacts");
                        userData.contacts=contacts;
                        var user=userData;
                        var userId=userData._id;
                        delete userData['_id'];
                        CouchDBServices.updateDocument(userId,userData).then(function(success){
                            console.log("updated remote contacts, saving to local storage");
                            UserSessionServices.setUser(user);
                            q.resolve(userData.contacts);
                            console.log(success);
                        },function(err){
                            console.log("error when updating document");
                            q.reject(err);
                        });
                    }else{
                        q.reject("up to date");
                    }
                }else{
                    q.reject("there is no contacts");
                }
            },function(err){
                q.reject(err);
            });
        },function(err){
            q.reject(err);
        });
        return q.promise;
   }
}

