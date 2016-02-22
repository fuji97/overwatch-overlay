// Modifica questi valori
var text = 'new follower';
var UPDATE_EVERY_MS = 5000;

// Da qui, non toccare, grazie :)
var requestFinished = true;
var user = "";
var lastUserId = new Array("","");

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function show(user) {
	if (user != undefined) $('.first-row').html(user);
	// Show
	$('.wrapper').children().animate({
		left: '+=50px',
		opacity: 0.95
	},
	'short');
	// Hide
	setTimeout(function() {
		$('.wrapper').children().animate({
			left: '-=50px',
			opacity: 0
		},
		'short');
	}, 4000);
}

function startCheck() {
	if (requestFinished) {
		requestFinished = false;
		$.ajax({
			crossDomain: true,
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'https://api.twitch.tv/kraken/channels/' + user + '/follows?limit=2',
			dataType: "jsonp",
			success: function(data) {
				lastUserId[0] = data.follows[0].user._id;
				lastUserId[1] = data.follows[1].user._id;
				requestFinished = true;
				setInterval(function() {updateFollowers();},UPDATE_EVERY_MS);
			}
		});
	}
}

function updateFollowers() {
	if (requestFinished) {
		requestFinished = false;
		$.ajax({
			crossDomain: true,
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'https://api.twitch.tv/kraken/channels/' + user + '/follows?limit=2',
			dataType: "jsonp",
			success: function(data) {
				if (lastUserId[0] != data.follows[0].user._id && lastUserId[1] != data.follows[0].user._id) {
					show(data.follows[0].user.display_name);
				}
				lastUserId[0] = data.follows[0].user._id;
				lastUserId[1] = data.follows[1].user._id;
				requestFinished = true;
			}
		});
	}
}

$(document).ready(function() {
	user = getUrlParameter('user') || "";
	text = getUrlParameter('text') || text;
	$('.second-row').html(text);
	startCheck();
});