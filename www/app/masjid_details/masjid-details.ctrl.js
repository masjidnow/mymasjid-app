angular.module('mymasjid.controllers')
.controller('MasjidDetailsCtrl', function(
  $scope,
  Restangular,
  SavedMasjid,
  $ionicPlatform) {
  var ctrl = this;
  ctrl.masjidNameStyle = {};

  function init(){
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return storedMasjids[0];
    }).then(function(storedMasjid){
      ctrl.masjid = storedMasjid;
      ctrl.loadMasjid(ctrl.masjid);
      return storedMasjid;
    }).then(setMasjidNameStyle);
  }

  ctrl.loadMasjid = function(selectedMasjid){
    Restangular.one("masjids", selectedMasjid.id).get().then(function(response){
      ctrl.masjid = response.masjid;
    }, function(response){
      if(response.data){
        var error = selectedMasjid.name + ": ";
        error += response.data.errors.join(", ");
        ctrl.errorMsg = error;
      }
      else{
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Please check your internet connection."
      }
    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    })
  }

  function setMasjidNameStyle(masjid){
    var style = {};
    style["background-image"] = "";
    if(masjid.cover_photo_url != null) {
      style["background-image"] += "linear-gradient(to bottom, rgba(0,0,0,.05), black)";
      style["background-image"] += ", url('" + masjid.cover_photo_url + "')";
      style["background-image"] += ", linear-gradient(to top, black, black";
    }
    style["background-size"] = "contain, contain";
    style["background-repeat"] = "no-repeat, no-repeat";
    style["background-position-x"] = "50%, 50%";
    ctrl.masjidNameStyle = style;
  };

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

});
