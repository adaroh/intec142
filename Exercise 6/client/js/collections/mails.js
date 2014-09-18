/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Collection
	// ---------------

	// The collection of todos is backed by *localStorage* instead of a remote
	// server.
	app.MailList = Backbone.Collection.extend({

		// Reference to this collection's model.
		model: app.Mail,

        url: '/mails/getMails',


		// Save all of the mail items under the `"mails"` namespace.
		//localStorage: new Backbone.LocalStorage('mails-backbone')

/*		search: function (str) {
			return this.filter(function (mail) {
				return mail.get('subject');
			});
		},*/
        //order the mails by timestamp from new to older

        // Emails are sorted by their original insertion order.
        // we are also sorting by priorities - the higher the better.

        comparator: function (email) {
            return -1 * email.date;
        }

	});


})();
