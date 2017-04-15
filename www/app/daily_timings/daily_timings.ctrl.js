angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function($scope, Restangular, $localForage) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    getStoredMasjid()
      .then(ctrl.loadTimings);
  }

  ctrl.loadTimings = function(cachedMasjid){
    ctrl.error = false;
    ctrl.isLoading = true;
    ctrl.masjid = cachedMasjid;
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: cachedMasjid.id
    };
    baseSalahTimings.customGET("daily.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      ctrl.dayTimings = masjid.salah_timing;
      ctrl.monthlyInfo = masjid.monthly_info;
    }, function(response){
      ctrl.masjid = storedMasjid;
      ctrl.error = true;
      if(response.data){
        ctrl.errorMsg = response.data.errors.join(", ");
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

  function getStoredMasjid(){
    return $localForage.getItem('cachedMasjids').then(function(cachedMasjids){
      //TODO FIXME REMOVE THIS BELOW
      return {id: 0};
      //TODO FIXME REMOVE THIS ABOVE
      if(cachedMasjids == null || cachedMasjids.length == 0)
        return null;
      else
        return cachedMasjids[0];
    });
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

  init();

});
