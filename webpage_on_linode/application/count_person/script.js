const PERIOD = 10

function access_camera(){
  var video = document.getElementById("input");

  if (navigator.mediaDevices.getUserMedia) {
    console.log("Accessing camera...");
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;

        // Wait for metadata to be loaded
        video.addEventListener( "loadedmetadata", function (e) {
          console.log("Camera access OK");

          // Needed for posenet to work
          this.width = this.videoWidth
          this.height = this.videoHeight

          resize_canvas();

          load_model();

        }, false );



      })
      .catch(function (error) {
        console.log("Camera access ERROR");
      });
  }
}

function load_model(){

  console.log("Loading model...");

  cocoSsd.load()
    .then(model => {
      console.log("Model loaded");
      detect_objects(model);
    });
}

function detect_objects(model){

  const input = document.getElementById('input');

  model.detect(input)
    .then(predictions => {

      const input = document.getElementById("input");
      const output = document.getElementById("output");
      const ctx = output.getContext("2d");

      // Draw camera feed
      ctx.drawImage(input, 0, 0, output.width, output.height);

      predictions.forEach(draw_prediction);

      ctx.font = "50px Verdana";
      ctx.fillStyle = "cyan";
      ctx.fillText(String(predictions.length) + "人", 50, 100);


      // run again
      setTimeout(function(){ detect_objects(model) }, PERIOD);
    });
}

function draw_prediction(prediction){

  if(prediction.class === "person"){
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const ctx = output.getContext("2d");

    var scale = {
      x: output.width / input.videoWidth,
      y: output.height / input.videoHeight
    };


    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(
      prediction.bbox[0] * scale.x,
      prediction.bbox[1] * scale.y,
      prediction.bbox[2] * scale.x,
      prediction.bbox[3] * scale.y);
    ctx.stroke();

  }

}

function resize_canvas(){
  const input = document.getElementById("input");
  const output = document.getElementById("output");

  var video_aspect_ratio = input.videoWidth / input.videoHeight;

  //output.width = input.videoWidth;
  //output.height = input.videoHeight;

  output.width = output.parentNode.offsetWidth;
  output.height = output.parentNode.offsetHeight;

}

window.onresize = function(event) {
  resize_canvas();
};

function start(){
  access_camera();
}

// Run
start();
