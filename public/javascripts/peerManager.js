var PeerManager_liu = (function () {

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
        peerMap = {},
        localStream,
        //remoteVideosContainer = document.getElementById('remoteVideosContainer'),
        socket = io();

    socket.on('message', handleMessage);
    socket.on('id', function(id) {
        localId = id;
    });

    function addPeer(remoteId) {
        var peer = new Peer_liu(config.peerConnectionConfig, config.peerConnectionConstraints, remoteId);
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
            //stream 来自rtc.loadData
            console.log("!!!!");
            attachMediaStream(peer.remoteVideoEl, event.stream);
            remoteVideosContainer.appendChild(peer.remoteVideoEl);
            console.log(remoteVideosContainer);
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

        peerMap[remoteId] = peer;
        console.log("remoteID",remoteId);
        console.log("peerMap");
        console.log(peerMap);

        return peer;
    }
    function answer(remoteId) {
        var pc = peerMap[remoteId].pc;
        pc.createAnswer(
            function(sessionDescription) {
                pc.setLocalDescription(sessionDescription);
                send('answer', remoteId, sessionDescription);
            },
            error
        );
    }
    function offer(remoteId) {
        var pc = peerMap[remoteId].pc;
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
            pc = (peerMap[from] || addPeer(from)).pc;

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

    function sendDataByChannel(data, remoteId) {
        let peer = peerMap[remoteId];
        if (peer.getChannelState() != "open"){
            console.log("dataChannel:" + peer.getChannelState());
            return;
        }

        peer.sendDataByChannel(data);
    }

    return {
        getId: function() {
            return localId;
        },

        setLocalStream: function(stream) {

            // if local cam has been stopped, remove it from all outgoing streams.
            if(!stream) {
                for(id in peerMap) {
                    pc = peerMap[id].pc;
                    if(!!pc.getLocalStreams().length) {
                        pc.removeStream(localStream);
                        offer(id);
                    }
                }
            }

            localStream = stream;
        },

        toggleLocalStream: function(remoteId) {
            peer = peerMap[remoteId] || addPeer(remoteId);
            toggleLocalStream(peer.pc);
        },

        peerInit: function(remoteId) {
            peer = peerMap[remoteId] || addPeer(remoteId);
            send('init', remoteId, null);
        },

        peerRenegociate: function(remoteId) {
            offer(remoteId);
        },

        send: function(type, payload) {
            socket.emit(type, payload);
        },

        sendData: function (data, remoteId) {
            sendDataByChannel(data, remoteId);
        },

        getGPS: function (remoteId) {
            return sendDataByChannel("GPS", remoteId);
        }
    };

});

