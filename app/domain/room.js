let Stream = require('../domain/stream');
const stringRandom = require('string-random');
class Room {
    constructor(username, type, createTime, isDelete, streamList, roomCode, roomId){
        this.username = username;
        this.roomType = type;
        this.createTime = createTime;
        this.isDelete = isDelete;
        this.streamList = (streamList == undefined)?[]:streamList;
        this.roomCode = (roomCode== undefined)?this.createCode():roomCode;
        this.roomId = (roomId == undefined)?this.createId():roomId;
    }

    createId(){
     //   var str = '0123456789abcdefghjklmnpqrstuvwxyz';
        var res = '';
/*        let numStr = str.substr(0,10);
        let letterStr = str.substr(10);*/

        if (this.roomType == 'monitor'){
            /*let firstN = parseInt(Math.random() * numStr.length);
            res += numStr[firstN];*/
            res = stringRandom(1, {numbers:false})
        }else {
            /*let firstN = parseInt(Math.random() * letterStr.length);
            res += letterStr[firstN];*/

            res = stringRandom(1, {letters:false});
        }

        res += stringRandom(5)

        /*for (let i = 0; i < 5; i++){
            var n=parseInt(Math.random()*str.length);
            res+=str[n];
        }*/
        return res;
    }

    createCode(){
     //   var str = '0123456789abcdefghjklmnpqrstuvwxyz';
        var res = stringRandom(4);
        /*for(var i=0;i<4;i++){
            //随机产生字符串的下标
            var n=parseInt(Math.random()*str.length);
            res+=str[n];
        }*/
        return res;
    }

    changeCode(){
        this.roomCode = this.createCode();
    }

    addStream(deviceId, deviceName, mac){
        let stream = new Stream(deviceId, deviceName, mac);
        this.streamList.push(stream);
    }

    removeStream(streamId){
        for (let i = 0; i < this.streamList.length; i++) {
            if (streamId == this.streamList[i].id){
                this.streamList.splice(i,1);
                break;
            }
        }
    }

}

module.exports = Room;