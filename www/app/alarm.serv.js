angular.module('mymasjid.services')
.factory("alarmService", function(
  $cordovaNativeStorage,
  $localForage,
  $ionicPlatform,
  Restangular,
  PrayerTimeParser,
  $cordovaLocalNotification
  ){

  var salahKeys = [
    "fajr",
    "dhuhr",
    "asr",
    "maghrib",
    "isha",
  ];
  var salahNames = {
    "fajr": "Fajr",
    "sunrise": "Sunrise",
    "dhuhr": "Dhuhr",
    "asr": "Asr",
    "maghrib": "Maghrib",
    "isha": "Isha",
  }

  function getAllScheduledAlarm(){
    return new Promise(function(resolve) {
      $cordovaLocalNotification.getScheduled(function(d){
        console.log(d);
        return resolve(d);
      });
    });
  }

  function get(key){
    return $ionicPlatform.ready().then(function(){
      return getItem(key);
    }).then(function(data){
      return data || [];
    });
  }

  function fetchIqamah(m, y, id){
    return new Promise(function(resolve, reject){
      var params = {
        masjid_id: id,
        month: m,
        year: y
      };
      Restangular.all('salah_timings').customGET("monthly.json", params).then(function(data){
        var masjid = data.masjid;
        monthTimings = _.map(masjid.salah_timings, function(t){return t["salah_timing"];});
        if(monthTimings.length > 0){
          monthTimings = _.map(monthTimings, function(t){
            var c = {};
            salahKeys.forEach(function(v){
              c[v] = PrayerTimeParser.parse(new Date(t.year, t.month - 1, t.day), t[v], v);
            });
            return c;
          });
          console.log(monthTimings);
          // var d = new Date().getDate() - 1;
          // while(d < monthTimings.length){
          //   console.log(monthTimings[d]);
          //   d++;
          // }
          // return resolve(monthTimings);
        }
        if(monthTimings.length > 0){
          setItem(m.toString() + y.toString(), monthTimings);
        }
        return resolve(monthTimings);
      }, function(err){
        console.log('err', err);
        return reject(err);
      });
    });
  }

  function generateNotificationSchedule(timings, isCurrentMonth){
    console.log('timings', timings);
    return new Promise(async function(resolve){
      var notifSetting = await getNotificationSettings();
      var hasSetting = Object.values(notifSetting).filter(function(v){
        return v > 0;
      });
      if(hasSetting.length > 0){
        var scheduledCount = (await getAllScheduledAlarm()).length;
        console.log('scheduledCount', scheduledCount);
        var schedules = [];
        if(isCurrentMonth){
          var d = new Date().getDate() - 1;
          while(scheduledCount < 64 && d < timings.length){
            salahKeys.forEach(function(key, idx){
              if(notifSetting[key] > 0){
                var alarmTime = new Date(new Date(timings[d][key]).getTime() - notifSetting[key] * 60000);
                if(alarmTime.getTime() > new Date().getTime()){
                  var schedule = {
                    id: alarmTime.getDate().toString() + (alarmTime.getMonth() + 1).toString() + alarmTime.getFullYear().toString() + idx,
                    title: "Iqamah",
                    text: "Iqamah reminder for " + salahNames[key],
                    trigger: {at: alarmTime}
                  };
                  schedules.push(schedule);
                  scheduledCount++;
                }
              }
            });
            d++;
          }
        }else{
          var i = 0;
          while(scheduledCount < 64 && i < timings.length){
            salahKeys.forEach(function(key, idx){
              if(notifSetting[key] > 0){
                var alarmTime = new Date(new Date(timings[i][key]).getTime() - notifSetting[key] * 60000);
                if(alarmTime.getTime() > new Date().getTime()){
                  var schedule = {
                    id: alarmTime.getDate().toString() + (alarmTime.getMonth() + 1).toString() + alarmTime.getFullYear().toString() + idx,
                    title: "Iqamah",
                    text: "Iqamah reminder for " + salahNames[key],
                    trigger: {at: alarmTime}
                  };
                  schedules.push(schedule);
                  scheduledCount++;
                }
              }
            });
            i++;
          }
        }
        console.log('schedules', schedules);
        return resolve(schedules);
      }
    });
  }

  async function getNotificationSettings(){
    var notifSettings = await get('notifSettings');
    if(Object.keys(notifSettings).length>0){
      return notifSettings;
    }else{
      return {
        "fajr": "0",
        "dhuhr": "0",
        "asr": "0",
        "maghrib": "0",
        "isha": "0"
      };
    }
  }

  async function isIqamahAvailable(){
    var date = new Date();
    var cMonthNotif = await get((date.getMonth() + 1).toString() + date.getFullYear().toString());
    return cMonthNotif.length > 0;
  }

  function setLocalNotification(schedule){
    console.log(schedule);
    $cordovaLocalNotification.schedule(schedule).then(function(){
      console.log('Notification');
    }, function(err){
      console.log(err);
    });
  }

  function cancelAllNotification(){
    $cordovaLocalNotification.cancelAll().then(function(){
      console.log('Canceled all notification');
    }, function(err){
      console.log(err);
    });
  }

  async function removeLastMonth(){
    var currDate = new Date();
    var lastMonth = currDate.getMonth() < 1 ? currDate.getMonth() + 12 : currDate.getMonth();
    var currYear = currDate.getMonth() < 1 ? currDate.getFullYear() - 1: currDate.getFullYear();
    var lastMonthYear = String(lastMonth).toString() + currYear.toString();
    await removeItem(lastMonthYear);
  }

  function removeItem(key){
    return $localForage.removeItem(key)
    .then(function(){
      return $cordovaNativeStorage.remove(key);
    });
  }

  function setItem(key, val){
    return $localForage.setItem(key, val)
    .then(function(){
      return $cordovaNativeStorage.setItem(key, val);
    });
  }

  function getItem(key){
    return $cordovaNativeStorage.getItem(key).then(function(val){
      if(val != null){
        return val;
      }
      return $localForage.getItem(key);
    }, function(){
      return $localForage.getItem(key);
    });
  }

  return {
    setItem: setItem,
    get: get,
    isIqamahAvailable: isIqamahAvailable,
    removeLastMonth: removeLastMonth,
    fetchIqamah: fetchIqamah,
    setLocalNotification: setLocalNotification,
    cancelAllNotification: cancelAllNotification,
    getNotificationSettings: getNotificationSettings,
    generateNotificationSchedule: generateNotificationSchedule,
    getAllScheduledAlarm: getAllScheduledAlarm
  };
});
