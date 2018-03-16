// Spotify API calls that includes user authorization via client to server connection
// and a query to Spotify to retrieve information about a user supplied artist
// Created by David Crawford

// This function retrieves the token from our url
$.urlParam = function(name) {
  results = new RegExp('(' + name + '=)([^&#]*)').exec(window.location.href);
  if (results==null) {
     return null;
  }
  else {
    return decodeURI(results[2]) || 0;
  }
}

// Table definition for artist result
var results_table =
  "<table id='rt'>" +
  "<tr><td id='pic'rowspan=2></td>" +
  "<td id='name'></td></tr>" +
  "<tr><td id='about'></td>" +
  "</tr></table";

// This function uses our token to send an api to spotify in order to get
// information about an artist
$.searchArtists = function (query) {
  $.ajax({
      url: 'https://api.spotify.com/v1/search',
      data: {
          q: query,
          client_id: 'ddb2837ecc9343b2a0c46a3349aa40ca',
          type: 'Artist',
          access_token: $.urlParam('access_token'),
          token_type: 'bearer',
      },
      // Upon success of the api message, we get the contents and parse through it.
      // If there are any missing values or no records found, we let the user know
      success: function (response) {
        $('#results').html(results_table);
        if(!jQuery.isEmptyObject(response.artists.items)) {
          try {
            imageUrl = response.artists.items[0].images[0].url;
            $('#pic').html($('<img>',{id:'artistPicture',src:imageUrl}));
          }
          catch(err) {
            $('#pic').html('<b>No image provided</b>');
          }
          genre = response.artists.items[0].genres.join(", ");
          if(!genre.length > 0) genre = 'None provided';
          $('#name').append(response.artists.items[0].name);
          $('#about').append('Genres: ' + genre);
        }
        else {
          $('#results').html('<b>No results found</b>');
        }
      }
  });
};

// Event handling
$(document).ready(function() {
  // Visibility of interface depending on if the user is logged in
  if($.urlParam('access_token')) {
    $('#inactive').css('visibility','hidden');
  }
  else {
    $('#inactive').css('opacity', .8);
  }

  // When we login, we send the user to spotify's authorization page
  $("#login").click(function() {
    $.ajax({
      method: "GET",
      url: "https://accounts.spotify.com/authorize",
      data: {
        client_id: 'ddb2837ecc9343b2a0c46a3349aa40ca',
        response_type: 'token',
        //redirect_uri: 'http://localhost:8000' // Activate this for local testing
        redirect_uri: 'https://code4gg.github.io/spotifytesting/'
      },
      // When we're done, we go to spotify's site. The user continues and is
      // sent back according to our redirect_uri
      complete: function() {
        $(location).attr('href', this.url)
      }
    });
  });

  // Restricts user input to numbers, letters, and spaces
  $('#query').keypress(function(key) {
    if((key.charCode != 32) && ((key.charCode < 97 || key.charCode > 122) && (key.charCode < 65 || key.charCode > 90) && (key.charCode != 45)) && (key.charCode < 48 || key.charCode > 57)) {
      return false;
    }
  });

  // Search event where the text box contents are sent to our query
  // The results are faded into view
  $("#search").click(function() {
    $('#results').css('visibility','hidden').hide().fadeIn("slow");
    if(!jQuery.trim($("#query").val()).length > 0) {
      $("#query").val('');
      $('#results').html('<b>Please enter an artist\'s name</b>');
      $('#results').css('visibility','visible').hide().fadeIn("slow");
      return false;
    }
    $.searchArtists($("#query").val());
    $("#query").val('');
    $('#results').css('visibility','visible').hide().fadeIn("slow");
  });
});
