angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function(
  $scope,
  Restangular,
  SavedMasjid,
  $timeout,
  $ionicPlatform,
  PrayerTimeParser,
  $ionicModal
  ) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    ctrl.displayedDate = new Date();
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return (storedMasjids || [])[0];
    }).then(function(storedMasjid){
      if(storedMasjid == null)
        ctrl.showNoMasjid();
      else
        ctrl.loadTimings(storedMasjid);
    });
  }

  function leave(){
    if($scope.datePickerModal !== null) {
      $scope.datePickerModal.remove();
      $scope.datePickerModal = null;
    }
  }

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);
  $scope.$on("$ionicView.leave", leave);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

  ctrl.loadTimings = function(selectedMasjid, date){
    ctrl.errorMsg = null;
    ctrl.isLoading = true;
    ctrl.masjid = selectedMasjid;
    if(date == null)
      date = new Date();
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: selectedMasjid.id,
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear()
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
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Please check your internet connection."
      }
    }).finally(function(){
      ctrl.isLoading = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  ctrl.refresh = function(){
    ctrl.loadTimings(ctrl.masjid, ctrl.displayedDate);
  }

  ctrl.getDate = function(timing){
    return new Date(timing.year, timing.month-1, timing.day);
  }

  ctrl.showNoMasjid = function() {
    console.error("FIXME - make text for no masjid selected");
  }

  ctrl.resetDate = function(){
    ctrl.displayedDate = new Date();
    ctrl.refresh();
  }

  ctrl.isToday = function(date){
    var today = new Date();
    var day = date.getDate();
    var month = date.getMonth();
    var year = date.getFullYear();
    if(today.getDate() == day && today.getMonth() == month && today.getFullYear() == year)
      return true;
    return false;
  }

  ctrl.isTimingForOlderDate = function(timing){
    var displayedDate = ctrl.displayedDate;
    var day = displayedDate.getDate();
    var month = displayedDate.getMonth();
    var year = displayedDate.getFullYear();
    if(day > timing.day || (month + 1) > timing.month || year > timing.year)
      return true;
    return false;
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

  ctrl.showDatePicker = function(){
    if($scope.datePickerModal == null) {
      $ionicModal.fromTemplateUrl('app/daily_timings/date_picker_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.datePickerModal = modal;
        $scope.datePickerModal.show();
      });
    } else {
      $scope.datePickerModal.show();
    }
  }

  $scope.closeDatePicker = function() {
    $scope.datePickerModal.hide();
  };

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
      var salahDate = PrayerTimeParser.parse(new Date(), time, salahKey);
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
      if(isNaN(PrayerTimeParser.parse(new Date(), time, salahKey)))
      {
        parseable = false;
      }
    }
    return parseable;
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

  // used by date picker modal
  $scope.loadTimingsForDate = function(date){
    ctrl.displayedDate = date;
    ctrl.loadTimings(ctrl.masjid, date);
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
