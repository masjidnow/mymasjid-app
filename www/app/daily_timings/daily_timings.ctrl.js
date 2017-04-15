angular.module('mymasjid.controllers')
.controller('DailyTimingsCtrl', function($scope, $ionicModal, $timeout, Restangular) {
  var baseSalahTimings = Restangular.all('salah_timings');

  function init(){
    getStoredMasjid()
      .then($scope.loadTimings);
  }

  $scope.loadTimings = function(masjidId){
    $scope.error = false;
    $scope.isLoadingMasjid = true;
    $scope.masjid = storedMasjid;
    baseSalahTimings.customGET("daily.json", {src: ionic.Platform.platform(), masjid_id: masjidId})
    .then(function(data){
      var masjid = data.masjid;
      $scope.masjid = masjid;
      var timing = masjid.salah_timing;
      $scope.timing = timing;
      $scope.messages = masjid.push_messages;

      if(masjid.ads_disabled)
      {
        AdHelper.setDisabledDate(new Date());
      }
      else
      {
        AdHelper.setDisabledDate(null);
      }
    }, function(response){
      $scope.masjid = storedMasjid;
      $scope.error = true;
      if(response.data)
      {
        $scope.errorMsg = response.data.errors.join(", ");
      }
      else
      {
        $scope.errorMsg = "Couldn't connect to MasjidNow. Pleae check your internet connection."
      }
    }).finally(function(){
      $scope.isLoadingMasjid = false;
    });
  };


  init();

});
