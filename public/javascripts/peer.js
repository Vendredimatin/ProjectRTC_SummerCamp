class Peer_liu{
    constructor(pcConfig, pcConstraints, remoteId){
        this.remoteVideoEl = document.createElement('video');
        this.remoteVideoEl.controls = true;
        this.remoteVideoEl.autoplay = true;
        this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
        this.dataChannel = this.createDataChannel();
        this.remoteId = remoteId;
    }

  /*  createPeerConnection(pcConfig, pcConstraints){
        peer.pc.onicecandidate = function(event) {
            if (event.candidate) {
                send('candidate', remoteId, {
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            }
        };
        peer.pc.onaddstream = function(event) {
            //stream 来自rtc.loadData();
            attachMediaStream(peer.remoteVideoEl, event.stream);
            remoteVideosContainer.appendChild(peer.remoteVideoEl);
        };
        peer.pc.onremovestream = function(event) {
            peer.remoteVideoEl.src = '';
            remoteVideosContainer.removeChild(peer.remoteVideoEl);
        };
        peer.pc.oniceconnectionstatechange = function(event) {
            switch(
                (  event.srcElement // Chrome
                    || event.target   ) // Firefox
                    .iceConnectionState) {
                case 'disconnected':
                    remoteVideosContainer.removeChild(peer.remoteVideoEl);
                    break;
            }
        };
    }*/

    createDataChannel() {
        var dataChannelOptions = {
            ordered: false, //不保证到达顺序
            maxRetransmitTime: 3000, //最大重传时间
            //添加了negotiated 和 id之后,虽然dataChannel可以open，但是无法传送数据
        };

        let dataChannel =  this.pc.createDataChannel("dataChannel."+ this.remoteId, dataChannelOptions);
        console.log("dataChannel has been initialized");

        dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };

        dataChannel.onmessage = function (event) {
            console.log("Got Data Channel Message:", event.data);
        };

        dataChannel.onopen = function () {
            console.log("open event "+ dataChannel.readyState);
            console.log("dataChannel has opened");
        };

        dataChannel.onclose = function () {
            console.log("close event "+ this.dataChannel.readyState);
        };

        return dataChannel;
    }

    getChannelState() {
        if (typeof (this.dataChannel) == "undefined")
            this.createDataChannel();
        return this.dataChannel.readyState;
    }

    sendDataByChannel(data){
        console.log(typeof(this.dataChannel));
        if (typeof(this.dataChannel) == "undefined")
            this.createDataChannel();

        this.dataChannel.send(data);
    }
}