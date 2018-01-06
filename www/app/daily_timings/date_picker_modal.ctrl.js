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

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    ctrl.tomorrow = tomorrow;
  });

});
