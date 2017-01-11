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
// config.pageContext = "testauth";
// correct setting for development environment
config.pageContext = "";

module.exports = config;