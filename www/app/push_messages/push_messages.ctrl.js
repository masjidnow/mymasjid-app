angular.module('mymasjid.controllers')
.controller('PushMessagesCtrl', function($scope, Restangular, $localForage) {
  var ctrl = this;

  function init(){
    ctrl.today = new Date();
    ctrl.pushMessagesEnabled = true;
    $localForage.getItem("storedMasjids").then(function(storedMasjids){
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
    });
  }

  $scope.$on("$ionicView.enter", init);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

});
