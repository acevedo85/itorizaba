// Ionic Starter App

angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'starter.services', 'ngResource', 'backand', 'ngCordova'])

    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
          var push = new Ionic.Push({
              "debug": true
          });
          push.register(function (token) {
              console.log("Device Token:", token.token);
              push.saveToken(token);  // persist the token in the Ionic Platform
          });
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
          cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }
      });
    })

.config(function(BackandProvider, $stateProvider, $urlRouterProvider, $httpProvider) {

  BackandProvider.setAppName('itorizaba');
  BackandProvider.setSignUpToken('edcdd69c-dee4-45f2-a287-da8293b4fb40');
  BackandProvider.setAnonymousToken('7836f930-b1eb-44b7-bd7e-f154f1b878b3');



  $stateProvider
      .state('splash', {
        url: '/splash',
        templateUrl: 'templates/splash.html'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl as login'
      })
      .state('registro', {
        url: '/registro',
        templateUrl: 'templates/register.html',
        controller: 'RegisterCtrl as register'
      })
      .state('app.perfil', {
        url: '/perfil',
        views: {
          'menuContent': {
            templateUrl: 'templates/perfil.html',
            controller: 'PerfilCtrl as perfil'
          }
        }
      })
      .state('app.agenda', {
        url: '/agenda',
        views: {
          'menuContent': {
            templateUrl: 'templates/agenda.html',
            controller: 'AgendaCtrl as vm'
          }
        }
      })
      .state('app.map', {
        url: '/map',
        views: {
          'menuContent': {
            templateUrl: 'templates/map.html',
              controller: 'MapCtrl as vm'
          }
        }
      })
          .state('app.anuncios', {
            url: '/anuncios',
            views: {
              'menuContent': {
                templateUrl: 'templates/anuncios.html'
              }
            }
          })
              .state('app.tecbox', {
                url: '/tecbox',
                views: {
                  'menuContent': {
                    templateUrl: 'templates/tecbox.html'
                  }
                }
              })
                  .state('app.biblio', {
                    url: '/biblio',
                    views: {
                      'menuContent': {
                        templateUrl: 'templates/biblio.html'
                      }
                    }
                  })
      .state('app.store', {
        url: '/store',
        views: {
          'menuContent': {
            templateUrl: 'templates/store.html'
          }
        }
      })
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html'
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/splash');

  $httpProvider.interceptors.push('APIInterceptor');

})

.run(function ($rootScope, $state, LoginService, Backand) {

  function unauthorized(){
    console.log("user is unauthorized, sending to login");
    $state.go('login');
  }

  function signout(){
    LoginService.signout();
  }

  $rootScope.$on('unauthorized', function () {
    unauthorized();
  })

  $rootScope.$on('$stateChangeSuccess', function (event, toState) {
    if (toState.name == 'login'){
      signout();
    }
    else if(toState.name != 'login' && Backand.getToken() === undefined){
      unauthorized();
    }
  });
})
    .factory('ConnectivityMonitor', function($rootScope, $cordovaNetwork){

        return {
            isOnline: function(){
                if(ionic.Platform.isWebView()){
                    return $cordovaNetwork.isOnline();
                } else {
                    return navigator.onLine;
                }
            },
            isOffline: function(){
                if(ionic.Platform.isWebView()){
                    return !$cordovaNetwork.isOnline();
                } else {
                    return !navigator.onLine;
                }
            },
            startWatching: function(){
                if(ionic.Platform.isWebView()){

                    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                        console.log("went online");
                    });

                    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                        console.log("went offline");
                    });

                }
                else {

                    window.addEventListener("online", function(e) {
                        console.log("went online");
                    }, false);

                    window.addEventListener("offline", function(e) {
                        console.log("went offline");
                    }, false);
                }
            }
        }
    })


