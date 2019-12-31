angular.module('mymasjid.controllers')
.controller('DatePickerModalCtrl', function($scope) {
  var ctrl = this;
  ctrl.datePicker = {
    date: new Date()
  };

  $scope.$on("modal.shown", function(e, modal){
    console.log("Modal shown event", e, modal);
    ctrl.today = new Date();
    ctrl.datePicker.date = ctrl.today;
  });

  ctrl.monthClicked = function(monthStr, index){
    $scope.datePickerModal.hide();
    var month = index % 12;
    var year = monthStr.match(/\w+\s(\d+)/)[1];
    $scope.loadTimingsForMonth(month, year);
  }

  var thisYear = (new Date()).getFullYear();
  var nextYear = thisYear + 1;

  ctrl.allMonths = [
    "January " + thisYear,
    "February " + thisYear,
    "March " + thisYear,
    "April " + thisYear,
    "May " + thisYear,
    "June " + thisYear,
    "July " + thisYear,
    "August " + thisYear,
    "September " + thisYear,
    "October " + thisYear,
    "November " + thisYear,
    "December " + thisYear,
    "January " + nextYear,
    "February " + nextYear,
    "March " + nextYear,
    "April " + nextYear,
    "May " + nextYear,
    "June " + nextYear,
    "July " + nextYear,
    "August " + nextYear,
    "September " + nextYear,
    "October " + nextYear,
    "November " + nextYear,
    "December " + nextYear,
  ];

});
