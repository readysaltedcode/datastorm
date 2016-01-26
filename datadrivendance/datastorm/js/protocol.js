// This is just for testing new data after capture

"use strict";
var datastorm = datastorm || {};

datastorm.protocol1 = (function(){
  var my = {};

  var width = document.body.clientWidth;
  var height = document.body.clientHeight;

  var color = d3.scale.category20();
  var xScale = d3.scale.linear().domain([-1.5, 2]).range([width, 0]);
  var yScale = d3.scale.linear().domain([-1.5, 1.5]).range([height, 0]);

  var ctx = datastorm.canvas.ctx;
  var frameData;
  var currentFrame, currentFrameNum = 0;
  var startTs;
  var intervalTimer;

  function render() {

    if(!currentFrame) return;

    var triangles0 = datastorm.util.getTrianglesOfSkeleton(currentFrame, 0);
    var triangles1 = datastorm.util.getTrianglesOfSkeleton(currentFrame, 1);

    var triangles = triangles0.concat(triangles1);

    ctx.fillStyle = "rgba(0, 0, 0, .1)";
    ctx.fillRect(0, 0, width, height);

    _.each(triangles, function(triangle, index) {
      ctx.fillStyle = "rgba(200, 255, 255, 0.3)";
      // ctx.fillStyle = 'lightblue';
      ctx.beginPath();
      _.each(triangle, function(vertex) {
        var x = xScale(vertex.X);
        var y = yScale(vertex.Y);
        ctx.lineTo(x, y);
      });
      ctx.fill();
    });

    // Draw head(s)
    _.each(currentFrame.Skeletons, function(sk) {
      _.each(sk.Joints, function(j) {
        if(j.JointType !== 'Head')
          return;

        // ctx.fillStyle = color(15);
        var x = xScale(j.Position.X);
        var y = yScale(j.Position.Y);
        datastorm.canvas.drawCircle(x, y, 18);
      });
    });

  }

  function doFrame() {
    getFrame();
    render();
    // console.log(currentFrame);
  }


  function getFrame() {
    var numFrames = frameData.length;
    my.ts = Date.now() - startTs;

    for(var i = currentFrameNum + 1; i < numFrames; i++) {
      if(frameData[i].TimeStamp > my.ts) {
        currentFrame =  frameData[i-1];
        currentFrameNum = i-1;
        return;
      }
    }

    // End of data: do nothing
    return;
  }


  // API
  // my.render = render;
  my.init = function() {
    d3.json('https://d28qoto45d39ov.cloudfront.net/datastorm/visualisations/protocol1/data/protocol.json?v4', function(err, json) {
      frameData = json;
      console.log(frameData);
    });
  }

  my.start = function() {
    startTs = Date.now();

    intervalTimer = setInterval(doFrame, 100);
  }

  my.stop = function() {
    clearInterval(intervalTimer);
  }

  return my;

}());

datastorm.protocol1.init();
datastorm.protocol1.start();
