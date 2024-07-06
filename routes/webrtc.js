var express = require('express');
var router = express.Router();

router.io = function(io) {
    io.on('connection', socket => {
        console.log('connection success ......')
        socket.emit('connection')
        socket.on('joinRoom', (ID) => {
            socket.join(ID);
        });
        socket.on('sendOffer', ({offer, ID}) => {
            io.to(ID).emit("sendOffer", offer);
        });
        socket.on('sendAnswer', ({answer, ID}) => {
            io.to(ID).emit("sendAnswer", answer);
        });
        socket.on('sendCandidate', ({candidate, ID}) => {
            io.to(ID).emit("sendCandidate", candidate);

        })
    })
}

router.get('/', function(req, res, next) {
    res.render('webrtc/video', { title: 'video' })
})
router.get('/video', function(req, res, next) {
    res.render('webrtc/video', { title: 'video' })
})
router.get('/share', function(req, res, next) {
    res.render('webrtc/share', { title: 'share' })
})
router.get('/chat', function(req, res, next) {
    res.render('webrtc/chat', { title: 'chat' })
})

module.exports = router;