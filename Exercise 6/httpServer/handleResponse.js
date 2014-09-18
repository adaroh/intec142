/**
 * Created by adar-ohana on 29/05/14.
 */

var statusRes = '';//TODO need to change from global
var headersRes = {'Date:': ' '+new Date()};
var bodyRes = '';



function  create200Response(sizeOfBody,fileType){

    statusRes = '200 OK';
    bodyRes ='';
    headersRes['Content-Length: '] = '' + sizeOfBody;
    headersRes['Content-Type: '] = getContentTypes(fileType);
    headersRes['Access-Control-Allow-Origin: '] ='*';

    return buildStrResponse(statusRes, headersRes, bodyRes);
}

function create400Response() {
    statusRes = '400 Bad Request';

    bodyRes =
        '<html>\r\n' +
        '<head>\r\n' +
        '<title>400 Error</title>\r\n'+
        '</head>\r\n' +
        '<body>\r\n' +
        '<h1>400 Bad Request</h1>\r\n' +
        '</body>\r\n' +
        '</html>\r\n';

    headersRes['Content-Length: '] = '' + bodyRes.length;
    headersRes['Content-Type: '] = 'text/html';
    headersRes['Access-Control-Allow-Origin: '] ='*';

    return buildStrResponse(statusRes, headersRes, bodyRes);
}

function create405Response() {
    statusRes = '405 Method Not Allowed';

    bodyRes =
        '<html>\r\n' +
        '<head>\r\n' +
        '<title>405 Error</title>\r\n'+
        '</head>\r\n' +
        '<body>\r\n' +
        '<h1>405 Method Not Allowed</h1>\r\n' +
        '</body>\r\n' +
        '</html>\r\n';

    headersRes['Content-Length: '] = '' + bodyRes.length;
    headersRes['Content-Type: '] = 'text/html';
    headersRes['Access-Control-Allow-Origin: '] ='*';

    return buildStrResponse(statusRes, headersRes, bodyRes);
}

function create408Response() {
    statusRes = '408 Request timeout';

    bodyRes =
        '<html>\r\n' +
        '<head>\r\n' +
        '<title>408 Error</title>\r\n'+
        '</head>\r\n' +
        '<body>\r\n' +
        '<h1>408 Request timeout</h1>\r\n' +
        '</body>\r\n' +
        '</html>\r\n';

    headersRes['Content-Length: '] = '' + bodyRes.length;
    headersRes['Content-Type: '] = 'text/html';
    headersRes['Access-Control-Allow-Origin: '] ='*';

    return buildStrResponse(statusRes, headersRes, bodyRes);
}

function create500Response(){
    statusRes = '500 Internal Server Error';

    bodyRes =
        '<html>\r\n' +
        '<head>\r\n' +
        '<title>500 Error</title>\r\n'+
        '</head>\r\n' +
        '<body>\r\n' +
        '<h1>500 Internal Server Error</h1>\r\n'+
        '</body>\r\n' +
        '</html>\r\n';



    headersRes['Content-Length: '] = '' + bodyRes.length;
    headersRes['Content-Type: '] = 'text/html';
    headersRes['Access-Control-Allow-Origin: '] ='*';

    return buildStrResponse(statusRes, headersRes, bodyRes);
}


function getDynamicResponse(status,headers,body)
{
    statusRes = status;
    bodyRes = body;
    headersRes['Content-Length: '] = '' + bodyRes.length;
    headersRes['Access-Control-Allow-Origin: '] ='*';

    var isContentTypeExisting = false;
    for (header in headers)
    {
        if (header.indexOf('Content-Length') >= 0){

        }
        else
        {
            if(header.indexOf('Content-Type') >= 0)
                isContentTypeExisting = true;

            headersRes[header] = headers[header];
        }
    }
    if(!isContentTypeExisting)
        headersRes['Content-Type: '] = getContentTypes('html');

    return buildStrResponse(statusRes, headersRes, bodyRes);
}





function buildStrResponse(status, headers, body) {

    var httpRes =
        'HTTP/1.0 ' + status + '\r\n' +
        gatHeadersStr(headers) + '\r\n' +
        body;

    return httpRes;
}

function gatHeadersStr(headers) {
    var strAns = '';
    for (var index in headers) {
        var mapKey = index;//This is the map's key.
        var mapKeyVal = headers[mapKey];//This is the value part for the map's key.
        strAns += mapKey + mapKeyVal + '\r\n';
    }
    return strAns;
}

function getContentTypes(fileType) {
    var optionsType = {'js': 'application/javascript', 'html': 'text/html', 'css': 'text/css', 'jpg': 'image/jpg', 'jpeg': 'image/jpeg',
        'gif': 'image/gif', 'php': 'text/plain', 'txt': 'text/plain', 'json': 'application/json'};

    return optionsType[fileType];
}


module.exports.get200Response = create200Response ;
module.exports.get400Response = create400Response ;
module.exports.get405Response = create405Response ;
module.exports.get408Response = create408Response ;
module.exports.get500Response = create500Response ;
module.exports.getDynamicResponse = getDynamicResponse;

