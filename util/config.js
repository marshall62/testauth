var config = {};

config.db = {};
config.loginServer = {};



config.loginServer.host = 'http://tutor.mathspring.org';
// config.loginServer.path = 'ms/rest/admin';
config.loginServer.path = '/woj/rest/admin';
config.db.user="WayangServer";
config.db.password="jupiter";
config.db.database="wayangoutpostdb";
config.db.host="localhost";

// NOTE:  Turn on ONE of these:
// correct setting for rose server
// this allows using a URL like rose.cs.umass.edu/testauth/login/
// config.pageContext = "testauth";

// correct setting for development environment (not sure about testauthdd .  It's not working for me anymore).  Empty seems to work
// This allows using a URL like localhost:3000/login/

// config.pageContext = "/testauthdd";   // or maybe "testauthdd" ??
config.pageContext = "";


module.exports = config;