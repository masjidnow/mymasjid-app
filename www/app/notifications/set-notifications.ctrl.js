angular.module('mymasjid.controllers')
.controller('SetNotificationsCtrl', function(
  $scope,
  Restangular,
  SavedMasjid,
  PrayerTimeParser,
  $ionicPlatform,
  NotificationPreferences,
  $q
  ) {
  var ctrl = this;
  var thisMonthsTimings;
  var nextMonthsTimings;

  function init(){
    ctrl.isScheduling = false;
    ctrl.isLoadingTimings = false;
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return (storedMasjids || [])[0];
    }).then(function(storedMasjid){
      ctrl.masjid = storedMasjid;
      return ctrl.masjid;
    }).then(function(masjid){
      ctrl.iqamahPreferences = NotificationPreferences.getIqamahPreferences();
      return masjid;
    }).then(function(masjid){
      ctrl.loadMonthlyTimings(masjid);
    });
  }

  function leave(){
  }

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);
  $scope.$on("$ionicView.leave", leave);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

  ctrl.updateNotificationPreference = function(salah, minutesChosen){
    console.log("updateNotificationPreference called with ", salah, minutesChosen);
    if(minutesChosen == "off")
      minutesChosen = null;
    NotificationPreferences.setIqamahPreference(salah, minutesChosen).then(function(notificationPreferences){
      showScheduling();
      var combinedTimings = _.concat(thisMonthsTimings, nextMonthsTimings);
      return setNotifications(combinedTimings, notificationPreferences);
    }).finally(function(){
      hideScheduling();
    });
  }

  ctrl.hasNoNotificationsScheduled = function(){
    return true;
  }

  function setNotifications(combinedTimings, notificationPreferences){
    var notifications = [];
    _.each(ctrl.salahKeys, function(salah){
      if(notificationPreferences[salah] == null){
        console.log("No alarms for", salah);
        return;
      }
      var minutes = notificationPreferences[salah];
      var msg = "" + minutes + " minutes until " + ctrl.salahNames[salah] +
        " iqamah at " + ctrl.masjid.name + ".";
      for (var i = 0; i < 7; i++) {
        var date = new Date();
        date.setDate(date.getDate() + i);
        var date = getTimeForSalah(combinedTimings, date, salah);
        var notification = NotificationScheduler.createNotification(date, msg);
        notifications.push(notification);
      }
    });
  }

  ctrl.loadMonthlyTimings = function(masjid){
    ctrl.isLoadingTimings = true;
    var today = new Date();
    var nextWeekDate = new Date();
    nextWeekDate.setDate(today.getDate() + 7);
    var thisMonthTimingsPromise = getPromiseForMonthTimings(masjid, today.getFullYear(), today.getMonth());
    var numDaysRemainingInMonth = 0;
    for (var i = 0; i < 7; i++) {
      var date = new Date();
      date.setDate(date.getDate() + 1);
      if(date.getMonth() == today.getMonth())
        numDaysRemainingInMonth++;
    }
    var nextMonthsTimingsPromise = null;
    if(nextWeekDate.getMonth() != today.getMonth())
      nextMonthsTimingsPromise = getPromiseForMonthTimings(masjid, nextWeekDate.getFullYear(), nextWeekDate.getMonth());

    // NOW do something with thisMonthTimingsPromise and nextMonthsTimingsPromise
    return $q.all([thisMonthTimingsPromise, nextMonthsTimingsPromise]).then(function(responses) {
      thisMonthsTimings = _.map(responses[0].masjid.salah_timings, function(timingWrapper){ return timingWrapper.salah_timing; });
      if(responses[1] && responses[1].masjid){
        nextMonthsTimings = _.map(responses[1].masjid.salah_timings, function(timingWrapper){ return timingWrapper.salah_timing; });
      }
      [].push.apply(thisMonthsTimings, nextMonthsTimings);
      return thisMonthsTimings;
    }, function(errorResponse){
      var msg = "Error when downloading timings. ";
      if(errorResponse.data)
        msg +=  errorResponse.data.errors.join(", ");
      else
        msg += "Couldn't connect to MasjidNow.com. Please check your internet connection. "
      ctrl.timingsErrorMsg = msg;
    }).finally(function(){
      ctrl.isLoadingTimings = false;
    });
  }

  function getPromiseForMonthTimings(masjid, year, month){
    var today = new Date();
    var params = {
      masjid_id: masjid.id,
      month: month + 1,
      year: year,
      src: ionic.Platform.platform()
    };
    var thisMonthsTimings = null;
    return Restangular.all("salah_timings").customGET("monthly.json", params);
  }

  function isTimingEqualToDate(timing, date){
    return timing.month == date.getMonth() +1 && timing.day == date.getDate() && timing.year == date.getFullYear();
  }

  function getTimeForSalah(timings, date, salah) {
    var timing = _.find(timings, function(timing){
      return isTimingEqualToDate(timing, date);
    });
    if(timing[salah] == null || timing[salah] == "")
      return null;
    var date = PrayerTimeParser.parse(date, timing[salah], salah);
    return date;
  }

  function showScheduling(){
    ctrl.isScheduling = true;
  }

  function hideScheduling(){
    ctrl.isScheduling = false;
  }

  ctrl.minuteChoices = [
    {value: "off", description: "None",},
    {value: "5", description: "5 Minutes Before"},
    {value: "10", description: "10 Minutes Before"},
    {value: "15", description: "15 Minutes Before"},
    {value: "30", description: "30 Minutes Before"}
  ];

  // the keys that the template should display
  ctrl.salahKeys = [
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ];

  ctrl.salahNames = {
    "fajr": "Fajr",
    "dhuhr": "Dhuhr",
    "asr": "Asr",
    "maghrib": "Maghrib",
    "isha": "Isha",
  }

});
