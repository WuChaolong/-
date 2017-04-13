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

    .controller('AppController', function($scope,$firebaseObject,$firebaseArray) {
        
        

        var baseURI = 'https://book-2724e.firebaseio.com/sante/';
        var rootRef = new Firebase(baseURI);
        var books = $scope.books = $firebaseArray(rootRef.child('books/').orderByChild("id").limitToLast(10));
        books.$loaded(
          function(x) {
            $scope.loaded = true;
            for(var i=0;i< x.length;i++){
                var book = x[i];
                book["user"]=getUser(book.userId);
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

    });
