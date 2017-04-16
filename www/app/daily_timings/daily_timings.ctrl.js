angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function($scope, Restangular, $localForage) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    $localForage.getItem("storedMasjids").then(function(storedMasjids){
      return (storedMasjids || [])[0];
    }).then(function(storedMasjid){
      if(storedMasjid == null)
        ctrl.showNoMasjid();
      else
        ctrl.loadTimings(storedMasjid);
    });
  }

  $scope.$on("$ionicView.enter", init);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

  ctrl.loadTimings = function(selectedMasjid){
    ctrl.errorMsg = null;
    ctrl.isLoading = true;
    ctrl.masjid = selectedMasjid;
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: selectedMasjid.id
    };
    baseSalahTimings.customGET("daily.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      ctrl.dayTimings = masjid.salah_timing;
      ctrl.monthlyInfo = masjid.monthly_info;
    }, function(response){
      ctrl.masjid = selectedMasjid;
      if(response.data){
        var error = selectedMasjid.name + ": ";
        error += response.data.errors.join(", ");
        ctrl.errorMsg = error;
      }
      else{
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Pleae check your internet connection."
      }
    }).finally(function(){
      ctrl.isLoading = false;
    });
  };

  ctrl.getDate = function(timing){
    return new Date(timing.year, timing.month-1, timing.day);
  }

  ctrl.showNoMasjid = function() {
    console.error("FIXME - make text for no masjid selected");
  }

  // the keys that the template should display
  ctrl.salahKeys = [
    "fajr",
    "sunrise",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ];

  ctrl.salahNames = {
    "fajr": "Fajr",
    "sunrise": "Sunrise",
    "dhuhr": "Dhuhr",
    "asr": "Asr",
    "maghrib": "Maghrib",
    "isha": "Isha",
  }

});
