/*global Backbone */
var app = app || {};

(function () {
	'use strict';

	// Todo Router
	// ----------
	var Workspace = Backbone.Router.extend({
		routes: {

		}


	});

	app.TodoRouter = new Workspace();
	Backbone.history.start();
})();
