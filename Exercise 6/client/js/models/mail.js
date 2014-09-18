/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Model
	// ----------

	app.Mail = Backbone.Model.extend({
        urlRoot: '/mails/new',
		// Default attributes for the mail
        // and ensure that each mail created with the following defaults fields
        defaults: {
            _id:'',
            from: '',
            to:'',
            date: new Date(),
            subject: '',
            message: '',
            isRead: false
        },


		// Toggle the `isRead` state of this mail item.
		read: function () {
			this.save({
                isRead: true
			});
		}
	});
})();
