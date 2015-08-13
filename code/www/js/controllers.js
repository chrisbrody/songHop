angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {

	// helper functions for loading
  var showLoading = function() {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  }

  var hideLoading = function() {
    $ionicLoading.hide();
  }

  // set loading to true first time while we retrieve songs from server.
  showLoading();

	Recommendations.init()
    .then(function(){
      $scope.currentSong = Recommendations.queue[0];
      return Recommendations.playCurrentSong();
    })
    .then(function(){
      // turn loading off
      hideLoading();
      $scope.currentSong.loaded = true;
    });

	$scope.sendFeedback = function(bool){
		// first, add to favorites if they favorited
    if (bool) User.addSongToFavorites($scope.currentSong);

    // set variable for the correct animation sequence
    $scope.currentSong.rated = bool;
    $scope.currentSong.hide = true;

    // prepare the next song
    Recommendations.nextSong();

    // update current song in scope, timeout to allow animation to complete
    $timeout(function() {
      $scope.currentSong = Recommendations.queue[0];
      $scope.currentSong.loaded = false;
    }, 250);

    Recommendations.playCurrentSong().then(function() {
      $scope.currentSong.loaded = true;
    });
		
	}

	$scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }

    return '';
  }
 //  $scope.songs = [
 // 	  {
 //         "title":"Stealing Cinderella",
 //         "artist":"Chuck Wicks",
 //         "image_small":"https://i.scdn.co/image/d1f58701179fe768cff26a77a46c56f291343d68",
 //         "image_large":"https://i.scdn.co/image/9ce5ea93acd3048312978d1eb5f6d297ff93375d"
 //      },
 //      {
 //         "title":"Venom - Original Mix",
 //         "artist":"Ziggy",
 //         "image_small":"https://i.scdn.co/image/1a4ba26961c4606c316e10d5d3d20b736e3e7d27",
 //         "image_large":"https://i.scdn.co/image/91a396948e8fc2cf170c781c93dd08b866812f3a"
 //      },
 //      {
 //         "title":"Do It",
 //         "artist":"Rootkit",
 //         "image_small":"https://i.scdn.co/image/398df9a33a6019c0e95e3be05fbaf19be0e91138",
 //         "image_large":"https://i.scdn.co/image/4e47ee3f6214fabbbed2092a21e62ee2a830058a"
 //      }
	// ];

	// $scope.currentSong = angular.copy($scope.songs[0]);
})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User) {
	$scope.favorites = User.favorites;

	$scope.removeSong = function(song, index) {
		User.removeSongFromFavorites(song, index);
	}
})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, Recommendations) {
	$scope.enteringFavorites = function() {
    Recommendations.haltAudio();
  }
	$scope.leavingFavorites = function() {
    Recommendations.init();
  }
});