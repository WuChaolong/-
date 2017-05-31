'use strict';


var app = angular


    .module('app', ["firebase"])
    .config( [
        '$compileProvider',
        function( $compileProvider )
        {   
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(sms|https?|ftp|mailto|chrome-extension):/);
            // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
        }
    ])

    .controller('AppController', function($http,$scope,$firebaseArray) {
        
        

        var baseURI = 'https://book-2724e.firebaseio.com/sante/';
        var rootRef = new Firebase(baseURI);
        var me = $scope.me = JSON.parse(localStorage.getItem("me"))||{};

        
        $scope.filter= JSON.parse(localStorage.getItem("filter"))||{search:me.username};
        $scope.filter.where = "sante";
        $scope.$watch('filter.where', function(newValue, oldValue) {
           if(newValue===undefined){
               return;
           }
//            if(!$scope.loaded){
// //                $scope.filter.jiushujie = oldValue;
//                return;
//            }
           if(newValue=="jiushujie"){
               loadJiushujie();
           }else if(newValue=="search"){
               loadFirebaseSearch()
           }else{
               loadFirebase();
           }
        });

        function loadFirebaseSearch(){
            var search = $scope.filter.search;
            $scope.loaded = false;
            $scope.books= $firebaseArray(rootRef.child('books2/').orderByChild("username").startAt(search).endAt(search));
            $scope.books.$loaded(
              function(x) {
                $scope.loaded = true;
              }, function(error) {
                console.error("Error:", error);
                $scope.loaded = true;
              });
        }
//         loadFirebase();
        function loadFirebase(){

            $scope.loaded = false;
            $scope.books= $firebaseArray(rootRef.child('books2/').orderByChild("time").limitToLast(20));
            $scope.books.$loaded(
              function(x) {
                $scope.loaded = true;
              }, function(error) {
                console.error("Error:", error);
                $scope.loaded = true;
              });
        }
        
    
        function loadJiushujie(){
            $scope.loaded = false;
            $scope.books= []

            var json_data = {
              "title": "title",
              "imgs":["#yw0 .book_item img.book_pic"],
              "searchAlts":["#yw0 .book_item .title>a"],
              "descriptions":[{"elem":"#yw0 .book_item .title>a","value":"text"}],
              "userImgs":[{"elem":"#yw0 .book_item .user_info_tiny img","value":"src"}],
              "usernames":[{"elem":"#yw0 .book_item .user_info_tiny img","value":"alt"}],
              "userSexs":[{"elem":"#yw0 .book_item .user_info_tiny span","value":"class"}],
              "addresss":[{"elem":"#yw0 .book_item .user_info_tiny div:first-child","value":"html"}]
            };
            $http({
                method: 'POST',
                url: "https://www.jamapi.xyz",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json;charset=utf-8'
                },
                data: {
                  url: 'http://www.jiushujie.com/sell?tag=free&ajax=yw0&sort=created_at.desc',
                  json_data: JSON.stringify(json_data)
                }
            }).then(function(response){
                $scope.books = formatJiushujieData(response.data)
                $scope.loaded = true;
            }, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(response);
                $scope.loaded = true;

              });

            function formatJiushujieData(data){

                var books = [];
                if(data.descriptions){
                    for(var i=0;i<data.descriptions.length;i++){
                        var address = data.addresss[i].value;
                        var indexStart = address.indexOf("</span>")+7;
                        var address = address.substring(indexStart);
                        var userImg = data.userImgs[i].value;
                        var indexStart = userImg.indexOf("user/")+5;
                        var indexEnd = userImg.lastIndexOf("/");
                        var date = userImg.substring(indexStart,indexEnd);
                        var book = {
                            description:data.descriptions[i].value,
                            username:data.usernames[i].value,
                            address:strip(address),
                            search:{
                                image:data.imgs[i],
                                alt:"http://www.jiushujie.com"+data.searchAlts[i]
                            },
                            sex:data.userSexs[i].value,
                            userImg:userImg,
                            time:-new Date(date).getTime()
                        }
                        books.push(book);
                    }
                }

                function strip(html)
                {
                   var tmp = document.createElement("DIV");
                   tmp.innerHTML = html.replace(/<(?:.|\n)*?>/gm, '');
                   return tmp.textContent || tmp.innerText || "";
                }


                return books;
            }
        }

        
        $scope.parseSearch = function(search) {
            if(typeof search === 'object'){
                return search;
            }
            return JSON.parse(unescape(search)||null);
        };
        $scope.sortUrl = function(url) {
            var indexStart = url.indexOf("//")+2;
            var indexEnd = indexOfCount(url,"/",3);
            
            var host = url.substring(indexStart,indexEnd);
            var hostArr = host.split(".");
            return hostArr[hostArr.length-2];

        };
        function  indexOfCount(string,searchValue,count,index){
            if(count<=0){
                return index;
            }
            
            return string.indexOf(searchValue,indexOfCount(string,searchValue,count-1,index)+1);
        }
        $scope.slice= function(string){
            return string.slice(0, 4);
        }
        $scope.mail=function(book,userFrom,userTo){
            try{
                if(!userFrom){
                    var userFrom ={
                        "address":book.address,
                        "user":book.username,
                        "tel":book.tel,
                        "geo":book.geo,
                        "status":"fa-map-marker"
                    };
                }
                if(!userTo){
                    
                    if(!JSON.parse(localStorage.getItem("me"))||{}){
                        setBookReserve(book);
                        if(inIframe()){
                            window.parent.location="me.html";
                        }else{
                            location = "me.html";
                        }
                        return;
                    }
                    var userTo = me;
                    userTo.time = 0-new Date().getTime();
                    userTo.status = userFrom.status=="fa-map-marker"?"fa-truck":"fa-hourglass-start";
                    userTo.name = userTo.username;
                }

                if(book.$id){
                    rootRef.child('books2/'+book.$id+"/users/").push(userTo).then(function(snapshot) {
                      smsEail()
                    });
                }else{
                    delete book["$$hashKey"];
                    book.users = {};
                    book.users[userTo.time]=userTo;
                    rootRef.child('books2/').push(book).then(function(snapshot){
                        book.$id=snapshot.key();
                        smsEail();
                    });
                }
                
                
            }catch(e){
                
            }

            function setBookReserve(book){
                if(book.$id){
                    localStorage.setItem("reserveBookId", book.$id);
                }else{
                    rootRef.child('books2/').push(book).then(function(snapshot){
                        book.$id=snapshot.key();
                        setBookReserve(book);
                    });
                }
            }

            function smsEail(){
                var text1 = userFrom.address+","+userFrom.tel+","+userFrom.name;
                var text2 = "."+userTo.address+","+userTo.tel+","+userTo.name;
                if(userFrom.status=="fa-map-marker"){
                 var text = book.description.slice(0, 4)+text1+text2;
                }else{
                  var text = book.description.slice(0, 4)+",不可取";
                }
                sms(text);
                userTo = null;
            }
        }
        $scope.isMe = function(user){
            try{
            
                
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
                return angular.equals(user1,user2);
            }catch(e){
                return false;
            }
            return true;
        }
        function sms(text,success){
            var url = '//charon-node.herokuapp.com/cross?api=https://rest.nexmo.com/sms/json&type=unicode&api_key=0a717254&api_secret=04338afd0b978495&to=8613006248103&from=NEXMO&text='+text
            $http({
                  method: 'GET',
                  url: url
            }).then(success, function errorCallback(response) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                rootRef.child('error/').push({text:text,response:response});
              });
        }

        $scope.userSaveWords=function(words,bookId,userId){
            rootRef.child('books2/'+bookId+"/users/"+userId+"/words").set(words||"").then(function(snapshot) {
              
            });
        }
    });
