angular.module('mymasjid.controllers')
.controller('MonthlyTimingsCtrl', function(
  $scope,
  Restangular,
  SavedMasjid,
  $ionicPlatform,
  $ionicModal
  ) {
  var ctrl = this;
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    ctrl.today = new Date();
    ctrl.todayStr = ctrl.today.getYear() + "-" + ctrl.today.getMonth() + "-" + ctrl.today.getDate();
    ctrl.displayedDate = new Date();
    SavedMasjid.getMasjids().then(function(storedMasjids){
      return storedMasjids[0];
    }).then(function(storedMasjid){
      if(storedMasjid == null)
        ctrl.showNoMasjid();
      else
        ctrl.loadTimings(storedMasjid, ctrl.today);
    });
  }

  function leave(){
    if($scope.monthPickerModal !== null) {
      $scope.monthPickerModal.remove();
      $scope.monthPickerModal = null;
    }
  }

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);
  $scope.$on("$ionicView.leave", leave);
  $scope.$on("mymasjid.selectedMasjidChanged", init);

  ctrl.loadTimings = function(selectedMasjid, date){
    ctrl.displayedDate = date;
    ctrl.errorMsg = null;
    ctrl.isLoading = true;
    ctrl.masjid = selectedMasjid;
    var today = new Date();
    var params = {
      src: ionic.Platform.platform(),
      masjid_id: selectedMasjid.id,
      month: date.getMonth() + 1,
      year: date.getFullYear()
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
        ctrl.errorMsg = "Couldn't connect to MasjidNow. Please check your internet connection."
      }
    }).finally(function(){
      ctrl.isLoading = false;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  ctrl.isToday = function(timing){
    return ctrl.todayStr == timing.dateStr;
  }

  ctrl.isThisMonth = function(date){
    return ctrl.today.getMonth() == date.getMonth() && ctrl.today.getFullYear() == date.getFullYear();
  }

  ctrl.resetDate = function(){
    ctrl.loadTimings(ctrl.masjid, new Date());
  }

  ctrl.showNoMasjid = function() {
    console.error("FIXME - make text for no masjid selected");
  }

  ctrl.showMonthPicker = function(){
    if($scope.monthPickerModal == null) {
      $ionicModal.fromTemplateUrl('app/monthly_timings/month_picker_modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.monthPickerModal = modal;
        $scope.monthPickerModal.show();
      });
    } else {
      $scope.monthPickerModal.show();
    }
  }

  $scope.loadTimingsForDate = function(date){
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
