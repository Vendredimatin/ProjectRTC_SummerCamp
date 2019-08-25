class Room {
    constructor(username, type, createTime, isDelete){
        this.username = username;
        this.type = type;
        this.createTime = createTime;
        this.isDelete = isDelete;
        this.streamList = [];
        this.code = this.createCode();
        this.roomId = this.createId();
    }

    createId(){
        var str = '0123456789abcdefghjklmnpqrstuvwxyz';
        var res = '';
        for (let i = 0; i < 6; i++){
            var n=parseInt(Math.random()*str.length);
            res+=str[n];
        }
        return res;
    }

    createCode(){
        var str = '0123456789abcdefghjklmnpqrstuvwxyz';
        var res = '';
        for(var i=0;i<4;i++){
            //随机产生字符串的下标
            var n=parseInt(Math.random()*str.length);
            res+=str[n];
        }
        return res;
    }

    changeCode(){
        this.code = this.createCode();
    }

    addStream(deviceId, deviceName){
        let stream = new Stream(deviceId, deviceName);
        this.streamList.push(stream);
    }

};