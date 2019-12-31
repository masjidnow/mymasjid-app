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
    ctrl.today = new Date();
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
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
    baseSalahTimings.customGET("monthly.json", params).then(function(data){
      var masjid = data.masjid;
      ctrl.masjid = masjid;
      var timings = _.orderBy(masjid.salah_timings, function(timing){ return timing.salah_timing.day });
      timings = _.map(timings, function(timing){
        timing.salah_timing.date = parseDate(timing.salah_timing.date);
        return timing.salah_timing;
      });
      timings = _.filter(timings, function(timing){ return timing.day >= date.getDate() });
      ctrl.timings = timings;
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
    return datesAreEqual(date, today);
  }

  ctrl.isTomorrow = function(date){
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return datesAreEqual(tomorrow, date);
  }

  function datesAreEqual(dateA, dateB){
    var day = dateA.getDate();
    var month = dateA.getMonth();
    var year = dateA.getFullYear();
    return dateB.getDate() == day && dateB.getMonth() == month && dateB.getFullYear() == year;
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

  ctrl.isIqamahPast = function(timing, salahKey){
    var salahDate = PrayerTimeParser.parse(timing.date, timing[salahKey], salahKey);
    return salahDate.getTime() < (new Date()).getTime();
  }

  ctrl.isAdhanPast = function(timing, salahKey){
    var salahDate = PrayerTimeParser.parse(timing.date, timing[salahKey + "_adhan"], salahKey);
    return salahDate.getTime() < (new Date()).getTime();
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

  function getTodaysTiming(timings){
    return _.find(timings, function(timing){ return timing.salah_timing.day == (new Date()).getDate()});
  }

  function parseDate(dateStr){
    var arr = dateStr.split("-");
    var year = arr[0];
    var month = arr[1];
    var day = arr[2];
    var date = new Date();
    date.setFullYear(year);
    date.setMonth(month-1);
    date.setDate(day);
    return date;
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
      var salahDate = PrayerTimeParser.parse(timing.date, time, salahKey);
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
  $scope.loadTimingsForMonth = function(month, year){
    var date = new Date();
    date.setDate(1);
    date.setMonth(month);
    date.setFullYear(year);
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
