var datastorm = datastorm || {};

datastorm.rain = (function(){
  var my = {};

  var wrapper = d3.select('#wrapper');
  var width = wrapper.node().clientWidth;
  var height = wrapper.node().clientHeight;
  
  //var width = document.body.clientWidth;
  //var height = document.body.clientHeight;

  // var width = 1200, height = 800;

  var raindrops = [];
  var minMonthlyRainfall, maxMonthlyRainfall;
  var startTs; // start time of animation. Used to calculate elapsed time
  var previousTs;
  var tsStep; // time since the previous frame
  var durationTs = 400000; // full length of animation
  var animationActive = false;
  var doLabels = false;

  var nextActiveRaindropIndex = 0;

  var makeRaindropActiveInterval;

  // map radius to opacity
  var opacityScale = d3.scale.linear().domain([200, 0]).range([1, 0]).clamp(true);
  // var startTime = Date.now();

  var colour = d3.scale.linear().domain([-1, 5, 16, 22]).range(['lightblue', 'white', 'orange', 'red']).clamp(true);

  // map the rainfall amount to how quickly the opacity reduces
  var circleOpacityDampingScale = d3.scale.linear();

  // map the rainfall amount to how quickly the radius reduces
  var circleStartOpacityScale = d3.scale.linear();

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var ctx = datastorm.canvas.ctx;


  function initialiseData(rainJson, tempJson) {
    // Create array of raindrops
    _.each(rainJson, function(year) {
      // console.log(year);
      _.each(year.rainfall, function(rainfall, i) {
        if(rainfall === -1)
          return;

        raindrops.push({
          rainfall: rainfall,
          radius: 1,
          active: false,
          labelDone: false,
          // opacity: 1,
          x: Math.random() * width,
          y: Math.random() * height,
          date: months[i] + ' ' + year.year
        });

      });
    });


    // Create array of temperature
    var temps = [];
    _.each(tempJson, function(year) {
      _.each(year.temp, function(t) {
        temps.push(t);
      });
    });

    // Merge in temperature
    _.each(raindrops, function(raindrop, i) {
      raindrop.temp = temps[i];
      raindrop.colour = colour(raindrop.temp);
    });

    minMonthlyRainfall = _.min(raindrops, function(d) {return d.rainfall;}).rainfall;
    maxMonthlyRainfall = _.max(raindrops, function(d) {return d.rainfall;}).rainfall;

    circleOpacityDampingScale.domain([minMonthlyRainfall, maxMonthlyRainfall]).range([1000, 8000]);
    circleStartOpacityScale.domain([minMonthlyRainfall, maxMonthlyRainfall]).range([0.3, 1]);

    _.each(raindrops, function(raindrop) {
      raindrop.opacityDamping = 6000; //circleOpacityDampingScale(raindrop.rainfall);

      raindrop.opacity = circleStartOpacityScale(raindrop.rainfall);
    });

    // console.log(raindrops);
  }


  function makeRaindropActive() {
    if(nextActiveRaindropIndex >= raindrops.length)
      return;

    raindrops[nextActiveRaindropIndex].active = true;
    nextActiveRaindropIndex += 1;
  }

  function doFrame() {
    tsStep = Date.now() - previousTs;
    previousTs = Date.now();

    updateRaindropAttributes();

    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, height);

    render();

    var elapsedTs = Date.now() - startTs;
    if(elapsedTs > durationTs)
      animationActive = false;

    if(animationActive)
      window.requestAnimationFrame(doFrame);
  }

  function updateRaindropAttributes() {
    _.each(raindrops, function(rd) {
      if(!rd.active)
        return;

      // Update radius
      rd.radius += tsStep / 20;  

      // Reduce opacity
      rd.opacity -= tsStep / rd.opacityDamping;
      if(rd.opacity < 0) {
        rd.opacity = 0;
        rd.active = false;
      }
    });
  }

  function render() {
    // console.log('render');
    ctx.fillStyle = 'none';
    ctx.lineWidth = 4;


    _.each(raindrops, function(rd) {
      if(!rd.active)
        return;

      opacityScale.range([rd.opacity, 0]);

      for(var r = rd.radius; r > 5; r -= 25) {
        ctx.strokeStyle = rd.colour;
        ctx.globalAlpha = opacityScale(r);
        datastorm.canvas.drawCircleOutline(rd.x, rd.y, r);
      }

      if(doLabels && rd.labelDone === false) {
        // console.log('label', rd.x, rd.y)
        ctx.fillStyle = rd.colour;
        ctx.font = "14px sans-serif";
        ctx.globalAlpha = rd.opacity - 0.2;
        ctx.fillText(rd.date, rd.x - 30, rd.y + 5);
        // rd.labelDone = true;
        ctx.fillStyle = 'none';
      }
    });


  }

  my.init = function() {
    d3.json('https://d28qoto45d39ov.cloudfront.net/datastorm/visualisations/rain/data/rainfall.json', function(err, rainJson) {
      d3.json('https://d28qoto45d39ov.cloudfront.net/datastorm/visualisations/rain/data/maxtemp.json', function(err, tempJson) {
        initialiseData(rainJson, tempJson);
      });
    });
  };

  my.start = function() {
    animationActive = true;
    startTs = Date.now();

    makeRaindropActiveInterval = setInterval(makeRaindropActive, 500);
    window.requestAnimationFrame(doFrame);
  };

  my.stop = function() {
    animationActive = false;
    clearInterval(makeRaindropActiveInterval);
  }

  return my;
}());

datastorm.rain.init();
datastorm.rain.start();
