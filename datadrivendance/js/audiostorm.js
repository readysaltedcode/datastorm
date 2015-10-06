"use strict";
var datastorm = datastorm || {};

datastorm.audioStorm = (function(){
  var my = {};

  var config = {};

  var music = null;

  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var analyser;

  var animationActive = true;

  var dataArray, bufferLength, source;

  var ctx = datastorm.canvas.ctx;

  var width = document.body.clientWidth;
  var height = document.body.clientHeight;

  var waveXSpread = 0.1;
  var xScale = d3.scale.linear().domain([0, 255]).range([(0.5 - waveXSpread) * width, (0.5 + waveXSpread) * width]);
  var yScale = d3.scale.linear().domain([0, 512]).range([0, height]);

  var lightningWaveXSpread = 0.15;
  var lightningXScale = d3.scale.linear().domain([0, 255]).range([(0.5 - lightningWaveXSpread) * width, (0.5 + lightningWaveXSpread) * width]);
  var xRandomOffset = 1000;

  var yStep = 100;

  var frameTimer, decreaseTimeStepTimer, clearFrameTime, expandXTimer, increaseXRandomOffsetTimer, decreaseYStepTimer;
  var timeInterval = 1300;

  function clearFrame() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, width, height);
  }

  function getSumOfDeltas(data) {
    var sum = 0;
    for(var i = 1; i < bufferLength; i ++) {
      sum += Math.abs(dataArray[i] - dataArray[i-1]);
    }
    return sum;
  }

  function chanceOfLightning(sumOfDeltas) {
    if(sumOfDeltas < 600)
      return 0;
    return sumOfDeltas / 15000;
  }

  function doFrame() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.strokeStyle = '#689';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;

    var chance = chanceOfLightning(getSumOfDeltas(dataArray));

    if(Math.random() > chance) {
      // normal

      var xOffset = (Math.random() * xRandomOffset) - 0.5 * xRandomOffset;

      for(var i = 1; i < bufferLength; i += yStep) {
        var ii = i - yStep ;
        datastorm.canvas.drawLine(xScale(dataArray[ii]) + xOffset, yScale(ii), xScale(dataArray[i]) + xOffset, yScale(i));
      }
    } else {
      // ctx.strokeStyle = '#7DF9FF';
      ctx.globalAlpha = Math.random() * 0.5 + 0.5;
      var xOffset = 0.5 * (Math.random() * width - 0.5 * width);
      // ctx.lineWidth = 2;
      for(var i = 1; i < bufferLength; i += yStep) {
        var ii = i - yStep ;
        datastorm.canvas.drawLine(lightningXScale(dataArray[ii]) + xOffset, yScale(ii), lightningXScale(dataArray[i]) + xOffset, yScale(i));
      }
    }
  }

  function expandX() {
    if(waveXSpread > 0.3)
      return;

    waveXSpread += 0.1;
    xScale.range([(0.5 - waveXSpread) * width, (0.5 + waveXSpread) * width]);
  }

  function increaseXRandomOffset() {
    if(xRandomOffset < 1)
      return;

    xRandomOffset -= 50;
  }

  function decreaseYStep() {
    yStep -= 5;

    if(yStep < 1)
      yStep = 1;
  }

  function decreaseTimeStep() {
    if(timeInterval <= 100)
      return;

    clearInterval(frameTimer);

    timeInterval -= 200;
    if(timeInterval < 100)
      timeInterval = 100;

    frameTimer = setInterval(doFrame, timeInterval);
  }

  function ready(buffer) {
    music = buffer;

    source = context.createBufferSource();
    source.buffer = music;

    analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    source.connect(analyser);

    analyser.connect(context.destination);

    if(config.autoStart === true)
      my.start();
  }

  my.init = function(conf) {

    config = conf;
    var url = config.audioUrl;

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
      context.decodeAudioData(request.response, ready);
    }
    request.send();

  }

  my.start = function() {
    source.start(0);

    frameTimer = setInterval(doFrame, timeInterval);
    decreaseTimeStepTimer = setInterval(decreaseTimeStep, 20000);
    clearFrameTime = setInterval(clearFrame, 40);
    expandXTimer = setInterval(expandX, 30000);
    increaseXRandomOffsetTimer = setInterval(increaseXRandomOffset, 10000);
    decreaseYStepTimer = setInterval(decreaseYStep, 5000);    
  }

  my.stop = function() {
    animationActive = false;

    clearInterval(frameTimer);
    clearInterval(decreaseTimeStepTimer);
    clearInterval(clearFrameTime);
    clearInterval(expandXTimer);
    clearInterval(increaseXRandomOffsetTimer);
    clearInterval(decreaseYStepTimer);

    source.stop();
  }

  return my;
}());



datastorm.audioStorm.init({
  audioUrl: 'https://d28qoto45d39ov.cloudfront.net/datastorm/visualisations/audiostorm/sounds/allegretto.mp3',
  autoStart: true
});

