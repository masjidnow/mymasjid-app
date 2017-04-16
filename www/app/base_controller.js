angular.module('mymasjid.controllers')
.controller('BaseCtrl', function($scope, $ionicModal, $state, $ionicSideMenuDelegate, $localForage) {

  $scope.global = {};

  function getStoredMasjids(){
    return $localForage.getItem('storedMasjids').then(function(storedMasjids){
      storedMasjids = storedMasjids || [];
      $scope.otherMasjids = storedMasjids.slice(1);
      if(storedMasjids.length == 0)
        return null;
      else
        return storedMasjids[0];
    }).then(function(storedMasjid){
      $scope.global.selectedMasjid = storedMasjid;
    });
  };

  $scope.hideSideMenu = function(){
    $ionicSideMenuDelegate.toggleLeft(false);
    return true;
  }

  $scope.openChild = function(stateName){
    $state.go(stateName);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  $scope.toggleShowingOtherMasjids = function(){
    $scope.showingOtherMasjids = !$scope.showingOtherMasjids;
    return true;
  }

  $scope.setSelectedMasjid = function(masjid){
    return $localForage.getItem("storedMasjids")
      .then(function(storedMasjids){
        storedMasjids = storedMasjids || [];
        var storedIndex = _.findIndex(storedMasjids, function(storedMasjid){
          if(storedMasjid.id == masjid.id){
            return masjid;
          }
        });
        if(storedIndex != -1){
          storedMasjids.splice(storedIndex, 1);
        }
        storedMasjids.unshift(masjid);
        $scope.global.selectedMasjid = masjid;
        return $localForage.setItem("storedMasjids", storedMasjids);
      }).then(function(){
        $scope.$broadcast("mymasjid.selectedMasjidChanged");
      })
      .then(getStoredMasjids);
  }


  getStoredMasjids();

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  // $scope.loginData = {};

  // // Create the login modal that we will use later
  // $ionicModal.fromTemplateUrl('app/login.html', {
  //   scope: $scope
  // }).then(function(modal) {
  //   $scope.modal = modal;
  // });

  // // Triggered in the login modal to close it
  // $scope.closeLogin = function() {
  //   $scope.modal.hide();
  // };

  // // Open the login modal
  // $scope.login = function() {
  //   $scope.modal.show();
  // };

  // // Perform the login action when the user submits the login form
  // $scope.doLogin = function() {
  //   console.log('Doing login', $scope.loginData);

  //   // Simulate a login delay. Remove this and replace with your login
  //   // code if using a login system
  //   $timeout(function() {
  //     $scope.closeLogin();
  //   }, 1000);
  // };
});
