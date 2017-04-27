'use strict';


angular


    .module('app', ["firebase"])
//     .config( [
//         '$compileProvider',
//         function( $compileProvider )
//         {   
//             $compileProvider.aHrefSanitizationWhitelist(/^\s*(sms|https?|ftp|mailto|chrome-extension):/);
//             // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
//         }
//     ])

    .controller('AppController', function($http,$scope,$firebaseObject,$firebaseArray) {
        
        

        var baseURI = 'https://book-2724e.firebaseio.com/sante/';
        var rootRef = new Firebase(baseURI);

        var books = $scope.books = $firebaseArray(rootRef.child('books2/').orderByChild("time").limitToLast(20));
        books.$loaded(
          function(x) {
            $scope.loaded = true;
            for(var i=0;i< x.length;i++){
                var book = x[i];
                try{
                    book.search=JSON.parse(book.search||"");
                }catch(e){
                    
                }
          
            }
          }, function(error) {
            console.error("Error:", error);
          });
        function getUser(id){
            return $firebaseObject(rootRef.child('users/' + id));
        }
        $scope.slice= function(string){
            string.slice(0, 4);
        }
        $scope.mail=function(book,userFrom,userTo){
            try{
                if(!userFrom){
                    var userFrom ={
                        "address":book.address,
                        "username":book.username,
                        "tel":book.tel,
                        "geo":book.geo,
                        "status":"fa-map-marker"
                    };
                }
                if(!userTo){
                    var userTo = JSON.parse(localStorage.getItem("me"));
                    userTo.time = 0-new Date().getTime();
                    userTo.status = userFrom.status=="fa-map-marker"?"fa-truck":"fa-hourglass-start";
                    userTo.name = userTo.username;
                }
                rootRef.child('books2/'+book.$id+"/users/").push(userTo).then(function(snapshot) {
                  var text = book.description.slice(0, 4)+"..."+JSON.stringify(userFrom)+JSON.stringify(userTo);
                  smsEail(text);
                  userTo = null;
                });
                
            }catch(e){

            }
        }
        $scope.isShowGet = function(user){
            try{
            
                var me = JSON.parse(localStorage.getItem("me"));
                var user1 = {
//                     "address":me.address,
                    "username":me.username,
                    "tel":me.tel
                }
                var user2 ={
//                     "address":user.address,
                    "username":user.username,
                    "tel":user.tel
                };
                return !angular.equals(user1,user2);
            }catch(e){
            }
            return false;
        }
        function smsEail(text,success){
            var url = 'http://charon-node.herokuapp.com/cross?api=https://rest.nexmo.com/sms/json&type=unicode&api_key=0a717254&api_secret=04338afd0b978495&to=8613006248206&from=NEXMO&text='+text
            $http({
                  method: 'GET',
                  url: url
            }).then(success, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                rootRef.child('error/').push({text:text,response:response});
              });
        }
    });

