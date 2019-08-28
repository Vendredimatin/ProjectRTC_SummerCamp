module.exports = function () {

    let roomList = {};
    //每分钟执行一次

    return{
        addRoom:function (newRoom) {
            roomList[newRoom.roomId] = newRoom;
        },

        addStream(roomId, roomCode, streamId, deviceName, mac){
            let room = roomList[roomId];
            if (room == undefined)
                return false;

            if (roomCode != room.roomCode){
                return false;
            }
            room.addStream(streamId, deviceName, mac);
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