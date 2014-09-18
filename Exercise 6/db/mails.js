/**
 * Created by Tal on 20/08/2014.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/*
    Mails schema
 */

var ObjectId = Schema.ObjectId;

var MailsSchema = new Schema({
    from   : [{ type: ObjectId, ref: 'UsersSchema' }],
    to   : [{ type: ObjectId, ref: 'UsersSchema' }],
    date    : { type: Date, default: Date.now },
    subject : { type: String, default: '' },
    message : { type: String, default: '' },
    isRead  : { type: Boolean, default: false }
});

var mails = mongoose.model('MailsSchema',MailsSchema);

module.exports.mails = mails;

module.exports.getMailByID = function (id) {
    mails.findById(id, function (err, doc){
        if(err) {
            console.error('mongo error - cant find by id');
            return;
        }
        return doc;
    });
}

module.exports.getUserMails = function (userID) {
    mails.find({ to: userID }, function (err, docs) {
        if(err) {
            console.error('mongo error - cant get user mail');
            return;
        }
        return docs;
    });
}

module.exports.readMail = function (mailID) {
    mails.findById(mailID, function (err, mail){
        if(err) {
            console.error('mongo error - cant read user mail');
            return;
        }
        mail.isRead = true;
        mail.save(function (err) {
            if(err) {
                console.error('mongo error - cant save');
                return;
            }
            return mail;
        });
    });
}

module.exports.sendMail = function(from,to,subject,date,message){
    mails.create({ from: from, to: to, subject: subject, date: date, message:message },
        function (err, mail) {
            if(err) {
                console.error('mongo error - cant create');
                return;
            }
        return mail;
    });
}

