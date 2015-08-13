angular.module('songhop.services', ['ionic.utils'])

.factory("User", function($http, $q, $localstorage, SERVER) {

	var o = {
		username: false,
		session_id: false,
		favorites: [],
		newFavorites: 0
	}

	o.auth = function(username, signingUp) {
		var authRoute;

		if(signingUp) {
			authRoute = 'signup'
		} else {
			authRoute = 'login'
		}

		return $http.post(SERVER.url + '/' + authRoute, {username: username})
			.success(function(data) {
				o.setSession(data.username, data.session_id, data.favorites);
			});
	}

	o.setSession = function(username, session_id, favorites) {
		if (username) o.username = username;
		if (session_id) o.session_id = session_id;
		if (favorites) o.favorites = favorites;

		$localstorage.setObject( 'user', { username:username, session_id:session_id } );
	}

	o.addSongToFavorites = function(song) {
		// make sure there's a song to add
		if (!song) {return false};

		// add the song to favorites array
		o.favorites.unshift(song); 

		// show badge on favorites icon 
		o.newFavorites++;

		// persist this to the server
		return $http.post(SERVER.url + '/', {session_id:o.session_id, song_id:song.song_id });
	}

	o.removeSongFromFavorites = function(song, index) {
		// make sure there's a song to remove
		if (!song) {return false};

		// remove the song from the favorites array
		o.favorites.splice(index, 1);

		return $http({
			method: 'DELETE',
			url: SERVER.url + '/favorites',
			params: { session_id:o.session_id, song_id:song.song_id }
		});
	}

	o.populateFavorites = function() {
		return $http({

			method: 'GET',
			url: SERVER.url + '/favorites',
			params: { session_id:o.session_id }
		}).success(function(data) {
			// merge data into the queue
			o.favorites = data;
		})
	}

	o.favoriteCount = function() {
		// get new favorites count 
		return o.newFavorites;
	}

	

	return o;

})

.factory('Recommendations', function($http, $q, SERVER) {
	var o = {
		queue: []
	};
	var media;

	o.init = function() {
    if (o.queue.length === 0) {
      // if there's nothing in the queue, fill it.
      // this also means that this is the first call of init.
      return o.getNextSongs();

    } else {
      // otherwise, play the current song
      return o.playCurrentSong();
    }
  }

	o.getNextSongs = function() {
		return $http({
			methed: "GET",
			url: SERVER.url + '/recommendations'
		}).success(function (data) {
			o.queue = o.queue.concat(data);
		});
	}

	o.nextSong = function() {
		o.queue.shift();

		o.haltAudio();

		if (o.queue.length <= 3) {
			o.getNextSongs();
		}
	}

	 o.playCurrentSong = function() {
    var defer = $q.defer();
    console.log(o.queue[0].artist);
    // play the current song's preview
    media = new Audio(o.queue[0].preview_url);

    // when song loaded, resolve the promise to let controller know.
    media.addEventListener("loadeddata", function() {
      defer.resolve();
    });

    media.play();

    return defer.promise;
  }

  // used when switching to favorites tab
  o.haltAudio = function() {
    if (media) media.pause();
  }

	return o;

});
