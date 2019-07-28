angular.module('mymasjid.controllers')
.controller('AlarmCtrl', function(
  $scope,
  $ionicLoading,
  SavedMasjid,
  $window,
  alarmService,
  $ionicPlatform) {
  var ctrl = this;

  function init(){
    $ionicLoading.show({
      template: 'Loading...'
    }).then(async function(){
      ctrl.storedMasjids = (await SavedMasjid.getMasjids() || [])[0];
      ctrl.iqamahReminder = [5, 10, 15, 20, 25, 30];
      ctrl.iqamah = await alarmService.getNotificationSettings();
      console.log('ctrl.iqamah', ctrl.iqamah);
      $ionicLoading.hide();
    });
  }

  ctrl.iqamahChange = function(te){
    var loadingConf = {
      template: 'Please Wait...',
    };
    $ionicLoading.show(loadingConf).then(function(){
      try {
        alarmService.setItem('notifSettings', te).then(async function(data){
          var hasSetting = Object.values(data).filter(function(v){
            return v > 0;
          });
          if($window.cordova){
              await alarmService.cancelAllNotification();
          }
          if(hasSetting.length > 0){
            var cm, nm;
            var date = new Date();
            if(!await alarmService.isIqamahAvailable()){
              console.log('fetching');
              cm = await alarmService.fetchIqamah(date.getMonth() + 1, date.getFullYear(), ctrl.storedMasjids.id);
              nm = await alarmService.fetchIqamah(date.getMonth() + 2, date.getFullYear(), ctrl.storedMasjids.id);
            }else{
              cm = await alarmService.get((date.getMonth() + 1).toString() + date.getFullYear().toString());
              nm = await alarmService.get((date.getMonth() + 2).toString() + date.getFullYear().toString());
            }
            var cmSchedule = await alarmService.generateNotificationSchedule(cm, true);
            var nmSchedule = await alarmService.generateNotificationSchedule(nm, false);
            if(cmSchedule.length > 0){
              alarmService.setLocalNotification(cmSchedule);
            }
            if(nmSchedule.length > 0){
              alarmService.setLocalNotification(nmSchedule);
            }
          }
          $ionicLoading.hide();
        });
      } catch (error) {
        $ionicLoading.hide();
      }
    });
  };

  $ionicPlatform.on('resume', init);
  $scope.$on("$ionicView.enter", init);

});
