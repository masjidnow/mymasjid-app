angular.module('mymasjid.controllers')
.controller('SetupCtrl', function($scope, $state, SavedMasjid, $ionicHistory) {
  var ctrl = this;
  ctrl.showWebmasterPrompt = false;

  function init(){
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return storedMasjids[0];
    }).then(function(storedMasjid){
      if(storedMasjid != null) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go("app.dailyTimings", {}, {location: "replace"});
        return;
      }
    });

    if(ionic.Platform.isIOS()){
      ctrl.showWebmasterPrompt = false;
    } else {
      ctrl.showWebmasterPrompt = true;
    }
  }

  ctrl.shareSubject = "Please use MasjidNow for our masjid's timings";
  ctrl.shareBody = "Assalamualaikum.  Jazakallahu khair for taking care of our masjid's website. Please take a look at using MasjidNow for our masjid's prayer timings. You can learn more at https://www.masjidnow.com.";

  $scope.$on("$ionicView.enter", init);

});
