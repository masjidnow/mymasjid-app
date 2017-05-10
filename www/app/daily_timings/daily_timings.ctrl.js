angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function($scope, Restangular, $localForage, $timeout) {
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
    var today = new Date();
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: selectedMasjid.id,
      date: today.toString() //just to avoid 304 from the server
    };
    baseSalahTimings.customGET("daily.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      ctrl.dayTimings = masjid.salah_timing;
      ctrl.monthlyInfo = masjid.monthly_info;
      $timeout(function(){
        updateMonthlyInfoLinks();
      }, 500);
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
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  ctrl.getDate = function(timing){
    return new Date(timing.year, timing.month-1, timing.day);
  }

  ctrl.showNoMasjid = function() {
    console.error("FIXME - make text for no masjid selected");
  }

  ctrl.nextIqamah = function(timing){
    var current = getCurrentPrayer(timing);
    if(!current)
      return null;
    var today = new Date();
    if(current == "dhuhr" && today.getDay() == 5) //friday
    {
      // we dont want to mark dhuhr as next since
      //its technically jummah time
      return null;
    }
    if(current == "isha")
      return "fajr";
    else
    {
      var which = ctrl.salahKeys.indexOf(current);
      which += 1;
      return ctrl.salahKeys[which];
    }
  }

  function getCurrentPrayer(timing){
    if(!allParseableIqamahTimes(timing))
      return null;
    var now = new Date();
    var salah = "isha";
    for(var i = 0; i < ctrl.salahKeys.length-1; i++)
    {
      var salahKey = ctrl.salahKeys[i];
      var time = timing[salahKey];
      if(!time || time === "")
        continue;
      var salahDate = parseTime(time, salahKey);
      if(salahDate.getTime() < now.getTime())
      {
        salah = salahKey;
      }
    }
    return salah;
  }

  var allParseableIqamahTimes = function(timing){
    var parseable = true;
    for(var i = 0; i < ctrl.salahKeys.length; i++)
    {
      var salahKey = ctrl.salahKeys[i];
      var time = timing[salahKey];
      if(!time)
        continue;
      if(isNaN(parseTime(time, salahKey)))
      {
        parseable = false;
      }
    }
    return parseable;
  };

  var parseTime = function(timeStr, salahKey){
    var dt = new Date();

    var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
    if (!time) {
        return NaN;
    }
    var hours = parseInt(time[1], 10);
    if (hours == 12 && !time[3]) {
        hours = 0;
    }
    else {
        hours += (hours < 12 && time[3]) ? 12 : 0;
    }

    // heuristics for figuring out am/pm on times that don't have it
    if(timeStr.match(/am|pm/i) == null){
      if(salahKey == 'dhuhr') {
        // dhuhr is usually PM, unless it's just before noon
        if(hours < 7)
          hours += 12; // eg. 3:00 becomes 15:00 instead of 3:00am
      } else if(salahKey == 'asr'){
        // asr is usually PM, unless it's just before noon
        if(hours < 10)
          hours += 12; // eg. 3:00 becomes 15:00 instead of 3:00am
      } else if(salahKey == 'maghrib'){
        // maghrib is always PM
        if(hours < 12)
          hours += 12; // eg. 3:00 becomes 15:00 instead of 3:00am
      } else if(salahKey == 'isha'){
        // isha is usually PM, unless it's past midnight
        if(hours > 4 && hours < 12)
          hours += 12; // eg. 3:00 becomes 15:00 instead of 3:00am
      }
    }

    dt.setHours(hours);
    dt.setMinutes(parseInt(time[2], 10) || 0);
    dt.setSeconds(0, 0);
    return dt;
  };

  function updateMonthlyInfoLinks(){
    var $links = document.querySelectorAll(".monthly-info a");
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
