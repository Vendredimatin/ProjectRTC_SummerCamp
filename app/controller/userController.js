var baseDao = require('../dao/baseDao')();
var ResultMessage = require('../domain/resultMessage');
var Room = require('../domain/room');
module.exports = function (app, rooms) {
    let roomCollection = 'room';

    var login = function (req, res) {
        let username = req.body.username;
        let password = req.body.password;

        let obj = {username: username, password: password};
        baseDao.findOne('user', obj, function (result) {
            console.log(result);
            if (result != null) {
                res.status(200).send(ResultMessage.success()/*{code:0,message:"SUCCESS"}*/);
                baseDao.find('room', {username:username,isDelete:false}, function (result) {
                    for (let i = 0; i <result.length; i++) {
                        let newRoom = new Room(username,result[i].roomType,result[i].createTime,result[i].isDelete
                            ,result[i].streamList,result[i].roomCode,result[i].roomId);
                        rooms.addRoom(newRoom);
                    }
                })
            } else {
                res.status(200).send(/*ResultMessage.fail(*/{code: 1, message: "FAIL"});
            }
        });
    };

    var register = function (req, res) {
        let username = req.body.username;
        let password = req.body.password;

        let obj = {username: username, password: password};

        baseDao.findOne('user', {username: username}, function (result) {
            if (result == null) {
                baseDao.insertOne('user', obj, function (result) {
                    if (result['result']['ok'] == 1) {
                        res.status(200).send({code: 0, message: "SUCCESS"});
                    } else res.status(200).send({code: 1, message: "FAIL"});
                });
            } else {
                res.status(200).send({code: 2, message: "FAIL_EXISTED"});
            }
        });

    };

    app.post('/api/user/login', login);
    app.post('/api/user/register', register);

    return {
        add:function (a, b) {
            return a + b;
        },
    }
};