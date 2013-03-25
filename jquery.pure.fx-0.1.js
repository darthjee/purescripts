jQuery.prototype.toggleDown = function(elementToggle, duration, easing, callback)
{
  function prepareElement(ele)
  {
    var style = ele.attr('style');
    style = (style == null?"":style);
    ele.css('height',ele.height());
    ele.css('min-height',0);
    ele.recover = function()
    {
      var display = this.attr('display');
      this.attr('style',style);
      this.attr('display',display);
    };
    return ele;
  }
  elementToggle = jQuery(elementToggle);
  var display = this.css('display');
  var show;
  var hide;

  if (display == 'none')
  {
    display = elementToggle.attr('display');
    show = prepareElement(this);
    hide = prepareElement(elementToggle);
  }
  else
  {
    hide = prepareElement(this);
    show = prepareElement(elementToggle);
  }
  
  if (typeof easing == "function")
  {
    callback = easing;
    easing = 'linear';
  }
  
  var max_height = (show.height() > hide.height()?show.height():hide.height());
  var min_height = (show.height() < hide.height()?show.height():hide.height());
  var timeStart = duration*((show.height()-hide.height())*1.0/max_height);
  var timeEnd = 0;
  easing = easing-timeStart-timeEnd;
  if (timeStart < 0)
  {
    timeEnd = - timeStart;
    timeStart = 0;
  }

  show.height(max_height);  
  hide.animate({height:max_height},timeStart, function(){     
    var ended = false;
    function wrap(){
      if(ended)
      {
        show.animate({height:min_height},timeEnd, function(){
          show.recover();
          hide.recover();
          callback();
        });
      }
      else
        ended = true;
    }
    show.slideDown(duration, easing, wrap);
    hide.slideUp((duration), easing, wrap);
  });
  
};


jQuery.toggleDisplay = function(selector, duration, easing, callback)
{
  jQuery(selector).toggleDisplay(duration, easing, callback);
};

jQuery.prototype.toggleDisplay = function(duration, easing, callback)
{
  var count = this.length;
  if (typeof easing == "function")
  {
    callback = easing;
    easing = "linear";
  }
  this.each(function(){
    var obj = jQuery(this);
    if (obj.css('display') == 'none')
      obj.fadeIn(duration, easing, function(){
        if (count == 0)
          callback;
        else
          count--;
      });
    else
      obj.fadeOut(duration, easing, function(){
        if (count == 0)
          callback;
        else
          count--;
      });
  });
};
