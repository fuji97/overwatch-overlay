// ====================================================
// SETTINGS
// ====================================================
var append_text = 'to go';
var expired_text = 'Time out!';
var update_every_ms = 10000;
var user = "shagoonh";
var network = "twitch";
var no_period_text = "Donation started on ";

// ===================================================
// FROM HERE, DON'T TOUCH
// ====================================================
var requestFinished = true;
var endDateExist = false;
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? false : sParameterName[1];
        }
    }
};

var setBarValue = function setBarValue(sTitle,sPercentage, sMin, sMax, sText, sMoney, sCurrency) {
	if (sPercentage != undefined) $('.progress-wrapper span:first').css('width',sPercentage + '%');
	if (sPercentage != undefined) $('.percentage-text').html(sCurrency + ' ' + sMoney + ' (' + sPercentage + '%)');
	if (sMin != undefined) $('#start').html(sMin);
	if (sMax != undefined) $('#end').html(sMax);
	if (sText != undefined) $('.subtext').html(sText);
	if (sTitle != undefined) $('.title').html(sTitle);
}

function generateRemainingText(start, end) {
	var years = end.getFullYear() - start.getFullYear();
	var ret = "";
	var yy,dd = false;
	var secondsToGo = end.getTime() - start.getTime();
	if (secondsToGo <= 0) {
		return expired_text;
	}
	var yearsToGo = Math.floor(secondsToGo / 31536000000);
	var restYears = secondsToGo % 31536000000;
	var daysToGo = Math.floor(restYears / 86400000);
	var restDays = restYears % 86400000;
	var hoursToGo = Math.floor(restDays / 3600000);
	var restHours = restDays % 3600000;
	var minutesToGo = Math.floor(restHours / 60000);
	if (yearsToGo > 0) {
		ret += yearsToGo ( yearsToGo==1 ? ' year ' : ' years ');
		yy = true;
	}
	if (daysToGo > 0) {
		ret += daysToGo + ( daysToGo==1 ? ' day ' : ' days ');
		dd = true;
	}
	if (!yy) {
		if (hoursToGo > 0) {
			ret += hoursToGo + ( hoursToGo==1 ? ' hour ' : ' hours ');
		}
	}
	if (!yy && !dd) {
		if (minutesToGo > 0) {
			ret += minutesToGo + ( minutesToGo==1 ? ' minute ' : ' minutes ');
		}
	}
	return ret + append_text;
}

function checkUpdate() {
	if (requestFinished) {
		$.ajax({
			crossDomain: true,
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'https://streamtip.com/api/public/'+ network + '/' + user + '/goal',
			dataType: "jsonp",
			success: function(data) {
				requestFinished = false;
				var parsed = data;
				// Getting up variables to set on bar
				var min = 0;
				var max = Math.round(parsed.goal.amount);
				var percentage = parsed.goal.progress.percentage;
				// Check if an end date is setted
				if (parsed.goal.endDate) {
					// Calculating remaining days
					var nowDay = new Date();
					var endDate = new Date(parsed.goal.endDate);
					var secondsToGo = endDate.getTime() - nowDay.getTime();
					var text = generateRemainingText(nowDay, endDate);
				} else {
					var date = new Date(parsed.goal.startDate);
					var text = no_period_text + date.toLocaleDateString();
				}
				var title = parsed.goal.title;
				var money = parsed.goal.progress.amount;
				var symbol = parsed.goal.progress.currencySymbol;
				setBarValue(title,percentage,min,max,text,money,symbol);
				requestFinished = true;
			}
		});
	}
}

$(document).ready(function() {
	network = getUrlParameter('network') || network;
	user = getUrlParameter('user') || user;
	append_text = getUrlParameter('append') || append_text;
	expired_text = getUrlParameter('expired') || expired_text;
	no_period_text = getUrlParameter('no_period') || no_period_text;
	var update_get = parseInt(getUrlParameter('update'));
	if (!isNaN(update_get)) update_every_ms = update_get;

	checkUpdate();
	setInterval(function() {checkUpdate();}, update_every_ms);	
});

