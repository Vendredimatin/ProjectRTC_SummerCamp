var schedule = require("node-schedule");
module.exports = function () {
    
    let roomList = {};
    //每分钟执行一次
    schedule.scheduleJob('5 * * * * *', function(){
        console.log("111");
        for (let i = 0; i < roomList.length; i++) {
            let room = roomList[i];
            room.changeCode();
            console.log(room.roomCode);
        }
    });

    return{
        addRoom:function (newRoom) {
            roomList[newRoom.roomId] = newRoom;
        },

        addStream(roomId, roomCode, deviceId, deviceName){
            let room = roomList[roomId];
            if (room == undefined)
                return false;

            if (roomCode != roomCode){
                return false;
            }
            room.addStream(deviceId, deviceName);
        },

        removeStream:function(streamId){
            for (let key in roomList) {
                let room = roomList[key];
                room.removeStream(streamId);
            }
        },

        getRoomsList(){
            return roomList;
        }
    }
};