/**
 * Module dependencies.
 * 源码分析
 * https://blog.csdn.net/qq_21358401/article/details/78943538
 */
var express = require('express')
,	path = require('path')
,	streams = require('./app/streams.js')();
var rooms = require('./app/domain/rooms.js')();
var favicon = require('serve-favicon')
,	logger = require('morgan')
,	methodOverride = require('method-override')
,	bodyParser = require('body-parser')
,	errorHandler = require('errorhandler');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// routing
require('./app/routes.js')(app, streams);

var server = app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// 监听服务
var io = require('socket.io').listen(server);
/**
 * Socket.io event handling
 */
require('./app/socketHandler.js')(io, rooms);
require('./app/controller/userController.js')(app,rooms);
require('./app/controller/roomController.js')(app,rooms);


var schedule = require("node-schedule");
schedule.scheduleJob('0 0/3 * * *', function(){
    let roomList = rooms.getRoomsList();
    for (let roomId in roomList){
        let room = roomList[roomId];
        room.changeCode();
        console.log(room.roomCode);
    }
    for (let i = 0; i < roomList.length; i++) {
        let room = roomList[i];
        room.changeCode();
        console.log(room.roomCode);
    }
});