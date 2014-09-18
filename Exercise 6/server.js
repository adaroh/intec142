/**
 * Created by adar-ohana on 25/05/14.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://54.191.164.47/mailApp');

var mailsClass = require('./db/mails'),
    mails = mailsClass.mails;
var usersClass = require('./db/users'),
    users = usersClass.Users;

var io = require('socket.io')(4321);
var usersSocketMap = {};

var http = require('./http/myHttp');
var server = http.createHTTPServer('./client');
var session_handling = require('./SessionHandling');

// Redis - for session Handling
var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Redis Error" + err);
});

function parsePostData(RequestBody) {
    var result = {};
    var postArray = RequestBody.split('&');
    for (var i in postArray) {
        var curPostStr = postArray[i].split('=');
        var key = curPostStr[0],
            val = curPostStr[1];
        result[key] = val;
    }
    return result;
}

function getIdFromCookie(req, isSocketIO) {
    var UUID ='';
    var Cookie;
    if(isSocketIO) {
        Cookie = req.headers.cookie;
    } else {
        Cookie = req.headers.Cookie;
    }
    if(Cookie) {
        cookies = Cookie.split(';');
        for (var i in cookies) {
            var cur = cookies[i].trim();
            var cur_parsed = cur.split('=');
            if (cur_parsed[0] == 'UUID') {
                UUID = cur_parsed[1];
            }
        }
    }
    return UUID;
}

io.on('connection', function(socket){
    var user_uuid = getIdFromCookie(socket.request, true);
    client.get(user_uuid, function (err, user_id) {
        if (err) {
            console.error(err);
            res.end(JSON.stringify({status: -1, error_msg: 'redis error'}));
            return;
        }
        if(user_id) {
            socket.on('disconnect', function() {
                console.log('user disconnected');
                delete usersSocketMap[user_id];
            });
            usersSocketMap[user_id] = socket;
        }

    });
});

server.onStart(function() {
    console.log('Server started!');
});

server.get('/readMail/:id', function(req, res) {
    var mail_id=req.params.id;
    mails.findById(mail_id)
        .exec(function (err, docs) {
            if (err) {
                console.error('mongo error - cant get user mail');
                res.end(JSON.stringify({status: -1, error_msg: 'mongo error - cant get user mail'}));
                return;
            }

            else {
                docs.isRead = true;
                docs.save();
                res.end(JSON.stringify(docs));
            }
        });
});


server.get('/getMail/:id', function(req, res) {
    var mail_id=req.params.id;
    mails.findById(mail_id)
        .populate('from', 'username')
        .populate('to', 'username')
        .exec(function (err, docs) {
            if (err) {
                console.error('mongo error - cant get user mail');
                res.end(JSON.stringify({status: -1, error_msg: 'mongo error - cant get user mail'}));
                return;
            }

            else {
                var cur_doc= {
                    _id: docs._id,
                    from   : docs.from[0].username,
                    to   : docs.to[0].username,
                    date    : docs.date,
                    subject : docs.subject,
                    message : docs.message,
                    isRead  : docs.isRead
                }
                res.end(JSON.stringify(cur_doc));
            }
        });
});

// get specific mail content
server.get('/mail/:id', function(req, res) {
    var uuid = getIdFromCookie(req);
    var mail_id=req.params.id;
    client.get(uuid, function (err, user_id) {
        if(err){
            console.error(err);
            res.end(JSON.stringify({status: -1, error_msg:'redis error'}));
        }
        else {
            mails.findById(mail_id, function (err, doc) {
                if(err || !doc) {
                    console.error('mongo error - cant get user mail');
                    res.end(JSON.stringify({status: -1, error_msg:'mongo error - cant get user mail'}));
                    return;
                }
                else {
                    doc.remove( function(err,doc){
                        if(err) {console.error(err); res.end();}
                        res.end(JSON.stringify({status: 1, msg:'removed!'}));
                    } );
                }
            });
        }
    });
});
// get mails list
server.get('/mails/getMails', function(req, res) {
    var uuid = getIdFromCookie(req);
    client.get(uuid, function (err, id) {
        if(err){
            console.error(err);
            res.end(JSON.stringify({status: -1, error_msg:'redis error'}));
        }
        else {
            mails
                .find({ to: id })
                .populate('from', 'username')
                .populate('to', 'username')
                .exec(function (err, docs) {
                    var docsJSON = docs;
                    for(var i=0; i<docs.length; i++){
                        var cur_doc= {
                            _id: docs[i]._id,
                            from   : docs[i].from[0].username,
                            to   : docs[i].to[0].username,
                            date    : docs[i].date,
                            subject : docs[i].subject,
                            message : docs[i].message,
                            isRead  : docs[i].isRead
                        }
                        docs[i]=cur_doc;
                    }
                    /*console.log(docs);*/
                    if(err) {
                        console.error('mongo error - cant get user mail');
                        res.end(JSON.stringify({status: -1, error_msg:'mongo error - cant get user mail'}));
                        return;
                    }
                    res.end(JSON.stringify(docs));
                });
        }
    });
});

