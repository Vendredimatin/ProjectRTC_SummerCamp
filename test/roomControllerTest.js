var express = require('express')
    ,	path = require('path')
//var rooms = require('./app/domain/rooms.js')();
var favicon = require('serve-favicon')
    ,	logger = require('morgan')
    ,	methodOverride = require('method-override')
    ,	bodyParser = require('body-parser')

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

var request = require("supertest");
var assert = require('assert');
var rooms = require('../app/domain/rooms.js')();
var roomController = require('../app/controller/roomController')(app,rooms);
var baseDao = require('../app/dao/baseDao')();
var Room = require('../app/domain/room');


it('should getRoomList', function () {
    this.timeout(3000);
    return request(app)
        .post("/api/room/roomList")
        .send({username:'lsy'})
        .expect(200).then(res => {
            assert.equal(res.statusCode, 200);
        })

});

it('should deleteRoom', function () {
    this.timeout(2500);
    return request(app)
        .post("/api/room/roomList/delete/")
        .send({roomId:'v25gu5'})
        .expect(200).then(res => {
            assert.equal(res.statusCode, 200);
        })
});

it('should getRoom', function () {
    return request(app)
        .post("/api/room/")
        .send({roomId:'v25gu5'})
        .expect(200)
        .then(res => {
            assert.equal(res.statusCode, 200);
        })
});

it('should getRoomCode', function () {
     baseDao.find('room',{roomId:'v25gu5'},function (result) {
        for (let i = 0; i <result.length; i++) {
            let newRoom = new Room("lhy",result[i].roomType,result[i].createTime,result[i].isDelete
                ,result[i].streamList,result[i].roomCode,result[i].roomId);
            rooms.addRoom(newRoom);
            console.log("add.....");
        }
        console.log(result.length);
    });

    return request(app)
        .post("/api/room/roomCode")
        .send({roomId:'v25gu5'})
        .expect(200)
        .then(res => {
            assert.equal(res.statusCode, 200);
        })
});

it('should createRoom', function () {
    this.timeout(2500);
    request(app)
        .post("/api/room/createRoom")
        .send({username:'lhy',type:'monitor'})
        .expect(200)
        /*.then(res => {
            assert.equal(res.statusCode, 200);
        })*/.end();
});

var io = require('socket.io-client');
it('should register into rooms', function () {
    var socket = io.connect('http://localhost:3000');
    socket.on('connect', function() {
        console.log("connect")
    });
    let streamInfo = {
        id:"4a0xyl",
        code:"axqh",
        name:'a',
        mac:'assdasds'
    };
    socket.emit('readyToStream',streamInfo);
});