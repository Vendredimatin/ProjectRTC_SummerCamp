var baseDao = require('../dao/baseDao')();
var Room = require('../domain/room');
var ResultMessage = require
module.exports = function (app, rooms) {

    var createRoom = function (req, res) {
        let username = req.body.username;
        let type = req.body.type;
        console.log(username);

        let newRoom = new Room(username, type, new Date().toLocaleDateString(), false);
        baseDao.insertOne('room', newRoom, function (result) {
            if (result['result']['ok'] == 1){
                //console.log(result);
                rooms.addRoom(newRoom);
                res.status(200).send(JSON.stringify(result['ops'][0]['roomId']));
            } else res.status(200).send(ResultMessage.fail());
        });
        //rooms.addRoom(newRoom);
    };

    var getRoomList = function (req, res) {
        let username = req.body.username;
        let roomList = [];
        for(let key in rooms.getRoomsList()){
            roomList.push(rooms[key]);
        }
        res.status(200).send(JSON.stringify({roomList:roomList}));
        /*baseDao.find('room', {username:username}, function (result) {
            console.log(result);
            if (result != null){
                console.log(result['ops']);
            }
        })*/
    };

    var deleteRoom = function (req, res) {
        let roomId = req.body.roomId;

        let whereObj = {roomId:roomId};
        let upObj = {$set:{isDelete:true}};
        baseDao.updateOne('room',whereObj,upObj,function (result) {
            console.log(result);
        })
    };

    var getRoom = function (req, res) {
        let roomId = req.body.roomId;
        let room = rooms[roomId];
        let obj = {roomId:roomId, roomType: room.roomType, roomCode:room.roomCode};
        res.status(200).send(JSON.stringify(obj));
    };

    var getRoomCode = function (req, res) {
        let roomId = req.body.roomId;

        let room = rooms[roomId];

        res.status(20).send(JSON.stringify({roomId:roomId, roomCode:room.roomCode}));
    };

    app.post('/api/room/roomList', getRoomList);
    app.post('/api/room/roomList/delete/', deleteRoom);
    app.get('/api/room/', getRoom);
    app.get('/api/room/roomCode', getRoomCode);
    app.post('/api/room/createRoom', createRoom);
};