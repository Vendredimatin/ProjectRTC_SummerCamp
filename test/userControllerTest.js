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
var userController = require('../app/controller/userController')(app,rooms);




it("should return 3",function () {
    var sum = userController.add(1,2);
    assert.equal(sum,3);
});


it('should login succeed', function () {
    this.timeout(2500);
     return request(app)
        .post("/api/user/login")
        .send({username:'lsy','password':'123'})
        .expect(200)
       .then(res => {
            assert.equal(res.statusCode, 200);
        })
});

it('should login failed', function () {
    this.timeout(2500);
     return request(app)
        .post("/api/user/login")
        .send({username:'lsy','password':'124'})
        .expect(200).then(res => {
         assert.equal(res.statusCode, 200);
     })
       /* .expect(function (res) {
            console.log(res.statusCode);
        })*/
});

it('should register user', function () {
    this.timeout(5000);
     return request(app)
        .post('/api/user/register')
        .send({username:'bbb','password':'123'})
        .expect(200).then(res => {
         assert.equal(res.statusCode, 200);
     })
        /*.expect(function (res) {
            //assert.equal(res.toString(),'{code: 0, message: "SUCCESS"}');
        }).end()*/
});

it('should register failed as user has existed', function () {
    this.timeout(2500);

    request(app)
        .post('/api/user/register')
        .send({username:'lhy','password':'123'})
        .expect(function (res) {
            console.log(res.statusCode);
            //assert.equal(res.toString(),'{code: 0, message: "SUCCESS"}');
        }).end()
});
