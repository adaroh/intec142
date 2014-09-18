/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // The Application
    // ---------------

    // Our overall **AppView** is the top-level piece of UI.
    app.AppView = Backbone.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: '#mailApp',


        // Delegated events for creating new items, and clearing completed ones.
        events: {
            'click #sendMail': 'createMail',
            'click #cancalRep': 'cancelReplay',
            'keyup #query' : 'search_query'
        },

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved in *localStorage*.
        initialize: function () {
            this.listenTo(app.Mails, 'add', this.addOne);
            this.listenTo(app.Mails, 'reset', this.addAll);
            this.listenTo(app.Mails, 'change:isRead', this.filterOne);
            this.listenTo(app.Mails, 'all', this.render);

            var socket = io.connect('http://54.191.164.47:4321');
            socket.on('error', function() {
                console.error('io error: ' + arguments);
            });
            socket.on('newMail', function(id) {
                console.log('new mail!!');
                //var cur = new app.Mail({_id: id});
                var adr = 'getMail/'+id;
                $.get(adr)
                    .done(function( data ) {
                        app.Mails.fetch({reset: true})
                            .done(function(res){
                                var str = '<thead>' +
                                    '<tr id="table-header">' +
                                    '<th class="col-md-2">From</th>' +
                                    '<th class="col-md-6">Subject</th>' +
                                    '<th>Time</th>' +
                                    '<th>Delete</th>' +
                                    '</tr></thead>';
                                $("#table-list-mail").prepend(str);
                            });
                    }
                );
            });
        },

        search_query: function() {
            var qt = $("#query").val();
            $( "#main_table tr" )
                .filter(function( index ) {
                    if($(this).children()[1]) {
                        var str = $(this).children()[1].innerHTML;
                        if(str.indexOf(qt) <= -1) {
                            return true;
                        }
                    }
                    return false;
                })
                .css( "display", "none" );

            $( "#main_table tr" )
                .filter(function( index ) {
                    if($(this).children()[1]) {
                        var str = $(this).children()[1].innerHTML;
                        if(str.indexOf(qt) > -1) {
                            return true;
                        }
                    }
                    return false;
                })
                .css( "display", "" );
        },

        createMail: function()
        {
            var $to = $("#inputTo").val(),
                $subject = $("#inputSubject").val(),
                $msg = $("#inputMessage").val();

            if($to === '' || $subject === '' || $msg === ''){
                alert('Username ,subject and Message is required and cannot be empty')
            }
            else{
                $('#largeModal').modal('hide');

                /*var onlyMes = $msg;
                if($msg.indexOf('- - - - - - - - - - - - - - - - - - -') > -1)
                    onlyMes = $msg.split('- - - - - - - - - - - - - - - - - - -')[0];

                console.log('\'replayMessage\' : \n'+$msg);
                console.log('\'message1\' : \n'+onlyMes);*/
                app.Mails.create({to: $to, subject:$subject, message:$msg});

                //initializes the values for the next time compose
                $("#inputTo").val('');
                $("#inputSubject").val('');
                $("#inputMessage").val('');
            }
        },
        cancelReplay: function(){
            $("#inputTo").val('');
            $("#inputSubject").val('');
            $("#inputMessage").val('');
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function (records) {

        },

        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function (mail) {
            var view = new app.MailView({ model: mail });
            if(mail.get("_id")){
                $('#table-list-mail').prepend(view.render().el);
            }
        },

        // Add all items in the **Todos** collection at once.
        addAll: function () {
            this.$('#table-list-mail').html('');
            app.Mails.each(this.addOne, this);
        }
    });
})(jQuery);
