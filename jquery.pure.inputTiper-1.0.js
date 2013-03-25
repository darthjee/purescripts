/**
 * @brief
 * @param config : configuration object
 */
jQuery.prototype.tipDivCreator = function(config)
{
  var selfObj = this;
  config = config ? config : {};
  var format = getDefaultValue(config.format, 'inner');
  var classe = getDefaultValue(config.classe, null);
  var style = getDefaultValue(config.style, 'position:absolute');
  var setPos = getDefaultValue(config.setPos,true);
  var hideCounter = getDefaultValue(config.hideCounter,10);
  var changeCounter = getDefaultValue(config.changeCounter,1);
  var fadeDuration = getDefaultValue(config.fadeDuration,1000);
  var interval = getDefaultValue(config.interval,500);
  var id = config.id;


  var html;
  /* the object/html can be or not wrapped by a div */
  switch (format)
  {
    case 'outter':
      html = config.html ? config.html : "<div></div>";
      break;
    case 'inner':
      html = "<div>"+config.html+"</div>";
      break;
  }

  var div = jQuery(html);
  if (id)
    div.attr('id',id);
  if (classe)
    div.addClass(classe);
  if (style)
    div.attr('style', style);

  if (setPos)
  {
    var oldPos = div.css('position');
    div.insertBefore(this);
    var oldDisplay = div.css('display');
    div.css('display', 'block');
    div.top("+="+(Number(this.getBlockHeight())+5));
    div.css('display', oldDisplay);
    div.css('position','absolute');
    div.css('position',oldPos);
  }
  
  /* set the events of the input */
  (function setEvtsInput(){
    var evts = getDefaultValue(config.evts, {click:function(){}});
    evts.click = evts.click ? evts.click : evts.focus ? evts.focus : evts.change;
    if (!evts.focus) evts.focus = evts.click;
    if (!evts.change) evts.change = evts.click;
  
    hideCounter = new evtCounter(hideCounter, function(){
      div.fadeOut(fadeDuration);
    }, interval);
    changeCounter = new evtCounter(changeCounter, function(){
      evts.change();
      hideCounter.start();
    }, interval);


    selfObj.bind("click focus change keyup",function(evtType){
      jQuery('.tip-div').not(div).fadeOut(fadeDuration);
      div.fadeIn(fadeDuration, function(){
        hideCounter.start();
        switch(evtType.type)
        {
          case 'click' :evts.click();
            break;
          case 'focus' :evts.focus();
            break;
          case 'keyup' :if (evtType.keyCode != 27)
              changeCounter.start();
            else
            {
              hideCounter.call();
              changeCounter.clear();
            }
            break;
          case 'change' :changeCounter.call();
            break;
        }
      });
    });
  })();
  
  /* set the evens in the div */
  (function setEvtsDiv(){
    div.bind("mouseover focus", function(){
      hideCounter.clear();
    });
    div.bind("mouseout unfocus", function(){
      hideCounter.start();
    });
  })();
  
  return {
    call:changeCounter.call,
    hide:hideCounter.call
  };
};



/**
 * @brief creates a event watcher that throws events on countdown
 * @param counter
 * @param f
 * @param interval
 * @returns
 */
function evtCounter(counter, f, interval)
{
  var selfObj = this;
  f = getDefaultValue(f,function(){});
  interval = getDefaultValue(interval, 1000);
  var i = 0;
  var watcher = null;
  this.tick = function (incr){
    incr = (Number(incr) > 0) ? incr : 1;
    i += incr;
    if (i >= counter)
    {
      selfObj.clear();
      f();
    }
  };
  this.clear = function(){
    i = -1;
    if (watcher)
    {
      clearInterval(watcher);
      watcher = null;
    }
  };
  this.start = function(){
    selfObj.clear();
    watcher = window.setInterval(selfObj.tick, interval);
  };
  this.call = function(){
    selfObj.clear();
    f();
  };
};


/**
 * @breif creation off the function that links two lists
 */
jQuery.prototype.createListDouble = function(list, config)
{
  list = jQuery(list);
  var selfObj = this;
  config = getDefaultValue(config, {});
  var thisItem = getDefaultValue(config.thisItem, 'li');
  var listItem = getDefaultValue(config.listItem, 'li');
  var removeTrg = getDefaultValue(config.removeTrg, '.remove');
  var callBack = getDefaultValue(config.callBack, function(){});


  config.insertBind = getDefaultValue(config.insertBind, function(ele){
    list.append(ele);
    callBack();
  });
  config.removeBind = getDefaultValue(config.removeBind, function(ele){
    jQuery(ele).remove();
    callBack();
  });
  config.returnBind = getDefaultValue(config.returnBind, function(ele){
    selfObj.append(ele);
  });


  var checkInsert = getDefaultValue(config.checkInsert, function(ele){return true;});
  this.find(thisItem).live("click",function(){
    if (checkInsert(this,list))
      config.insertBind(this);
  });
  list.find(listItem+' '+removeTrg).live("click",function(){
    var li = jQuery(this).findParent(listItem);
    config.removeBind(li.get());
  });
};



/**
 * @brief creates a double between a list and an input 
 */
