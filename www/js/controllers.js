
angular.module('starter.controllers', [])
  .controller('LoginCtrl', function (Backand,  $state, LoginService, $rootScope, $ionicPopup, ConnectivityMonitor, FileService) {
    var login = this;
    function signin(){
      if(ConnectivityMonitor.isOnline()){
        LoginService.signin(login.email, login.password)
          .then(function () {
            onLogin();
            login.password = '';
          }, function (error) {
            $ionicPopup.alert({
              title: 'Error',
              template: 'Verifica y vuelve a intentar'
            });
            console.log(error)
          })}
      else {
        $ionicPopup.alert({
          title: 'No internet',
          content: 'No se detecta una conexión a internet, reconecta e intenta de nuevo'
        })}}
    function onLogin(){
      login.usuario = LoginService.currentUser;
      $rootScope.$broadcast('authorized');
      $state.go('app.perfil');
    }
    login.usuario = "";
    login.signin = signin;
  })
  .controller('RegisterCtrl', function (Backand,  $state, LoginService, $rootScope, $ionicPopup) {
    var register = this;
    function signup(){
      var parameters = {apellidoMaterno: register.apellidoMaterno || '', carrera: register.carrera || '', numeroControl: register.numeroControl};
      LoginService.signup(register.firstName, register.lastName, register.email, register.password, parameters)
        .then(function (response) {
          $state.go('app.perfil');
          $rootScope.$broadcast('authorized');
        }, function(error){
          $ionicPopup.alert({
            title: 'Error en tus credenciales',
            template: 'Verifica y vuelve a intentar'
          });
          console.log(error);
        })
    }
    register.signup = signup;
  })
  .controller('PerfilCtrl', function ($timeout, $stateParams,$ionicLoading, FileService, ImageService, $ionicHistory, $cordovaCamera, $http, Backand, $state, LoginService, UserService, $rootScope, $scope, $cordovaDevice, $cordovaFile, $ionicPlatform, $ionicActionSheet) {
    var login = this;
    function refreshImg(){
      $scope.images = FileService.images();
      console.log(cordova.file.dataDirectory + $scope.images);

      if ($scope.images == []){
        $scope.urlForImage = 'img/noprofile.jpg';
      }
      else {
        $scope.urlForImage =  cordova.file.dataDirectory + $scope.images;
      }

      $scope.$apply();
    }
    $scope.addMedia = function () {
      $scope.hideSheet = $ionicActionSheet.show({
        buttons: [
          { text : 'Tomar Foto'},
          { text : 'Foto de Galeria'}
        ],
        titleText: 'Agregar imagen',
        cancelText: 'Cancelar',
        buttonClicked: function (index) {
          $scope.addImage(index);
        }
      });
    }
    $scope.addImage = function (type) {
      $scope.hideSheet();
      ImageService.handleMediaDialog(type).then(function () {
        refreshImg();
      });
    }

    UserService.getByEmail(LoginService.currentUser.details.username)
      .then(function (response) {
        login.currentUser = response.data.data[0];
      });
    function signout(){
      $ionicLoading.show({
        template: 'Cerrando sesion...'
      });
      $timeout(function () {
        LoginService.signout()
          .then(function () {
            //$state.go('splash');
            $ionicLoading.hide();
            $rootScope.$broadcast('logout');
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $ionicHistory.nextViewOptions({
              disableBack: 'true',
              historyRoot: 'true'
            });
            $state.go('splash', {}, {reload: true});


          }, function (error) {
            alert(error);
          })
      }, 1000);

    }
    login.signout = signout;
    // login.refreshImg = refreshImg;

  })
  .controller('AgendaCtrl', function (EventService, $rootScope, DaysService) {
    var vm = this;
    function getToday(){
      var d = new Date();
      var n = d.getDay() - 1;
      return inverseDayConvert(n);
    }
    function getAll() {
      EventService.all()
        .then(function (result) {
          vm.data = result.data.data;
        });
    }
    function clearData(){
      vm.data = null;
      vm.days = null;
      vm.classes = null;
    }
    function create(object) {
      EventService.create(object)
        .then(function (result) {
          cancelCreate();
          getAll();
        });
    }
    function getDayToday(){
      var d = new Date();
      var n = d.getDay() -1;
      DaysService.fetchDays(n)
        .then(function (data) {
          console.log(data);
          vm.classes = data.data;
          vm.isWeekDay = true;
        })

    }
    function getDays(object){
      EventService.fetchDeep(object.id)
        .then(function (data) {
          vm.days = data.data.days;
          vm.edited = angular.copy(object);
          vm.isShowing = true;
          // console.log(data.data.days[0].name);
        })
    }
    function createDay(object, id){
      object.class = id.id;
      object.name = dayConvert(object.name);
      DaysService.create(object)
        .then(function (result) {
          cancelConfig();
          getDays(id);
        })
    }
    function update(object) {
      EventService.update(object.id, object)
        .then(function (result) {
          cancelEditing();
          getAll();
        });
    }
    function updateDays(object){
      object.name = dayConvert(object.name);
      DaysService.update(object.id, object)
        .then(function (result) {
          cancelEditingDays();
          getDays(object.class);
        })
    }
    function deleteObject(id) {
      EventService.delete(id)
        .then(function (result) {
          cancelEditing();
          getAll();
        });
    }
    function deleteDay(id) {
      DaysService.delete(id.id)
        .then(function (result) {
          cancelEditingDays();
          getDays(id.class);
        })
    }
    function dayConvert(string){
      var num = null;
      switch (string){
        case 'Lunes':
          num = 0;
          break;
        case 'Martes':
          num = 1;
          break;
        case 'Miercoles':
          num = 2;
          break;
        case 'Jueves':
          num = 3;
          break;
        case 'Viernes':
          num = 4;
          break;
      }
      return num;
    }
    function inverseDayConvert(float){
      var day = '';
      switch (float){
        case 0:
          day = 'Lunes';
          break;
        case 1:
          day = 'Martes';
          break;
        case 2:
          day = 'Miercoles';
          break;
        case 3:
          day = 'Jueves';
          break;
        case 4:
          day = 'Viernes';
          break;
      }
      return day;
    }
    function initCreateForm() {
      vm.newObject = {name: '', teacher: ''};
    }
    function initConfigForm() {
      vm.newDay = {name: ''}
    }
    function setEdited(object) {
      vm.edited = angular.copy(object);
      vm.isEditing = true;
    }
    function setEditedDays(object) {
      vm.edited = angular.copy(object);
      vm.isEditingDays = true;
    }
    function setConfig(object){
      vm.configured = angular.copy(object);
      vm.isConfiguring = true;
    }
    function isCurrent(id) {
      return vm.edited !== null && vm.edited.id === id;
    }
    function cancelEditing() {
      vm.edited = null;
      vm.isEditing = false;
    }
    function cancelEditingDays(){
      vm.edited = null;
      vm.isEditingDays = false;
    }
    function cancelShowing() {
      vm.edited = null;
      vm.days = null;
      vm.isShowing = false;
    }
    function cancelCreate() {
      initCreateForm();
      vm.isCreating = false;
    }
    function cancelWeekDay() {
      vm.isWeekDay = false;
    }
    function cancelConfig() {
      initConfigForm();
      vm.configured = null;
      vm.isConfiguring = false;
    }

    vm.objects = [];
    vm.edited = null;
    vm.configured = null;
    vm.isEditing = false;
    vm.isCreating = false;
    vm.isWeekDay = false;
    vm.isConfiguring = false;
    vm.isShowing = false;
    vm.getDays = getDays;
    vm.getToday = getToday;
    vm.getAll = getAll;
    vm.create = create;
    vm.createDay = createDay;
    vm.update = update;
    vm.updateDays = updateDays;
    vm.delete = deleteObject;
    vm.deleteDay = deleteDay;
    vm.setEdited = setEdited;
    vm.setEditedDays = setEditedDays;
    vm.setConfig = setConfig;
    vm.isCurrent = isCurrent;
    vm.cancelEditing = cancelEditing;
    vm.cancelEditingDays = cancelEditingDays;
    vm.inverseDayConvert = inverseDayConvert;
    vm.cancelCreate = cancelCreate;
    vm.cancelConfig = cancelConfig;
    vm.cancelShowing = cancelShowing;
    vm.cancelWeekDay = cancelWeekDay;
    vm.isAuthorized = false;
    vm.getDayToday = getDayToday;

    $rootScope.$on('authorized', function () {
      vm.isAuthorized = true;
      getAll();
    });

    $rootScope.$on('logout', function () {
      clearData();
    });

    if(!vm.isAuthorized){
      $rootScope.$broadcast('logout');
    }
    initConfigForm();
    initCreateForm();
    getAll();

  })
  .controller('MapCtrl', function ($ionicLoading) {
    var vm = this;
    vm.showMap = false;
    vm.goMap = goMap;
    function goMap(){
      $ionicLoading.show({
        duration: '5000'
      });
      //$ionicLoading.hide();
      vm.showMap = true;
    }
  })
  .controller('WebCtrl', function ($ionicLoading) {
  var vm = this;
    vm.showWeb = false;
    vm.goWeb = goWeb;
    function goWeb() {
      $ionicLoading.show({
        duration: '8000'
      });
      vm.showWeb = true;
    }
})
  .controller('NotificationCtrl', function ($scope, $ionicPush) {

  })
  .controller('GalleryCtrl', function ($scope, $ionicBackdrop, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate ) {
    $scope.allImages = [{
      src: 'img/pic1.jpg',
      titulo: 'Duela',
      descripcion: 'Duela donde los equipos de baloncesto y voleybol realizan sus partidos y entrenamientos.'
    }, {
      src: 'img/pic2.jpg',
      titulo: 'Entrada principal',
      descripcion: 'Recien remodelada entrada principal'
    }, {
      src: 'img/pic3.jpg',
      titulo: 'Auditorio',
      descripcion: 'Lugar donde se realizan eventos importantes como conferencias, titulaciones, concursos y torneos deportivos'
    }];
    $scope.zoomMin = 1;
    $scope.showImages = function (index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/gallery-zoomview.html');
    };
    $scope.showModal = function (templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }
    $scope.closeModal = function () {
      $scope.modal.hide();
      $scope.modal.remove()
    };
    $scope.updateSlideStatus = function (slide) {
      var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
      if (zoomFactor == $scope.zoomMin){
        $ionicSlideBoxDelegate.enableSlide(true);
      } else {
        $ionicSlideBoxDelegate.enableSlide(false);
      }
    };
  })

