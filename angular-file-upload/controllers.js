'use strict';


angular


    .module('app', ['angularFileUpload'])


    .controller('AppController', ['$scope', 'FileUploader',function($scope, FileUploader) {
        
        var uploader = $scope.uploader = new FileUploader();
        var book = $scope.book = Book();
        var me = $scope.me = JSON.parse(localStorage.getItem("me"));
        var status = $scope.status = {};
        function Book(){
            return {id:0-new Date().getTime()};
        }

        var baseURI = 'https://book-2724e.firebaseio.com/test/';
        var rootRef = new Firebase(baseURI);

        $scope.submit = function(book,me) {
            if(status.submit) return;
            me = me||{};book = book||{};
            status.submit = true;
            me.id = me.id||book.id;
            rootRef.child('users/' + me.id).set(me).then(function(){
                localStorage.setItem("me", JSON.stringify(me));
            });
            // Save data to the current local store

            book.userId = me.id;
            rootRef.child('books/'+book.id).set(book)
                .then(function() {
                        console.log('Synchronization succeeded');
//                         $scope.reset();
//                         location="/book/list.html";
                           $scope.submitSuccess = true;
                           window.goBack();
                })
                .catch(function(error) {
                        console.log('Synchronization failed');
                        $scope.status.submit = undefined;
                });
            
        };
        $scope.reset = function(){
            console.log("test");
            $scope.status.submit =  undefined;
            uploader.clearQueue();
            $scope.book = Book();
            $scope.$apply();
        }
        


        
        uploader.githupUpload = function(fileItem){
                
//              fileItem.progress = 50;
                var fn = function (result){
                        fileItem["reader"]=result;
                        $scope.$apply()
                        var base64 = result.slice(result.indexOf(",")+1);
                        var data = {
                                    message: "book",
                                    branch:"gh-pages",
                                    content: base64
                            };
                        var url = "https://api.github.com/repos/WuChaolong/storage/contents/sante/img/"+book.id+"_"+fileItem._file.name;

                        githupPut(url,data,function(text){

                                if(!book.puctures){
                                        book.puctures = [];
                                }
                                try{
                                    var downloadURL = JSON.parse(text).content.download_url;   
                                    
                                    console.log(downloadURL);
                                    book.puctures.push(downloadURL);
                                }catch(e){
                                    uploader.removeFromQueue(fileItem);
                                }
                                

                                fileItem.progress = 100;
                                $scope.$apply();
                        });
                }

                try{
                     fileReaderToDataURL(fileItem._file,fn);    
                }catch(e){
                     try{  
                        canvasToDataURL(fileItem._file,fn); 
                     }catch(e){

                     }
                }
                
                
        }

//         uploader.firebaseUpload = function(fileItem){
//             // create a Storage reference for the $firebaseStorage binding
//             var puctureUrl = 'pucture/'+book.id+"_"+fileItem._file.name;
//             var storageRef = firebase.storage().ref(puctureUrl);
//             var storage = $firebaseStorage(storageRef);
//             var uploadTask = storage.$put(fileItem._file);
//             // of upload via a RAW, base64, or base64url string
//             var stringUploadTask = storage.$putString('5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB', 'base64');
//             uploadTask.$progress(function(snapshot) {
//               var percentUploaded = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//               console.log(percentUploaded);
//               console.log(fileItem.progress);
//               fileItem.progress = percentUploaded;
//             });
//             uploadTask.$complete(function(snapshot) {
//                 console.log(snapshot.downloadURL);
//                 if(!book.pucture){
//                         book.pucture = [];
//                 }
//                 book.pucture.push(snapshot.downloadURL);
//             });
//         }
        // FILTERS
        
        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                return this.queue.length < 10;
            }
        });

        // CALLBACKS

        uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
            console.info('onWhenAddingFileFailed', item, filter, options);
        };
        uploader.onAfterAddingFile = function(fileItem) {
            console.log('onAfterAddingFile');
//             fileItem.upload();
            uploader.githupUpload(fileItem);
        };
        uploader.onAfterAddingAll = function(addedFileItems) {
            console.info('onAfterAddingAll');
        };
        uploader.onBeforeUploadItem = function(item) {
            console.info('onBeforeUploadItem', item);
        };
        uploader.onProgressItem = function(fileItem, progress) {
            console.info('onProgressItem', fileItem, progress);
        };
        uploader.onProgressAll = function(progress) {
            console.info('onProgressAll', progress);
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            console.info('onSuccessItem', fileItem, response, status, headers);
        };
        uploader.onErrorItem = function(fileItem, response, status, headers) {
            console.info('onErrorItem', fileItem, response, status, headers);
        };
        uploader.onCancelItem = function(fileItem, response, status, headers) {
            console.info('onCancelItem', fileItem, response, status, headers);
        };
        uploader.onCompleteItem = function(fileItem, response, status, headers) {
            console.info('onCompleteItem', fileItem, response, status, headers);
        };
        uploader.onCompleteAll = function() {
            console.info('onCompleteAll');
        };

//         console.info('uploader', uploader);


        // -------------------------------


        var controller = $scope.controller = {
            isImage: function(item) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };
    }]);


function githupPut(url,data,success){
        var httpRequest;
        if (window.XMLHttpRequest) { // Mozilla, Safari, IE7+ ...
            httpRequest = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE 6 and older
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        httpRequest.onload = function(){
            var text = httpRequest.response;
               success(text);
               httpRequest = null;
        }
        httpRequest.open('PUT',url,true);
        httpRequest.setRequestHeader("Authorization","token dcd5f360e3f4a29ab3cef01db3a45bfb90c42579");
        httpRequest.setRequestHeader("Content-Type","application/json; charset=utf-8");

        httpRequest.send(JSON.stringify(data));
        data = null;
}
function canvasToDataURL(file,fn){
        var canvas = document.createElement('CANVAS');
            var ctx = canvas.getContext('2d');
            var dataURL;
            var img = new Image();
        img.onload = function() {
            img.style.maxWidth = "none";
            canvas.width=img.width,canvas.height=img.height;
            ctx.drawImage(img, 0,0);
            dataURL = canvas.toDataURL();
            if(fn){fn(dataURL)};
            canvas = null;
            img = null;
            ctx = null;
        }
        img.src = URL.createObjectURL(file);
}
function fileReaderToDataURL(file,fn){
        var reader  = new FileReader();
        reader.addEventListener("load", function () {

               if(fn){ fn(reader.result);}
//                         // Old compatibility code, no longer needed.

        }, false);

        if (file) {
                reader.readAsDataURL(file);
        }
}

function goBack(e){
    var defaultLocation = "/book/";
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