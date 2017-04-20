'use strict';


angular


    .module('app', ["firebase"])
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {   
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(sms|https?|ftp|mailto|chrome-extension):/);
            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
    ])

    .controller('AppController', function($http,$scope,$firebaseObject,$firebaseArray) {
        
        

        var baseURI = 'https://book-2724e.firebaseio.com/sante/';
        var rootRef = new Firebase(baseURI);
        var books = $scope.books = $firebaseArray(rootRef.child('books2/').orderByChild("time").limitToLast(10));
        books.$loaded(
          function(x) {
            $scope.loaded = true;
            for(var i=0;i< x.length;i++){
                var book = x[i];
//                 book["user"]=getUser(book.userId);
//                 getSearch(book.search,book);
                try{
                    book.search=JSON.parse(book.search);
                }catch(e){
                    
                }
          
            }
          }, function(error) {
            console.error("Error:", error);
          });
        function getSearch(searchUrl,object){
            
            if(!searchUrl){
                return;
            }
            $http({
                  method: 'GET',
                  url: searchUrl
            }).then(function successCallback(response) {
                console.log(response);
                object = response.data;
                // this callback will be called asynchronously
                // when the response is available
              }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
              });
        }
        function getUser(id){
            return $firebaseObject(rootRef.child('users/' + id));
        }
        $scope.slice= function(string){
            string.slice(0, 4);
        }

    });
