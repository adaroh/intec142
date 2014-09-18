/**
 * Created by Tal on 20/08/2014.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
/*
 Mails schema
 */

var ObjectId = Schema.ObjectId;

var UsersSchema = new Schema({
    username    : String,
    pass : String,
    firstName : String,
    lastName  : String,
    age :   Number
});

var Users = mongoose.model('UsersSchema',UsersSchema);

module.exports.Users = Users;

