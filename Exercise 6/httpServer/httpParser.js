/* constructor of HttpRequest*/

var HttpRequest = function () {
    this.method = '';
    this.uri = '';
    this.resource = '';
    this.resPath = '';
    this.httpVersion = '';
    this.headers = {};
    this.body = '';
}

function parseRequest(requestString) {

    var httpRequest = new HttpRequest();
    if (requestString === undefined) {
        return '400';
    }

    var isValidReq = checkIfValidityRequest(requestString);
    if(isValidReq === true)
    {
        parseByLines(requestString, httpRequest);
        return httpRequest;
    }
    else
    {
        return isValidReq;
    }
}

// ********************* validity functions *********************//

function checkIfValidityRequest(request) {
    //check if request is type of string
    if (isString(request)) {
        var lineList = request.split('\r\n');

        //check if the first line is good (method,uri,version)
        //if the first line is incorrect, we got an error:
        //isFirstLineGood will contains a message +number error
        var isFirstLineGood = isMethodLineCorrect(lineList[0]);

        if (isFirstLineGood === true)
        {
            //check if has body
            var hasBody = request.match('\r\n\r\n') != null ? true : false;
            return isHeadersValid(lineList, hasBody);
        }
        else
        {
            return isFirstLineGood;
        }
    }
}

function isString(toCheck) {
    return typeof toCheck === 'string' || (typeof toCheck === 'object' && toCheck.constructor === String);
}

function isMethodLineCorrect(methodLine) {
    var legalMethods = ['GET', 'POST', 'HEAD', 'PUT' , 'DELETE', 'OPTIONS', 'CONNECT', 'PATCH' ];

    var separatedBySpace = methodLine.split(' ');

    if (separatedBySpace.length === 3)
    {
        var method = separatedBySpace[0].replace(' ', '');
        //check if method is legal
        if (legalMethods.indexOf(method) === -1 || (method != 'GET' && method != 'POST')){
            return '405';
        }

        var uri = separatedBySpace[1];
        //check if uri start with '/'
        if (uri.indexOf('/') != 0 ||(uri.indexOf('/') != 0 && uri.indexOf('.') === -1))
            return false;

        var version = separatedBySpace[2];
        //check if http version start with http/
        if (version.match('HTTP/') === null)
            return false;

        return true
    }
    else
        return '400';

}

function isHeadersValid(lineList, hasBody) {
    var numOfHeaders = (hasBody === true) ? lineList.length - 2 : lineList.length;

    for (var lineNum = 1; lineNum < numOfHeaders; lineNum++) {
        var header = lineList[lineNum];
        var regexHeader = /([A-z]|[A-z]-[A-z])*: /;
        var result = header.match(regexHeader) === null;
        if (result)
            return false
    }
    return true
}

//****************************************************************//

function parseByLines(requestString, httpRequest) {

    var hasBody = false;
    if (requestString.indexOf('\r\n\r\n') != -1) {
        hasBody = true;
    }

    var listByLine = requestString.split('\r\n');
    var methodLine = listByLine[0];


    if (isLegalMethod(methodLine)) {
        var method = methodLine.split(' ')[0];
        httpRequest.method = method;
    }
    else {
        return httpRequest;//return an empty object
    }

    parseURILineAndVersion(methodLine, httpRequest);
    parseHeaders(listByLine, httpRequest, hasBody);

    httpRequest.body = hasBody === true ? listByLine[listByLine.length - 1] : '';

}

function isLegalMethod(methodToCheck) {
    var method = methodToCheck.split(' ')[0];

    if (method != 'GET' && method != 'POST')
        return false;
    else
        return true;
}

function parseURILineAndVersion(line, httpRequest) {

    var listSplitBySpace = line.split(' ');
    if (listSplitBySpace.length > 1 && listSplitBySpace.length === 3) {

        var uri = listSplitBySpace[1];
        httpRequest.uri = uri;

        var resource = uri.split('/');
        var  withParameters =  resource[resource.length - 1];
        httpRequest.resource = withParameters.split('?')[0];

        var resPath = uri.replace('/' + resource[resource.length - 1], '');
        httpRequest.resPath = resPath;

        var version = listSplitBySpace[2];
        httpRequest.httpVersion = version.substr(version.indexOf('/') + 1);

    }
}

function parseHeaders(listByLine, httpRequest, hasBody) {

    var numOfheaders = hasBody === true ? listByLine.length - 2 : listByLine.length;

    for (var lineNum = 1; lineNum < numOfheaders; lineNum++) {
        var line = listByLine[lineNum];
        parseAndAddToHashHeader(line, httpRequest);
    }
}

function parseAndAddToHashHeader(line, httpRequest) {

    var listSepratedByColon = line.split(':');
    var header_name = listSepratedByColon[0];

    var header_val = listSepratedByColon[1];
    if (listSepratedByColon.length > 2) {
        for (var i = 2; i < listSepratedByColon.length; i++)
            header_val += ':' + listSepratedByColon[i];
    }

    httpRequest.headers[header_name] = header_val;
}



module.exports.parseRequest = parseRequest ;
// ************************  some test ***********************//

/*

 var requestStringFromPDF = 'GET /players/mJordan/info.html HTTP/1.1\r\nHost: www.nba.com\r\nUser-Agent: Mozilla/5.0 (Windows;) Gecko Firefox/3.0.4\r\nAccept: text/html,application/xhtml+xml,application/xml;\r\nAccept-Language: en-us,en;q=0.5\r\nX-cept-Encoding: gzip,deflate\r\nAccept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7\r\nKeep-Alive: 300\r\nConnection: keep-alive\r\nReferer: http://www.google.co.il/search?q=NBA Jordan 23\r\n\r\nasdasdasdasdasdasdasdasasasasasasasasasasasasasasasasasasasasasasasasasasasasasas';


 **********************   Request   ************************
 0.  GET /players/mJordan/info.html HTTP/1.1
 1.  Host: www.nba.com
 2.  User-Agent: Mozilla/5.0 (Windows;) Gecko Firefox/3.0.4
 3.  Accept: text/html,application/xhtml+xml,application/xml;
 4.  Accept-Language: en-us,en;q=0.5
 5.  X-cept-Encoding: gzip,deflate
 6.  Accept-Charset: ISO-8859-1,utf-8;q=0.7,*;q=0.7
 7.  Keep-Alive: 300
 8.  Connection: keep-alive
 9.  Referer: http://www.google.co.il/search?q=NBA Jordan 23
 10.
 11.  asdasdasdasdasdasdasdasasasasasasasasasasasasasasasasasasasasasasasasasasasasasas

 */




