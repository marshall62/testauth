
function getFullURL (req) {
    // if a global.host var is set use it as the host, else use the request host
    var host = global.host ? global.host : req.get('host');
    var fullUrl = req.protocol + '://' + host + req.originalUrl;
    return fullUrl;
}

function getPageContext (req) {
    // The host in the URL request is pulled out and appended to the global context path
    // var host = global.host ? global.host : req.get('host');
    var host = req.get('host');
    var fullUrl = req.protocol + '://' + host + global.context;
    return fullUrl;
}

var Util = module.exports = {
    fullURL: getFullURL ,
    pageContext:  getPageContext

}