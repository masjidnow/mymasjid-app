angular.module('mymasjid.controllers')
.controller('MonthlyTimingsCtrl', function($scope, Restangular, $localForage) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    ctrl.today = new Date();
    ctrl.todayStr = ctrl.today.getYear() + "-" + ctrl.today.getMonth() + "-" + ctrl.today.getDate();
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
    baseSalahTimings.customGET("monthly.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      ctrl.monthTimings = _.map(masjid.salah_timings, function(t){return t["salah_timing"]});
      ctrl.monthTimings = _.map(ctrl.monthTimings, function(t){
        t.date = new Date(t.year, t.month -1, t.day);
        t.dateStr = t.date.getYear() + "-" + t.date.getMonth() + "-" + t.date.getDate();
        return t;
      });
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

  ctrl.isToday = function(timing){
    return ctrl.todayStr == timing.dateStr;
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
