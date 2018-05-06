angular.module('mymasjid.controllers')
.controller('PushMessagesCtrl', function($scope, Restangular, SavedMasjid, $ionicPlatform, $timeout) {
  var ctrl = this;

  function init(){
    ctrl.today = new Date();
    ctrl.pushMessagesEnabled = true;
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return (storedMasjids || [])[0];
    }).then(function(storedMasjid){
      if(storedMasjid == null)
        ctrl.showNoMasjid();
      else
        ctrl.loadMessages(storedMasjid);
    });
  }

  ctrl.loadMessages = function(masjid){
    ctrl.errorMsg = null;
    ctrl.isLoading = true;
    ctrl.masjid = masjid;
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: masjid.id
    };

    Restangular.all("salah_timings").customGET("monthly.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      ctrl.messages = _.map(masjid.push_messages, "push_message");
      ctrl.pushMessagesEnabled = masjid.push_messages_enabled;

      $timeout(function(){
        updateLinks();
      }, 500);
    }, function(response){
      ctrl.masjid = masjid;
      if(response.data){
        var error = masjid.name + ": ";
        error += response.data.errors.join(", ");
        ctrl.errorMsg = error;
      }
      else{
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Pleae check your internet connection."
      }
    }).finally(function(){
      ctrl.isLoading = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }


  function updateLinks(){
    var $links = document.querySelectorAll(".push-messages .push-message a");
    console.log("Found ", $links.length, "links to fix.");
    for(var i =0; i < $links.length; i++) {
      var $link = $links[i];
      var href = $link.href;
      console.log("Fixing link to ", href);
      $link.onclick = function(e){
        e.preventDefault();
        var url = e.currentTarget.getAttribute("href");
        window.cordova.InAppBrowser.open(url, "_system");
      }
    }
  }

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);
  $scope.$on("mymasjid.selectedMasjidChanged", init);
  ctrl.isLoading = true;
});
