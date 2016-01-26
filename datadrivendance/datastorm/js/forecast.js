"use strict";
var datastorm = datastorm || {};

datastorm.forecast = (function(){
  var my = {};

  var width = document.body.clientWidth;
  var height = document.body.clientHeight;

  var config;

  var locations = [];

  var startTs; // start time of animation. Used to calculate elapsed time
  var elapsedTs;
  var durationTs = 240000; // full length of animation
  var animationActive = true;


  var sampleScale = d3.scale.linear().domain([0, durationTs]).range([0, 35]);
  var colour = d3.scale.linear().domain([0, 22]).range(['white', 'blue']).clamp(true);
  var radiusScale = d3.scale.linear().domain([0, 100]).range([1, 40]);
  var opacityScale = d3.scale.linear().domain([0, 100]).range([0, 1]);

  var drawProbability = d3.scale.linear().domain([0, 100]).range([0, 0.05]);


  var ctx = datastorm.canvas.ctx;

  var projection = d3.geo.orthographic()
    .scale(15000)
    .translate([1200, 12500])
    .clipAngle(90)
    .precision(.1);

  var doFrameTimer, updateProjectionTimer;


  function initialiseData(json) {
    locations = json;
  }

  function doFrame() {
    ctx.globalAlpha = 0.4;
    // ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, width, height);

    elapsedTs = Date.now() - startTs;
 
    render();
  }

  // function updateProjection() {
  //   projection.translate([xTranslateScale(elapsedTs), 7550]);
  // }

  function render() {
    // console.log('render');

    ctx.globalAlpha = 0.5;
    // ctx.shadowBlur = 200;

    var sampleIndex = Math.floor(sampleScale(elapsedTs));

    _.each(locations, function(l) {
  
      if(Math.random() > drawProbability(l.speed[sampleIndex]))
        return;

      ctx.globalAlpha = opacityScale(l.speed);

      ctx.fillStyle = colour(l.temp[sampleIndex]);

      // console.log(l);
      var pt = projection([l.lon, l.lat]);
      datastorm.canvas.drawCircle(pt[0], pt[1], radiusScale(l.speed[sampleIndex]));
    });
  }

  my.init = function(conf) {
    config = conf;

    d3.json('https://d28qoto45d39ov.cloudfront.net/datastorm/visualisations/forecast/data/forecast-old.json', function(err, json) {
      initialiseData(json);
      if(config.autoStart === true)
        my.start();
    });
  }

  my.start = function() {
    startTs = Date.now();
    doFrameTimer = setInterval(doFrame, 100);
    // updateProjectionTimer = setInterval(updateProjection, 200);
  }

  my.stop = function() {
    clearInterval(doFrameTimer);
    // clearInterval(updateProjectionTimer);
  }

  return my;
}());


datastorm.forecast.init({
  autoStart: true
});

