angular.module('mymasjid.services')
.factory("PrayerTimeParser", function() {

  function parse(date, timeStr, salahKey){
    var dt = date;

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

  return {
    parse: parse
  };
});
