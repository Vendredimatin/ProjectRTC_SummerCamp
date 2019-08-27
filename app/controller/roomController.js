var baseDao = require('../dao/baseDao')();
var Room = require('../domain/room');
var ResultMessage = require('../domain/resultMessage');
module.exports = function (app, rooms) {

    var createRoom = function (req, res) {
        let username = req.body.username;
        let type = req.body.type;
        console.log(username);

        let newRoom = new Room(username, type, new Date().toLocaleDateString(), false);
        baseDao.insertOne('room', newRoom, function (result) {
            if (result['result']['ok'] == 1){
                rooms.addRoom(newRoom);
                res.status(200).send(JSON.stringify(result['ops'][0]['roomId']));
            } else res.status(200).send(ResultMessage.fail());
        });
        //rooms.addRoom(newRoom);
    };

    var getRoomList = function (req, res) {
        let username = req.body.username;

        baseDao.find('room', {username:username,isDelete:false}, function (result) {
            res.status(200).send(JSON.stringify({roomList:result}));
        })
    };

    var deleteRoom = function (req, res) {
        let roomId = req.body.roomId;
        console.log(roomId);
        let whereObj = {roomId:roomId};
        let upObj = {$set:{isDelete:true}};
        baseDao.updateOne('room',whereObj,upObj,function (result) {
            var re = JSON.parse(result);
            if (re.n === 1) {
                rooms[roomId] = undefined;
                res.send(JSON.stringify(ResultMessage.success()));
            } else {
                res.send(JSON.stringify(ResultMessage.fail()));
            }

        })
    };

    var getRoom = function (req, res) {
        let roomId = req.body.roomId;
        let room = rooms.getRoomsList()[roomId];
        res.send(JSON.stringify(room));
       /* baseDao.findOne('room',{roomId:roomId},function (result) {
            console.log(result);
            if (rooms.getRoomsList()['roomId'] != undefined)
                result['streamList'] = rooms.getRoomsList()['roomId'].streamList;
            res.send(JSON.stringify(result));
        });*/
        //let obj = {roomId:roomId, roomType: room.roomType, roomCode:room.roomCode, streamList:room.streamList};
        //res.status(200).send(JSON.stringify(obj));
    };

    var getRoomCode = function (req, res) {
        let roomId = req.body.roomId;
       // baseDao.findOne('room',{roomId:roomId},function (result) {
        let room = rooms.getRoomsList()[roomId];
        let roomCode = room.createCode();
        room.roomCode = roomCode;
        rooms[roomId] = room;
        res.send(JSON.stringify({roomCode:roomCode}));
       // });

    };

    app.post('/api/room/roomList', getRoomList);
    app.post('/api/room/roomList/delete/', deleteRoom);
    app.post('/api/room/', getRoom);
    app.post('/api/room/roomCode', getRoomCode);
    app.post('/api/room/createRoom', createRoom);
};