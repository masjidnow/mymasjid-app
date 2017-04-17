angular.module('mymasjid.controllers')
.controller('SearchCtrl', function($scope, Restangular, $localForage, $state, $ionicHistory) {
  var ctrl = this;

  function init(){

  }

  ctrl.goBack = function(){
    $ionicHistory.goBack();
  }

  ctrl.submitSearch = function(query){
    ctrl.isSearching = true;
    ctrl.errorMsg = null;
    Restangular.all("masjids").customGET("search", {query: query}).then(function(data){
      var masjids = data.masjids;
      ctrl.results = masjids;
    }, function(response){
      var errorMsg = null;
      if(response && response.data)
        errorMsg = "Unknown error. Please try again"
      else
        errorMsg = "Can't connect to server. Please check your internet connection and try again.";
      ctrl.errorMsg = errorMsg;
    }).finally(function(){
      ctrl.isSearching = false;
    });
  };

  ctrl.canBeSet = function(masjid){
    return masjid.unlocked && masjid.has_iqamah_timings;
  }

  ctrl.selectMasjid = function(masjid){
    $localForage.getItem("storedMasjids")
      .then(function(storedMasjids){
        storedMasjids = storedMasjids || [];
        var storedIndex = _.findIndex(storedMasjids, function(storedMasjid){
          if(storedMasjid.id == masjid.id){
            return masjid;
          }
        });
        if(storedIndex != -1){
          storedMasjids.splice(storedIndex, 1);
        }
        storedMasjids.unshift(masjid);
        return $localForage.setItem("storedMasjids", storedMasjids);
      }).then(function(){
        ctrl.goBack();
      });
  }

  ctrl.search = {};

  init();

});
