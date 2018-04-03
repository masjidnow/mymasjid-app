angular.module('mymasjid.services')
.factory("NotificationScheduler", function(
  $ionicPlatform,
  $cordovaLocalNotification
  ){

  function createNotification(date, title, text){
    return {
      id: date.getTime(),
      title: title,
      text: text,
      at: date,

    };
  }

  function scheduleNotifications(notifications){
    $cordovaLocalNotification.schedule(notifications)
  }


  return {
    createNotification: createNotification,
    scheduleNotifications: scheduleNotifications
  }
});

