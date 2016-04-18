/**
 * Created by Academia on 1/4/2016.
 */

angular.module('starter.services', ['backand'])

    .service('APIInterceptor', function ($rootScope, $q) {
        var service = this;

        service.responseError = function (response) {
            if (response.status === 401){
                $rootScope.$broadcast('unauthorized');
            }
            return $q.reject(response);
        };
    })

    .service('LoginService', function (Backand) {
        var service = this;
        service.currentUser = {};
        service.signin = function (email, password, appName) {
            //Call server in Backand for sign in
            return Backand.signin(email, password).
                then(function (response) {
                loadUserDetails();
                return response;
            });
        }
        service.signup = function (firstName, lastName, email, password, parameters) {
            return Backand.signup(firstName, lastName, email, password, password, parameters)
                .then(function (signUpResponse) {
                        return service.signin(email, password)
                            .then(function () {
                                return signUpResponse;
                            });


                });
        }
        function loadUserDetails(){
            return Backand.getUserDetails(  )
                .then(function (data) {
                    service.currentUser.details = data;
                })
        }
        service.signout = function () {
            return Backand.signout();
        }
    })
    .service('EventService', function ($http, Backand) {
        var service = this,
             baseUrl = '/1/objects/',
             objectName = 'classes/';

        service.getClass = function (x) {
            return $http ({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/query/data/getClass',
                params: {
                    parameters: {
                        input1: x
                    }
                }
            });
        }

        function getUrl(){
            return Backand.getApiUrl() + baseUrl + objectName;
        }


        function getUrlForId(id){
            return getUrl() + id;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.allDeep = function () {
          return $http.get(getUrl() + "?deep=true");
        };

        service.fetch = function (id) {
            return $http.get(getUrlForId(id));
        };

        service.fetchDeep = function (id) {
            return $http.get(getUrlForId(id)+"?deep=true");
        };

        service.create = function (object) {
            return $http.post(getUrl(), object);
        };

        service.update = function (id, object) {
            return $http.put(getUrlForId(id), object);
        };

        service.delete = function (id) {
            return $http.delete(getUrlForId(id));
        };
    })
    .service('DaysService', function ($http, Backand) {
        var service = this,
        baseUrl = '/1/objects/',
            objectName = 'days/';

        service.fetchDays = function (name) {
            return $http ({
                method: 'GET',
                url: Backand.getApiUrl() + '/1/query/data/getDays',
                params: {
                    parameters: {
                        input1: name
                    }
                }
            });
        };

        function getUrl(){
            return Backand.getApiUrl() + baseUrl + objectName;
        }

        function getUrlForId(id){
            return getUrl() + id;
        }

        service.all = function () {
            return $http.get(getUrl());
        };

        service.fetch = function (id) {
            return $http.get(getUrlForId(id));
        };

        service.create = function (object) {
            return $http.post(getUrl(), object);
        };

        service.update = function (id, object) {
            return $http.put(getUrlForId(id), object);
        };

        service.delete = function (id) {
            return $http.delete(getUrlForId(id));
        };

    })
  .service('UserService', function ($http, Backand) {
      var service = this,
          baseUrl = '/1/objects/',
          objectName = 'users/';

      function getUrl(){
          return Backand.getApiUrl() + baseUrl + objectName;
      }

      function getUrlForId(id){
          return getUrl() + id;
      }

      service.all = function () {
          return $http.get(getUrl());
      };

      service.fetch = function (id) {
          return $http.get(getUrlForId(id));
      };

      service.create = function (object) {
          return $http.post(getUrl(), object);
      };
      
      service.getByEmail = function (email) {
          return $http({
              method: "GET",
              url: Backand.getApiUrl() + "/1/objects/users",
              params: {filter:[{"fieldName":"email", "operator":"equals", "value": email}]}
          });
      }

      service.update = function (id, object) {
          return $http.put(getUrlForId(id), object);
      };

      service.delete = function (id) {
          return $http.delete(getUrlForId(id));
      };
  })
.factory('FileService', function () {
    var images;
    var IMAGE_STORAGE_KEY = 'images';

    function getImages(){
        var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
        if (img) {
            images = JSON.parse(img);
        } else {
            images = [];
        }
        return images;
    };

    function addImage(img){
        //images.pop();
        images = [];
        images.push(img);
        window.localStorage.clear();
        window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
    };

    return {
        storeImage: addImage,
        images: getImages
    }
})
.factory('ImageService', function ($cordovaCamera, FileService, $q, $cordovaFile) {
   // var currentImage = this;

    function makeid() {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    function optionsForType(type) {
        var source;
        switch (type) {
            case 0:
                source = Camera.PictureSourceType.CAMERA;
                break;
            case 1:
                source = Camera.PictureSourceType.PHOTOLIBRARY;
                break;
        }
        return {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: source,
            allowEdit: false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
    }

    function saveMedia(type) {
        return $q(function (resolve, reject) {
            var options = optionsForType(type);

            $cordovaCamera.getPicture(options).then(function (imageUrl) {
                var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
                var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
                var newName = makeid() + name;

               // currentImage = newName;
                $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
                    .then(function (info) {
                        FileService.storeImage(newName);
                        resolve();
                    }, function (e) {
                        reject();
                    });
            });
        })
    }
    return {
        handleMediaDialog: saveMedia
    }

})