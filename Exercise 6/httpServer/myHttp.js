/**
 * Created by adar-ohana on 25/05/14.
 */
var net = require('net');
var fs = require('fs');
var parser = require('./httpParser');
var settings = require('./settings');
var events = require('events');
var util = require('util');
var responseCreator = require('./handleResponse');
/*******************************
 server Object
 *******************************/
// constructor
var ServerObj = function (rootFolder) {
    events.EventEmitter.call(this);
    //onstart callback
    this.onStart = function (callback) {
       // console.log('registered on start event');
        this.on('onStart', callback);
    }
    //supports get callback
    this.get = function (path, callback) {
       // console.log(path);
        if (isTemplate(path)) {
        //    console.log('this is a template!');
            this.templateArray.push(path);
        } else {
            this.nonTemplatesArray.push(path);
        }
      //  console.log('registered get event to ' + path);
        this.on('GET_' + path, function (request, response) {
            callback(request, response);
        });
    }
    //supports post callback
    this.post = function (path, callback) {
        if (isTemplate(path)) {
            this.templateArray.push(path);
        } else {
            this.nonTemplatesArray.push(path);
        }
    //    console.log('registered post event to ' + path);
        this.on('POST_' + path, function (request, response) {
            callback(request, response);
        });
    }
    this.rootFolder = rootFolder;
    this.port = null;
    this.isStarted = false;
    this.startedData = null;
    this.numOfCurrentRequests = 0;
    this.numOfAllRequests = 0;
    this.numOfSuccesfulRequest = 0;
    this.templateArray = [];
    this.nonTemplatesArray = [];
    var that = this;
    this.serverObj = net.createServer(function (socket) {
        handleNewConnection(that, socket);
    });
};

util.inherits(ServerObj, events.EventEmitter);

/*HTTP REPONSE OBJECT*/
var http_response = function (socket) {
    var time_out2 = setTimeout(function () {
       // console.log('end connection(1 sec)');
    }, settings.INTRERNAL_SERVER_ERROR_DYN*5);
    this.headers = {};
    this.body = '';
    this.status = '200';
    this.write = function (str) {
        this.body += str;
    }
    this.end = function (str) {
        str = str || '';
        this.body += str;
        socket.write(responseCreator.getDynamicResponse(this.status, this.headers, this.body));
    }
}
//extend ServerObj with start stop and status
ServerObj.prototype.start = function (port) {
    if (isPortValid(port)) {
        // update server data
        var that = this;
        // start listening on port
        this.serverObj.listen(port, function () {
            console.log('listening');
            that.isStarted = true;
            that.port = port;
            that.startedData = new Date();
            that.emit('onStart');
        });
    } else {
        console.log('port is not legal, need to be a positive number\r\nserver stopped!');
    }
}
ServerObj.prototype.stop = function () {
    this.serverObj.close(function (err) {
        if (err) throw err;
        else {
            console.log('server stopped');
        }
    });
}
ServerObj.prototype.status = function () {
    return {
        isStarted: this.isStarted,
        startedData: this.startedData,
        port: this.port,
        numOfCurrentRequests: this.numOfCurrentRequests,
        precntageOfSuccesfulRequest: (this.numOfSuccesfulRequest / this.numOfAllRequests) * 100
    };
}

//****************** function of static Server ******************/
var Server = function createHTTPServer(rootFolder) {
    var servObj = new ServerObj(rootFolder);
    return servObj;
}

//checks is port is valid
function isPortValid(port) {
    if (port === null || port < 0 || isNaN(port))
        return false;
    else
        return true;
}

// match path string to param str
function isMatchPath(path, str) {
    var pathSeparatedBySlash = path.split('/');
    var strSeparatedBySlash = str.split('/');
    if (pathSeparatedBySlash.length === strSeparatedBySlash.length &&
        pathSeparatedBySlash[1] === strSeparatedBySlash[1]) {
        var jsonOfParams = {};
        for (var i = 2; i < strSeparatedBySlash.length ; i++) {
            var key = pathSeparatedBySlash[i];
            key = key.substr(key.indexOf(':') + 1);
            //var key = pathSeparatedBySlash[i].replaceAll(':','');
            var value = strSeparatedBySlash[i];
            jsonOfParams[key] = value;
        }
        return jsonOfParams;
    } else {
        return false;
    }
}

// is template in current syntax
function isTemplate(str) {
    var arr = str.split('/');
    var i;
    var res = true;
    var str, first, last;
    for (i = 2; i < arr.length && res; i++) {
        str = arr[i];
        first = str.substr(0, 1);
        last = str.substr(1);
        if ((first !== ':' || last.replace(/[^:]/g, '').length !== 0)) {
            res = false || (i === arr.length - 1 && str === '');
        }
    }
    return res;
}

//************************** call back function - handle Con & Req **********************//
function handleNewConnection(server, socket) {
    var time_out = setTimeout(function () {
        console.log('end connection(2 sec)');
        socket.end();
    }, settings.LAST_REQUEST_TIMEOUT_SEC);
    socket.setEncoding('utf8');
    socket.on('data', function (data) {
        clearTimeout(time_out);
        handleRequest(server, data, socket);
    });
}