server.post('/mails/new', function(req, res) {
    var reqBody = JSON.parse(req.body);
    /*console.log(reqBody);*/
    if (!reqBody.to || !reqBody.subject || !reqBody.message) {
       /* console.log('=====to ' + reqBody.to + 'subject: '+reqBody.subject + ' msg: '+reqBody.message);*/
        res.end(JSON.stringify({
            'status': -1,
            'error_msg': 'missing one or more params!'
        }));
        return;
    }
    else {
        // find TO user
        users.findOne({username: reqBody.to},
            function(err,recipient_user) {
                /*console.log('enter to find------');*/
                if (err) {
                    console.error('mongo error');
                    res.write(JSON.stringify({
                        status: -1,
                        error_msg: 'mongo error'
                    }));
                    return;
                }
                else if(!recipient_user) {
                    /*console.log('enter to !user------');*/
                    console.error('username '+ reqBody.to + 'is not exist');
                    res.write(JSON.stringify({
                        status: -1,
                        error_msg: 'username '+ reqBody.to + 'is not exist'
                    }));
                    res.end();
                    return;
                }
                else {
                    var sender_UUID = getIdFromCookie(req);
                    client.get(sender_UUID, function (err, sender_id) {
                        console.log('redis working!');
                        if (err) {
                            console.error(err);
                            res.end(JSON.stringify({status: -1, error_msg: 'redis error'}));
                        }
                        else {
                            users.findById(sender_id, function (err, sender_user){
                                if (err) {
                                    console.error(err);
                                    res.end(JSON.stringify({status: -1, error_msg: 'redis error'}));
                                    return;
                                }
                                else if(!sender_user || sender_user.length==0) {
                                    /*console.error('user is not logged in');*/
                                    res.end(JSON.stringify({status: -1, error_msg: 'user is not logged in'}));
                                    return;
                                }
                                else {
                                    /*console.log('========= rec ======')*/
                                    /*console.log(recipient_user);*/
                                    mails.create({
                                        from: sender_id,
                                        to: recipient_user._id,
                                        subject: reqBody.subject,
                                        message : reqBody.message

                                    }, function(err, msg) {
                                        if (err) {
                                            console.error(err);
                                            res.end(JSON.stringify({status: -1, error_msg: 'error creating mail'}));
                                        } else {
                                            if(usersSocketMap[recipient_user._id]) {
                                                usersSocketMap[recipient_user._id].emit('newMail', msg._id);
                                            }
                                            res.end(JSON.stringify({status: 1, msg: 'mail sent!', mail: msg}));
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
            });
    }
});

// login
server.post('/users/login', function(req, res) {
    var reqBody = parsePostData(req.body);
    if (!reqBody.userName || !reqBody.password) {
        res.end(JSON.stringify({
            'status': -1,
            'error_msg': 'missing one or more params!'
        }));
        return;
    }
    else {
        users.findOne({username: reqBody.userName, pass: reqBody.password},
            function(err,usr) {
                if (err) {
                    console.error('mongo error');
                    res.end(JSON.stringify({
                        status: -1,
                        error_msg: 'mongo error'
                    }));
                    return;
                }
                else if(!usr || usr.length==0){
                    /*console.log(usr);*/
                    /*console.error('wrong username or password');*/
                    res.end(JSON.stringify({
                        status: -1,
                        error_msg: 'wrong username or password'
                    }));
                }
                else {
                    createCookie(usr,res);
                    res.end(JSON.stringify({status: 1, msg:'Welcome!', usr: usr}));
                    /*console.log(res);*/
                }
            });
    }
});

// register
server.post('/users/register', function(req, res) {
    var reqBody = parsePostData(req.body);
    /*console.log('-----enter to register -------');*/
    if (!reqBody.userName || !reqBody.password || !reqBody.firstName || !reqBody.lastName || !reqBody.age) {
        /*console.log('-----enter to missing one or more params -------');*/
        res.end(JSON.stringify({
            'status': -1,
            'error_msg': 'missing one or more params!'
        }));
        return;
    } else {
        users.find({
            username: reqBody.userName
        }, function(err, docs) {
            if (err) {
                console.error('mongo error');
                res.end(JSON.stringify({
                    status: -1,
                    error_msg: 'mongo error'
                }));
            } else if (docs.length) {
                console.error('username ' + reqBody.userName + ' already exists');
                res.end(JSON.stringify({
                    status: -1,
                    error_msg: 'username ' + reqBody.userName + ' already exists',
                    docs: docs
                }));
            } else {
                users.create({
                    username: reqBody.userName,
                    pass: reqBody.password,
                    firstName: reqBody.firstName,
                    lastName: reqBody.lastName,
                    age: reqBody.age
                }, function(err, usr) {
                    if (err) {
                        return console.error(err);
                    } else {
                        createCookie(usr, res);
                        res.end(JSON.stringify({status: 1, msg:'user registered', usr: usr}));
                    }
                })
            }
        });
    }
});

function createCookie(usr, res) {
    var userID = usr._id;
    /*console.log('--------------- ');
    console.log(userID);
    console.log('--------------- ');*/
    var UniqueID = session_handling.CreateUUID();
    var cur_Date = new Date();
    var timeoutDate = new Date(cur_Date.getTime() + 1000 * 60 * 60 * 2);
    // Set a value with an expiration
    client.set(UniqueID, userID, redis.print);
    // Expire in 2 Hours
    client.expire(UniqueID, 2 * 60 * 60);
    res.headers['Set-Cookie: '] = 'UUID = '+UniqueID+ '; expires='+timeoutDate.toUTCString();
}

server.start('1234');