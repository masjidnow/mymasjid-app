angular.module('mymasjid.controllers')
.controller('MonthPickerModalCtrl', function($scope) {
  var ctrl = this;
  ctrl.monthDates = [];

  $scope.$on("modal.shown", function(e, modal){
    console.log("Modal shown event", e, modal);
    ctrl.today = new Date();
    var monthDates = [];
    for (var i = 0; i < 12; i++) {
      var monthDate = new Date(ctrl.today);
      monthDate.setMonth(monthDate.getMonth() + i);
      monthDates.push(monthDate);
    }
    ctrl.monthDates = monthDates;
  });

});