function handleRequest(server, data, socket) {
    server.numOfCurrentRequests += 1;
    server.numOfAllRequests += 1;
    var httpRes = '';
    var objFromParser = parser.parseRequest(data);
    var flagLegal = true;
    var isLegal = isLegalReq(objFromParser);
    var isStatusReq = checkStatus(objFromParser);
    var user_response_obj;
    var is_temp = false;
    var is_other_dynamic = false;
    var template = '';
    var params = {};
    server.templateArray.forEach(function (val) {
        //console.log(val + ',' + objFromParser.uri);
        if(isMatchPath(val, objFromParser.uri)){
        //    console.log('match!!');
        }
        if (isMatchPath(val, objFromParser.uri)) {
            user_response_obj = new http_response(socket);
            params = isMatchPath(val, objFromParser.uri);
            objFromParser.params = params;
            //console.log('match template! ' + val)
            is_temp = true;
            template = val;
        }
    });
    server.nonTemplatesArray.forEach(function (val) {
      //  console.log(val+ " , "+objFromParser.uri);
        if (val === objFromParser.uri) {
            user_response_obj = new http_response(socket);
            is_other_dynamic = true;
        }
    });
    if (is_temp) {
        flagLegal=false;
        server.emit(objFromParser.method + '_' + template, objFromParser, user_response_obj);
        //console.log('emitted: ' + objFromParser.method + '_' + template);
    } else if (is_other_dynamic) {
        flagLegal=false;
        server.emit(objFromParser.method + '_' + objFromParser.uri, objFromParser, user_response_obj);
        //console.log('emitted: ' + objFromParser.method + '_' + objFromParser.uri);
    } else {
        if (isLegal === settings.BAD_REQUEST) {
            httpRes = responseCreator.get400Response();
        } else if (isLegal === settings.METHOD_NOT_ALLOWED) {
            httpRes = responseCreator.get405Response();
        } else if (isLegal === settings.INTRERNAL_SERVER_ERROR) {
            httpRes = responseCreator.get500Response();
        } else if (isLegal === settings.OK) //200 code
        {
            if (isStatusReq) {
                server.numOfCurrentRequests -= 1;
                server.numOfSuccesfulRequest++;
                var html_res = generateStatusHtmlFromServer(server);
                httpRes = responseCreator.get200Response(html_res.length, 'html');
                socket.write(httpRes);
                socket.write(html_res, function () {
                    socket.end();
                });
                return;
            } else {
                //var path = objFromParser.resPath;
                var resourcePars = objFromParser.resource;
                var filePath = server.rootFolder + objFromParser.resPath + '/' + resourcePars;
                //check if the path is in root
                if (!isPathLegal(filePath)) {
                    // console.log(filePath);
                    httpRes = responseCreator.get500Response();
                } else {
                    flagLegal = false;
                    fs.stat(filePath, function (error, stat) {
                        if (error) {
                            socket.write(responseCreator.get500Response());
                            return;
                        }
                        var fileType = resourcePars.substr(resourcePars.lastIndexOf('.') + 1);
                        var sizeOfBody = stat.size;
                        if (sizeOfBody === 0)
                            socket.write(responseCreator.get500Response());
                        else {
                            httpRes = responseCreator.get200Response(sizeOfBody, fileType);
                            socket.write(httpRes);
                            if (fileType.indexOf('/') > 0) {
                                if (checkIfNeedToKeepAlive(objFromParser) === true) {
                                    socket.end();
                                }
                            } else {
                                var opts = {
                                    end: false
                                };
                                if (checkIfNeedToKeepAlive(objFromParser) === true) {
                                    //when pipe get {} in options
                                    opts = {};
                                }
                                try {
                                    var fileStream = fs.createReadStream(filePath);
                                    fileStream.pipe(socket, opts);
                                } catch (e) {
                                    console.log('ERROR: ' + e);
                                }
                            }
                        }
                    });
                    server.numOfSuccesfulRequest++;
                }
            }
        }
    }
    if (flagLegal) {
        socket.write(httpRes, function () {
            socket.end();
        });
        server.numOfCurrentRequests -= 1;
        return;
    } else {
        server.numOfCurrentRequests -= 1;
    }
}

function checkIfNeedToKeepAlive(objFromParser) {
    var version = objFromParser.httpVersion;
    var connectionHeader = objFromParser.headers['Connection'];
    if (version === '1.0' && connectionHeader !== ' keep-alive') {
        console.log('end connection(version)');
        return true;
    }
    if (typeof connectionHeader !== undefined) {
        if (connectionHeader === ' close') {
            console.log('end connection(Connection: close)');
            return true;
        }
    }
    return false;
}

function isLegalReq(objFromParser) {
    if (objFromParser === false) {
        return settings.INTRERNAL_SERVER_ERROR;
    } else if (objFromParser === settings.BAD_REQUEST) {
        return settings.BAD_REQUEST;
    } else if (objFromParser === settings.METHOD_NOT_ALLOWED) {
        return settings.METHOD_NOT_ALLOWED;
    }
    return settings.OK;
}

function isPathLegal(path) {
    return fs.existsSync(path);
}

function checkStatus(objFromParser) {
    if (objFromParser.uri === '/status') {
        return true;
    }
    return false;
}

function generateStatusHtmlFromServer(server) {
    var statObject = server.status();
    var _html = '<html>' +
        '<head>' +
        '<title>Status Page</title>' +
        '</head>' +
        '<body>' +
        '<h1>Status Page</h1>' +
        '<hr />' +
        '<p>';
    for (var key in statObject) {
        _html += '<strong>' + key + '</strong> ';
        _html += statObject[key] + '<br />';
    }
    _html += '</p>' +
        '</body></html>';
    return _html;
}
module.exports.createHTTPServer = Server;

