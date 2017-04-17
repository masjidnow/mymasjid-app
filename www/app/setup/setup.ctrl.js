angular.module('mymasjid.controllers')
.controller('SetupCtrl', function($scope, $state, $localForage, $ionicHistory) {
  var ctrl = this;

  function init(){
    $localForage.getItem("storedMasjids").then(function(storedMasjids){
      return (storedMasjids || [])[0];
    }).then(function(storedMasjid){
      if(storedMasjid != null) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("app.dailyTimings", {}, {location: "replace"});
        return;
      }
    });
  }

  $scope.$on("$ionicView.enter", init);

});
