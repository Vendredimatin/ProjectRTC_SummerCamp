var PeerManager = (function () {

    var localId,
        config = {
            peerConnectionConfig: {
                iceServers: [
                    {"url": "stun:23.21.150.121"},
                    {"url": "stun:stun.l.google.com:19302"}
                ]
            },
            peerConnectionConstraints: {
                optional: [
                    {"DtlsSrtpKeyAgreement": true}
                ]
            }
        },
        peerDatabase = {},
        localStream,
        remoteVideoContainer = document.getElementById('remoteVideosContainer'),
        socket = io();

    socket.on('message', handleMessage);
    socket.on('id', function(id) {
        localId = id;
    });


    function addPeer(remoteId) {
        var peer = new Peer(config.peerConnectionConfig, config.peerConnectionConstraints);
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
            console.log(event);
            console.log(event.stream);
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
        peerDatabase[remoteId] = peer;
        console.log("remoteID",remoteId);
        console.log("PeerDatabase");
        console.log(peerDatabase);

        return peer;
    }

    function answer(remoteId) {
        var pc = peerDatabase[remoteId].pc;
        pc.createAnswer(
            function(sessionDescription) {
                pc.setLocalDescription(sessionDescription);
                send('answer', remoteId, sessionDescription);
            },
            error
        );
    }
    function offer(remoteId) {
        var pc = peerDatabase[remoteId].pc;
        pc.createOffer(
            function(sessionDescription) {
                pc.setLocalDescription(sessionDescription);
                send('offer', remoteId, sessionDescription);
            },
            error
        );
    }
    function handleMessage(message) {
        var type = message.type,
            from = message.from,
            pc = (peerDatabase[from] || addPeer(from)).pc;

        console.log('received ' + type + ' from ' + from);

        switch (type) {
            case 'init':
                toggleLocalStream(pc);
                offer(from);
                break;
            case 'offer':
                pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
                answer(from);
                break;
            case 'answer':
                pc.setRemoteDescription(new RTCSessionDescription(message.payload), function(){}, error);
                break;
            case 'candidate':
                if(pc.remoteDescription) {
                    pc.addIceCandidate(new RTCIceCandidate({
                        sdpMLineIndex: message.payload.label,
                        sdpMid: message.payload.id,
                        candidate: message.payload.candidate
                    }), function(){}, error);
                }
                break;
        }
    }
    function send(type, to, payload) {
        console.log('sending ' + type + ' to ' + to);

        socket.emit('message', {
            to: to,
            type: type,
            payload: payload
        });
    }
    function toggleLocalStream(pc) {
        if(localStream) {
            (!!pc.getLocalStreams().length) ? pc.removeStream(localStream) : pc.addStream(localStream);
        }
    }
    function error(err){
        console.log(err);
    }

    var dataChannel;
    function createDataChannel(remoteId) {

        var dataChannelOptions = {
            ordered: false, //不保证到达顺序
            maxRetransmitTime: 3000, //最大重传时间
        };

        var peerConnection = peerDatabase[remoteId].pc;
        dataChannel =  peerConnection.createDataChannel(remoteId+".dataChannel", dataChannelOptions);

        dataChannel.onerror = function (error) {
            console.log("Data Channel Error:", error);
        };

        dataChannel.onmessage = function (event) {
            console.log("Got Data Channel Message:", event.data);
        };

        /**
         * dataChannel 一直connecting的解释说明
         * The underlying data transport has been established and data can be transferred bidirectionally across it.
         * This is the default state of a new RTCDataChannel created by the WebRTC layer when the remote peer created the channel and delivered to the site or app in a datachannel event of type RTCDataChannelEvent.
         */
        dataChannel.onopen = function () {
            console.log("open event "+ dataChannel.readyState);
            console.log("label:"+dataChannel.label);
            console.log("id:"+dataChannel.id);
        };

        dataChannel.onclose = function () {
            console.log("close event "+ dataChannel.readyState);
        };

        console.log("dataChannel 已建立");
    }

    function sendData(data) {
        if (dataChannel.readyState != "open"){
            console.log("dataChannel:" + dataChannel.readyState);
            return;
        }
        dataChannel.send(data);
        console.log("data已发送");
    }

    return {
        getId: function() {
            return localId;
        },

        setLocalStream: function(stream) {

            // if local cam has been stopped, remove it from all outgoing streams.
            if(!stream) {
                for(id in peerDatabase) {
                    pc = peerDatabase[id].pc;
                    if(!!pc.getLocalStreams().length) {
                        pc.removeStream(localStream);
                        offer(id);
                    }
                }
            }

            localStream = stream;
        },

        toggleLocalStream: function(remoteId) {
            peer = peerDatabase[remoteId] || addPeer(remoteId);
            toggleLocalStream(peer.pc);
        },

        peerInit: function(remoteId) {
            peer = peerDatabase[remoteId] || addPeer(remoteId);
            send('init', remoteId, null);
        },

        peerRenegociate: function(remoteId) {
            offer(remoteId);
        },

        send: function(type, payload) {
            socket.emit(type, payload);
        },

        createDataChannel: function (remoteId) {
            createDataChannel(remoteId);
        },

        sendDataByChannel: function (data) {
            sendData(data);
        }
    };

});

var Peer = function (pcConfig, pcConstraints) {
    this.pc = new RTCPeerConnection(pcConfig, pcConstraints);
    this.remoteVideoEl = document.createElement('video');
    this.remoteVideoEl.controls = true;
    this.remoteVideoEl.autoplay = true;
}