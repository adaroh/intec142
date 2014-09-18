/*global $ */
/*jshint unused:false */
var app = app || {};
var ENTER_KEY = 13;

$(function () {
	'use strict';

    app.Mails = new app.MailList();
    app.app_view = new app.AppView({collection: app.MailList});

    app.Mails.fetch()
        .done(function(res){
        });
	// kick things off by creating the `App`
});


$(document).ready(function()
{
    $('#signOut').on('click',function(){deleteCookie("UUID")});
});

/**
 * Delete a Cookie
 * @param key name of the cookie
 */
function deleteCookie(key)
{
    // Delete a cookie by setting the date of expiry to yesterday
    var date = new Date();
    date.setDate(date.getDate() -1);
    document.cookie = key + '=;expires=' + date;
    document.location.href = 'welcome.html';
}

function fixString(str) {

    var onlyMes=str;
    if(str.indexOf('- - - - - - - - - - - - - - - - - - -') > -1)
        onlyMes = str.split('- - - - - - - - - - - - - - - - - - -')[0];

    return onlyMes;
}