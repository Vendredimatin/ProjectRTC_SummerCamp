var baseDao = require('../dao/baseDao');
module.exports = function (app, rooms) {
    let baseDao = baseDao();
    
    var createRoom = function (req, res) {
        let username = req.body.username;
        let type = req.body.type;

        let newRoom = new Room(username, type, new Date().toLocaleDateString(), false);
        /*baseDao.insertOne('room', newRoom, function (result) {
            if (result['result']['ok'] == 1){
                res.status(200).send(result['op']['_id']);
                //rooms.addRoom()
            } else res.status(200).send(ResultMessage.fail());
        });*/
        rooms.addRoom(newRoom);
    };

    var getRoomList = function (req, res) {
        let username = req.body.username;
        res.status(200).send(JSON.stringify(rooms));
        /*baseDao.find('room', {username:username}, function (result) {
            console.log(result);
        })*/
    };

    var deleteRoom = function (req, res) {
        let roomId = req.body.roomId;

        let whereObj = {_id:roomId};
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
    }

    app.get('/api/room/roomList', getRoomList);
    app.post('/api/room/roomList/delete/', deleteRoom);
    app.get('/api/room/', getRoom);
    app.get('/api/room/roomCode', getRoomCode);
    app.get('/api/room/createRoom', createRoom);
};