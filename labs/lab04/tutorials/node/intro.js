const http = require('http');
var dt = require('./module');
const url = require('url');
const fs = require('fs');
var events = require('events');
var eventEmitter = new events.EventEmitter();

// http://localhost:8080/?year=2023&month=February
http.createServer(function (req, res) {
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write('The date and time: ' + dt.myModule());
    var q = url.parse(req.url,true).query;
    res.end('Query: ' + q.year + ' ' + q.month);
}).listen(8080);

// http://localhost:8000/
http.createServer(function (req,res) {
    fs.readFile('../../IITASC/sql/univ-data.sql',  function (err,data) {
        res.writeHead(200,{'Content-Type':'text/html'});
        res.write(data);
        return res.end();
    });
}).listen(8000);

var eventHandler = function () {
    console.log('I hear a scream!');
}

eventEmitter.on('scream',eventHandler);
eventEmitter.emit('scream');

// https://www.w3schools.com/nodejs/nodejs_uploadfiles.asp
// https://www.tutorialspoint.com/nodejs/index.htm
// https://nodejs.dev/en/learn/

// https://node-postgres.com/

// https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm
// https://www.section.io/engineering-education/session-management-in-nodejs-using-expressjs-and-express-session/