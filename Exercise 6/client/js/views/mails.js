/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
    'use strict';

    // Todo Item View
    // --------------

    // The DOM element for a todo item...
    app.MailView = Backbone.View.extend({
        //... is a list tag.
        tagName:  'tbody',
        id : 'main_table',
        // Cache the template function for a single item.
        template: _.template($('#item-template').html()),

        // The DOM events specific to an item.
        events: {
            'click .delete': 'clear',
            'click .mail_open': 'open_mail',
            'click a': 'closeBodyMail',
            'click .replay': 'replayMail'
        },

        open_mail: function(){
            this.$el.find('.mail_content').removeClass('notvis');
            this.$el.find('.rowOfMile').css('font-weight','normal');
            var adr = 'readMail/'+this.model.get("_id");
            $.get(adr)
                .done(function( data ) {
                    console.log(data);
                }
            );
        },

        closeBodyMail: function(){
            this.$el.find('.mail_content').addClass('notvis');
        },

        replayMail: function(){
            $('#inputTo').val(this.model.get('from'));
            $('#inputSubject').val('Fw:'+this.model.get('subject'));

            var repVal =   "\n- - - - - - - - - - - - - - - - - - - "
                          +"\nFrom: " +this.model.get('from')
                          +"\nSent: " +new Date(this.model.get('date')).toLocaleString()
                          +"\nTo: "   +this.model.get('to')
                          +"\nSubject: "   +this.model.get('subject')
                          +"\n\nMessage: \n" +this.model.get('message')+"\n\n";

            $('#inputMessage').val(repVal);

            //close mail body
            this.$el.find('.mail_content').addClass('notvis');
        },

        // The MailView listens for changes to its model, re-rendering. Since there's
        // a one-to-one correspondence between a **Todo** and a **MailView** in this
        // app, we set a direct reference on the model for convenience.
        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'visible', this.toggleVisible);
        },

        // Re-render the titles of the todo item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },


        isHidden: function () {
            var isCompleted = this.model.get('completed');
            return (// hidden cases only
                (!isCompleted && app.TodoFilter === 'completed') ||
                    (isCompleted && app.TodoFilter === 'active')
                );
        },

        // Remove the item, destroy the model from *localStorage* and delete its view.
        clear: function () {
            var adr = "mail/"+this.model.get("_id");
            console.log(adr);
            var that = this;
            $.get( adr )
                .done(function( data ) {
                    var parsed_res = JSON.parse(data);
                    if(parsed_res.status == 1) {
                        that.model.destroy();
                    }
                });
        }
    });
})(jQuery);
