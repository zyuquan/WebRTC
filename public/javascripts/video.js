window.onload = function() {
    var ID = (new URL(window.location.href)).searchParams.get('roomID');
    
    var socket = io();
    
    socket.on('close', () => {
        console.log('connect close');
    });

    socket.on('error', (error) => {
        console.log('connect error:', error);
    });

    console.log(ID);
    if(!ID) { // 接收端
        console.log('------接收端-----');
        ID = Date.now().toString();
        var peer;
        console.log(window.location.href+'?roomID='+ID);
        socket.on('connection', () => {
            console.log('connection success');
            socket.emit('joinRoom', ID);
        });

        socket.on('sendOffer', async offer => {
            var stream = await mediaStream();
            peer = new RTCPeerConnection();
            
            peer.onicecandidate = (data) => {
                if(data.candidate) {
                    socket.emit('sendCandidate', { candidate: data.candidate, ID });
                };
            };
            // peer.onaddstream = function(e) {
            //     if(e.stream) {
            //         offerVideo.srcObject = e.stream;
            //         offerVideo.play().catch(function (err) {
            //             console.log('video play error', err);
            //         });
            //     }
            // };
             // peer.addStream(stream);

            peer.ontrack = track;
            for(let item of stream.getTracks()) {
                peer.addTrack(item, stream);
            }; 

            await peer.setRemoteDescription(offer);
            var answer = await peer.createAnswer();
            socket.emit('sendAnswer', {answer, ID});
            await peer.setLocalDescription(answer);
        });
        
        socket.on('sendCandidate', async function(candidate) {
            if(peer) {
                await peer.addIceCandidate(candidate);
            }
        });
        
    } else { // 发送端
        console.log('-----发送端-----');
        var peer;
        var candidateList = [];
        socket.on('connection', async () => {
            console.log('connection success');
            socket.emit('joinRoom', ID);

            peer = new RTCPeerConnection();
            var stream = await mediaStream();
            peer.onicecandidate = data => {
                if(data.candidate) {
                    socket.emit('sendCandidate', { candidate: data.candidate, ID });
                };
            };
            // peer.onaddstream = function(e) {
            //     if(e.stream) {
            //         offerVideo.srcObject = e.stream;
            //         offerVideo.play().catch(function (err) {
            //             console.log('video play error', err);
            //         });
            //     }
            // };
            // peer.addStream(stream);

            peer.ontrack = track;
            for(let item of stream.getTracks()) {
                peer.addTrack(item, stream);
            };
            
            var offer = await peer.createOffer({
                offerToReceiveAudio: 1,
                offerToReceiveVideo: 1
            });
            socket.emit('sendOffer', {offer, ID});
            await peer.setLocalDescription(offer);
        });

        socket.on('sendAnswer', async function(answer) {
            peer.setRemoteDescription(answer);
        });

        socket.on('sendCandidate', async function(candidate) {
            try {
                await peer.addIceCandidate(candidate); 
            } catch(err) {
                console.log(candidate)
                candidateList.push(candidate);
            };
        });
    };
};

async function mediaStream() {
    var answerVideo = document.getElementById('answer-video');
    var stream = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        media: true
    });
    answerVideo.srcObject = stream;
    answerVideo.play();
    return stream;
};
function track(e) {
    if(e.streams && e.streams[0]) { 
        // console.log(e.streams[0]);
        var container = document.getElementById('container');
        var video = document.createElement('video');
        container.appendChild(video);
        video.className = 'position-absolute';
        video.style.width = '300px';
        video.style.top = '10px';
        video.style.right = '10px';
        video.srcObject = e.streams[0];
        video.play().catch(err => {
            console.log('video error', err);
        });
    }
}