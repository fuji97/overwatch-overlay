// Imposta queste variabili
var APPEND_TEXT = 'to go';
var EXPIRED_TEXT = 'Time out!';
var UPDATE_EVERY_MS = 10000;

var requestFinished = true;
var access_token = "";
var min = "";
var max = "";
var finishData = "";
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

var setBarValue = function setBarValue(sPercentage, sMin, sMax, sText, sMoney) {
	if (sPercentage != undefined) $('.progress-wrapper span:first').css('width',sPercentage + '%');
	if (sPercentage != undefined) $('.percentage-text').html('€ ' + sMoney + ' - ' + sPercentage + '%');
	if (sMin != undefined) $('#start').html(sMin);
	if (sMax != undefined) $('#end').html(sMax);
	if (sText != undefined) $('.subtext').html(sText);
}

function generateRemainingText(start, end) {
	var years = end.getFullYear() - start.getFullYear();
	var ret = "";
	var yy,dd = false;
	var secondsToGo = end.getTime() - start.getTime();
	if (secondsToGo <= 0) {
		return EXPIRED_TEXT;
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
	return ret + APPEND_TEXT;
}

function checkUpdate() {
	if (requestFinished) {
		console.log('Start GET request');
		$.ajax({
			crossDomain: true,
			type: "GET",
			contentType: "application/json; charset=utf-8",
			url: 'https://www.twitchalerts.com/api/donations',
			dataType: "json",
			callback: "prova",
			data: {access_token: access_token},
			success: function(data) {
				console.log('Data received');
				requestFinished = false;
				// Getting up variables to set on bar
				var amount = (0).toFixed(2);
				for (donation in data.donations) {
					amount += donation.amount;
				}
				var percentage = amount / max * 100
				if (percentage > 100) {percentage = 100;}
				console.log('Amount: €' + amount + ' (' + percentage + '%)');
				// Calculating remaining days
				var nowDay = new Date();
				var endDate = new Date(finishData);
				var secondsToGo = endDate.getTime() - nowDay.getTime();
				var text = generateRemainingText(nowDay, endDate);
				setBarValue(percentage,min,max,text,amount);
				requestFinished = true;
			}
		});
	}
}

$(document).ready(function() {
	access_token = getUrlParameter('access_token');
	min = getUrlParameter('min');
	max = getUrlParameter('max');
	finishData = getUrlParameter('finish');

	console.log('access_token: ' + access_token + '\nmin: ' + min + '\nmax: ' + max + '\ndate: ' + new Date(finishData).toString())
	checkUpdate();
	setInterval(function() {checkUpdate();}, UPDATE_EVERY_MS);	
});