jQuery.prototype.createInputAdder = function(list, config)
{
  config = getDefaultValue(config,{});
  list = jQuery(list);
  var model = jQuery(getDefaultValue(config.model,'<ul><li></li></ul)')).html();
  var method = getDefaultValue(config.method,'fill-html');
  var btn = jQuery(config.btn);
  var selfObj = this;
  var callBack = getDefaultValue(config.callBack, function(){});
  
  var inputEvtAnalyser = getDefaultValue(config.inputEvtAnalyser, function(evt){
    if (evt.keyCode != 13)
      return false;
    return true;
  });

  var eleCreator = (function getCreateMethod(){
    if (config.eleCreator)
      return config.eleCreator;
    else
    {
      var create;
      switch(method)
      {
        case 'fill-html' :
          create = function(html)
          {
            return jQuery(model).html(html);
          };
          break;
        case 'fill-text' :
          create = function(text)
          {
            return jQuery(model).text(text);
          };
          break;
        case 'replace-list-obj' :
          create = function(list)
          {
            var html = model;
            for (var i = 0; i < list.length; i++)
            {
              var key = ""+list[i].key;
              var val = ""+list[i].value;
              html = html.replaceAll(key, val);
            }
            return jQuery(html);
          };
          break;
        default :
          create = function(){
            return jQuery(model);
          };
      }
      return create;
    }
  })();

  
  var createObjFiller = (function getCreateObjFiller(){
    if (config.createObjFiller)
      return config.createObjFiller;
    else
    {
      var f;
      switch(method)
      {
        case 'fill-html' :
        case 'fill-text' :
          f = function(){
            return selfObj.val();
          };
          break;
        case 'replace-list-obj' :
          var defFillObj = getDefaultValue(config.defFillObj, [{key:'#TEXT#',value:null}]);
          f = function (){
            defFillObj[0].value = selfObj.val();
            return defFillObj;
          };
          break;
      }
      return f;
    }
  })();
  
  var append = function()
  {
    if (selfObj.val() != '')
    {
      var obj = createObjFiller();
      var newEle = eleCreator(obj);
      list.append(newEle);
      callBack();
    }
  }
  
  this.bind("keypress", function(evt){
    if (inputEvtAnalyser(evt))
    {
      append();
    }
  });

  btn.bind("click", function(evt){
    evt.preventDefault();
    append();
  });
};



jQuery.prototype.createInputsSelector = function(field, config)
{
  field = jQuery(field);
  var textSelector = getDefaultValue(config.textSelector, ".text");
  var pairs = getDefaultValue(config.pairs, []);
  var thisItem = getDefaultValue(config.thisItem, 'li');

  config.selectBind = getDefaultValue(config.insertBind, function(ele){
    ele = jQuery(ele);
    var text = ele.find(textSelector).text();
    field.val(text);
    for (var i = 0; i < pairs.length; i++)
    {
      var fi = jQuery(pairs[i].fieldFinder);
      var val = ele.find(pairs[i].valFinder).text();
      fi.val(val);
    }
  });

  config.modifyBind = getDefaultValue(config.modifyBind, function(){
    for (var i = 0; i < pairs.length; i++)
      jQuery(pairs[i].fieldFinder).val("");
  });

  this.find(thisItem).live("click",function(){
    config.selectBind(this);
  });
  field.bind("keypress", function(evt)
  {
    if (evt.charCode != 0 || evt.keyCode == 8)
    {
      config.modifyBind(this);
    }
  });

}


jQuery.prototype.createSelectSetter = function(config)
{
  config = getDefaultValue(config,{});
  var modelType = getDefaultValue(config.modelType,"code");
  var model = modelType == "query" ? jQuery(config.model) : jQuery(getDefaultValue(config.model,"<input />"));
  var strategy = getDefaultValue(config.strategy,"reuse");
  var selfObj = this;
  var triggerObjs = jQuery(getDefaultValue(config.triggerObjs,this));
  var triggerEvt = getDefaultValue(config.triggerEvt, "dblclick");
  var counter = getDefaultValue(config.counter,7);
  var interval = getDefaultValue(config.interval,1000);
  var genEle = (strategy != "clone") ? function(){return model} : function(){
    var out = model.clone();
    out.bind("click keypress", function(){hideEvt.clear();});
    return out;
  } ;

  var edtStatus = false;
  var ele = genEle();
  ele.bind("click keypress", function(){hideEvt.clear();});


  var hideEvt = new evtCounter(counter, function(){
      selfObj.insertBefore(ele);
      ele.remove();
      hideEvt.clear();
      if (ele.val() != "")
      {
        var opt = jQuery('<option />');
        opt.text(ele.val());
        opt.val(ele.val());
        selfObj.append(opt);
        selfObj.val(ele.val());
      }
      opt.focus();
      ele.unbind("keypress", eleBinder);
      ele = genEle();
  }, interval);

  triggerObjs.bind(triggerEvt,function(){
    if ((edtStatus = !edtStatus) == true)
    {
      ele.insertBefore(selfObj);
      selfObj.remove();
      hideEvt.start();
      bindEle();
    }
    else
      hideEvt.call();
  });

  eleBinder = getDefaultValue(config.eleBinder,function(evt){
      if (evt.keyCode == 27 || evt.keyCode == 13)
      {
        evt.preventDefault();
        hideEvt.call();
      }
    });
  bindEle = function(){
    ele.bind("keypress", eleBinder);
  }
  

}
