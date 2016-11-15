
function getFullURL (req) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    return fullUrl;
}

function getPageContext (req) {
    var fullUrl = req.protocol + '://' + req.get('host') + global.context;
    return fullUrl;
}

var Util = module.exports = {
    fullURL: getFullURL ,
    pageContext:  getPageContext

}