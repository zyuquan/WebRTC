window.onload = async function() {
  var video = document.getElementById("video");
  window.navigator.mediaDevices.getDisplayMedia().then(stream => {
    video.srcObject = stream;
    video.play();
  }).catch(err => {
    console.warn('用户未同意录屏')
  });

  
}