app.filter('sortAddress', function(){
    var filter = function(input){
//         return input;
        return input.split(/区|县/)[0];
    };
    return filter;
  });
app.filter('smallAddress', function(){
    var filter = function(input){
        var reverse = function(s){
            return s.split("").reverse().join("");
        }
        var match = reverse(input).match(/市|区/);
        if(match){
            var index = input.length-1-match.index;
            return input.slice(0,index+1);
        }
        return input;
    };
    return filter;
  });
app.filter('bigAddress', function(){
    var filter = function(input){
        var reverse = function(s){
            return s.split("").reverse().join("");
        }
        var match = reverse(input).match(/市|区/);
        if(match){
            var index = input.length-1-match.index;
            return input.slice(index+1);
        }
        return input;
    };
    return filter;
});
app.directive( "shear", function() {
    return function (scope, element, attr) {
        var book = scope.book;
        var options= {
            disabled: ['wechat','diandian'],
            url:"https://wuchaolong.github.io/sante/#get",
            title: book.description,
            description:"要的话给你呀",
            image:"https://wuchaolong.github.io/sante/download/logo.png"
        };
        if(book.search){
            options.description=book.search.summary;
            options.image=book.search.image;
        }
        socialShare(element,options);
    }
})












function goBack(e){
    var defaultLocation = "index.html";
    var oldHash = window.location.hash;

    history.back(); // Try to go back

    var newHash = window.location.hash;

    /* If the previous page hasn't been loaded in a given time (in this case
    * 1000ms) the user is redirected to the default location given above.
    * This enables you to redirect the user to another page.
    *
    * However, you should check whether there was a referrer to the current
    * site. This is a good indicator for a previous entry in the history
    * session.
    *
    * Also you should check whether the old location differs only in the hash,
    * e.g. /index.html#top --> /index.html# shouldn't redirect to the default
    * location.
    */

    if(
        newHash === oldHash &&
        (typeof(document.referrer) !== "string" || document.referrer  === "")
    ){
        window.setTimeout(function(){
            // redirect to default location
            window.location.href = defaultLocation;
        },1000); // set timeout in ms
    }
    if(e){
        if(e.preventDefault)
            e.preventDefault();
        if(e.preventPropagation)
            e.preventPropagation();
    }
    return false; // stop event propagation and browser default event
}
function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}