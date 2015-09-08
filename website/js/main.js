var navigateAnimations = function(display, animation) {
  if(display) {
    $('#animation-container-' + animation).show();
    $('#code-container-' + animation).show();
    $('.data-vis-subnav-' + animation).attr('id', 'active-data-vis-button');
  } else {
    $('#animation-container-' + animation).hide();
    $('#code-container-' + animation).hide();
    $('.data-vis-subnav-' + animation).removeAttr('id');
  }
};

var loadAnimation = function(animation) {
  var count = 0;
  for(var i=1; i <= 6; i++) {
    if(animation == count) {
      navigateAnimations(true, i-1);
    } else {
      navigateAnimations(false, i-1);
    }
    count++;
  }
};
