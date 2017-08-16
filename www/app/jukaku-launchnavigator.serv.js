angular.module('mymasjid.services')
.factory("$jukakuLaunchNavigator", function(
  $q
){
  // The built in launchNavigator wrapper
  // in ngCordova is broken.

  function navigate(destination, options){
    if(window.launchnavigator == null){
      throw new Error("launchnavigator not available.");
    }
    var q = $q.defer();
    launchnavigator.navigate(
      destination,
      function (){
        q.resolve();
      },
      function (error){
        q.reject(error);
      },
      options);
    return q.promise;
  }

  return {
    navigate: navigate
  }
});
