module.exports = function(io, rooms) {

  //监听客户端连接，回调函数会传递本次连接的socket
  io.on('connection', function(client) {
    console.log('-- ' + client.id + ' joined --');
    // 通知客户端已连接
    client.emit('id', client.id);

    //监听客户端发送的消息， 该事件由客户端触发
    client.on('message', function (details) {
      var otherClient = io.sockets.connected[details.to];

      if (!otherClient) {
        return;
      }
        delete details.to;
        details.from = client.id;
        //将客户端发送来的消息转发给其他客户端
        otherClient.emit('message', details);
    });

    // 监听消息，名字可以自命名，根据客户端的id和options的name闯将一个新流
    client.on('readyToStream', function(options) {
      console.log('-- ' + client.id + ' is ready to stream --');
      console.log(options);
      let roomId = options.id;
      let roomCode = options.code;
      let deviceName = options.name;
      let deviceId = options.mac;
      console.log(roomId,roomCode);
      rooms.addStream(roomId,roomCode, client.id, options.name);
      //streams.addStream(client.id, options.name);
    });
    
    client.on('update', function(options) {
      //streams.update(client.id, options.name);
    });

    function leave() {
      console.log('-- ' + client.id + ' left --');
      rooms.removeStream(client.id);
      //streams.removeStream(client.id);
    }

    client.on('disconnect', leave);
    client.on('leave', leave);
  });
};