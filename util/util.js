
function getFullURL (req) {
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
}

function getPageContext (req) {
    var fullUrl = req.protocol + '://' + req.get('host') + global.context;
}

var Util = module.exports = {
    fullURL: getFullURL ,
    pageContext:  getPageContext

}