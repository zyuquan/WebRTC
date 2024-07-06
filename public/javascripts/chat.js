window.onload = function() {
    var container = document.getElementById('container');
    var input = document.getElementById('input');
    var btn = document.getElementById('button');
    var roomID = (new URL(window.location.href)).searchParams.get('id');
    var channel;
    var socket = io();

    socket.on('close', function() {
        console.log('socket 连接已关闭')
    })
    socket.on('error', function(error) {
        console.log('connect error:', error)
    });

    if(roomID) {
        var peer = new RTCPeerConnection();
        socket.on('connection', async function() {
            console.log('connection success');
            socket.emit('joinRoom', roomID);
            channel = peer.createDataChannel('myChannel');
            channel.onopen = open;
            channel.onclose = function() {
                console.log('channel 关闭');
            };
            channel.onmessage = function(msg) {
                message(msg.data, 'text-left', 'bg-info');
            };
            peer.onicecandidate = function(e) {
                if(e.candidate) {
                    socket.emit('sendCandidate', { candidate: e.candidate, ID: roomID });
                }
            }
            var offer = await peer.createOffer();
            socket.emit('sendOffer', { offer, ID: roomID });
            await peer.setLocalDescription(offer);
        });
        socket.on('sendAnswer', async function(answer) {
            await peer.setRemoteDescription(answer);
        });
        socket.on('sendCandidate', async function(candidate) {
            
        });
    } else {
        roomID = Date.now().toString();
        console.log(window.location+'?id='+roomID);
        socket.on('connection', async function() {
            console.log('connection success');
            socket.emit('joinRoom', roomID);
            
        });
        
        var peer = new RTCPeerConnection();
        peer.ondatachannel = function(e) {
            if(e.channel) {
                channel = e.channel;
                channel.onopen = open;
                channel.onclose = function() {
                    console.log('channel 关闭');
                };
                channel.onmessage = function(msg) {
                    message(msg.data, 'text-left', 'bg-info');
                }
            }
        };
        peer.onicecandidate = function(e) {
            if(e.candidate) {
                socket.emit('sendCandidate', { candidate: e.candidate, ID: roomID });
            }
        };
        socket.on('sendOffer', async function(offer) {
            await peer.setRemoteDescription(offer);
            var answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.emit('sendAnswer', { answer, ID: roomID });
        });
        socket.on('sendCandidate', async function(candidate) {
            await peer.addIceCandidate(candidate);
        });
    }

    function open() {
        console.log('channel 连接成功！');
        var div = document.createElement('div');
        div.className = 'text-center';
        div.style.color = 'var(--gray-500)';
        div.style.fontSize = '12px';
        div.style.lineHeight = '30px';
        div.innerHTML = '连接成功，发个信息试试';
        container.appendChild(div);
        btn.removeAttribute('disabled');
    };
    function message(msg, coord, bg) {
        var div = document.createElement('div');
        div.style.color = 'var(--light)';
        div.className = coord + ' py-2 my-2';
        container.appendChild(div);

        var span = document.createElement('span');
        span.className = bg +' rounded p-2 d-inline-block';
        span.innerHTML = msg;
        div.appendChild(span);
    };
    btn.onclick = function() {
        var msg = input.value;
        if(msg) {
            message(msg, 'text-right', 'bg-primary');
            channel.send(msg);
            input.value = '';
        }
    };
    input.onkeyup = function(e) {
        console.log(e)
        if(e.keyCode === 13) {
            var msg = input.value;
            if(msg) {
                message(msg, 'text-right', 'bg-primary');
                channel.send(msg);
                input.value = '';
            } 
        }
    }
}