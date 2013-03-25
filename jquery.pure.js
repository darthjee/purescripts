/**
 * @file jquery.pure.js
 * @author Fernando "DarthJee" Vicente Favini
 * 
 * This is the collection of scripts used by the Pure system
 *
 * The Pure and its components is released under the Creative Commons Licence By-Sa by its author
 * http://creativecommons.org/licenses/by-sa/3.0/
 *
 * By this you are free to:
 * -Use
 * -Copy/Redistribute
 * -Modify under the conditions:
 *  -You must attribute the author the original work
 *  -You may share the resulting work under the same license
 *
 * @brief Contem prototipos extras para jquery
 * @todo
 */


/**
 * @brief faz uma busca do primeiro parent que bate com a selecao
 * @param sel : seletor de busca
 */
jQuery.prototype.findParent = function (sel)
{
  var ret = this.parent();
  while (ret.length > 0 && !ret.is(sel))
  {
    ret = ret.parent();
  }
  return ret;
};



/**
 * @brief Valida um formulario
 * @param reqClass
 * @return
 */
jQuery.prototype.validateForm = function (reqClass, alertClass, failCallback)
{
  var form = this;
  if (typeof failCallback == 'undefined')
    failCallback = function (){};
  
  var labels = form.find('label.'+reqClass);
  
  /* flag de retorno (bom ou mal) */
  var ret = true;
  
  labels.each(function (){
    var label = jQuery(this);
    var name = label.attr("for");
    if (checkInput(form, name))
    {
      label.removeClass(alertClass);
      jQuery('[name="'+name+'"]').removeClass(alertClass);
    }
    else
    {
      label.addClass(alertClass);
      jQuery('[name="'+name+'"]').addClass(alertClass);
      ret = false;
    }
  });


  return ret;
};

/**
 * @brief retorna a altura de uma janela 
 */
jQuery.prototype.windowHeight = function()
{
  if(window.innerHeight)
    return window.innerHeight;
  else if(document.documentElement.clientHeight && document.documentElement.clientHeight > 0)
    return document.documentElement.clientHeight;
  return document.body.clientHeight;
};

/**
 * @brief retorna a largura de uma janela 
 */
jQuery.prototype.windowWidth = function()
{
  if(window.innerWidth)
    return window.innerWidth;
  else if(document.documentElement.clientWidth && document.documentElement.clientWidth > 0)
    return document.documentElement.clientWidth;
  return document.body.clientWidth;
};

/**
 * @brief retorna o quanto de scroll vertical
 * foi utilizado (altura da visualizacao) 
 */
jQuery.prototype.scrollTop = function()
{
  if(document.documentElement.scrollTop!==0)
    return document.documentElement.scrollTop;
  else if(document.body.scrollTop!==0)
    return document.body.scrollTop;
  return 0;
};

/**
 * @brief retorna o quanto de scroll horizontal
 * foi utilizado (distancia da visualizacao) 
 */
jQuery.prototype.scrollLeft = function()
{
  if(document.documentElement.scrollLeft!==0)
    return document.documentElement.scrollLeft;
  else if(document.body.scrollLeft!==0)
    return document.body.scrollLeft;
  return 0;
};


/**
 * @brief posiciona o elemento
 */
jQuery.prototype.setPosition = function(top, left)
{
  this.css('position','absolute');
  this.css('top', top);
  this.css('left', left);
};


/**
 * @brief centraliza o elemento
 */
jQuery.prototype.center = function()
{
  height = this.css('height');
  if (height !== null)
    height = height.split("px")[0];
  else
    height = this.attr('height').split("px")[0];
  
  width = this.css('width');
  if (width !== null)
    width = width.split("px")[0];
  else
    width = this.attr('width').split("px")[0];
  
  top = (this.windowHeight()-height)/2;
  top += this.scrollTop();
  left = (this.windowWidth()-width)/2;
  left += this.scrollLeft();
  this.setPosition(top, left);
};



/**
 * @brief alteracao do objeto jQuery para que haja funcao open para o overlay
 */
jQuery.prototype.overlayOpen = function()
{
  this.show();
  this.center();
};

/**
 * @brief alteracao do objeto jQuery para que haja funcao close para o overlay
 */
jQuery.prototype.overlayClose = function()
{
  this.hide("500");
};



jQuery.prototype.getBlockHeight = function(){
  var height = this.height();
  height += Number(this.css('margin-top').replace(/px/,""));
  height += Number(this.css('margin-bottom').replace(/px/,""));
  height += Number(this.css('padding-top').replace(/px/,""));
  height += Number(this.css('padding-bottom').replace(/px/,""));
  return height;
};


jQuery.prototype.top = function(change)
{
  if (change)
  {
    if (typeof change != 'number')
    {
      if (change.match('[+-]='))
        change = Number(this.top().replace(/px/,""))+(change.match(/[+]/) ? 1 : -1)*Number(change.replace(/[+-]=(\d*).*/,"$1"));
    }
    
    this.css('top', change);
  }
  return this.css('top');
};


/*******************************
 * funcoes de apoio
 */


/**
 * @brief valida um formulario
 */
function checkInput(form, name)
{
 var input = form.find('input[name='+name+'],select[name='+name+']');
 var ret = false;

 if (input.is('input'))
   switch(input.attr('type'))
   {
     case 'file' :
     case 'text' :
       if (input.val())
         ret = true;
       if (input.hasClass("email"))
         ret = validateEmail(input.val());
       break;
     case 'checkbox' :
     case 'radio' :
       if (input.is(':checked'))
         ret = true;
       break;
     case 'password' :
       var value = input.val();
       ret = true;
       if (!value)
         ret = false;
       else if (input.hasClass("double"))
       {
         var form = input.findParent("form");
         var n = form.find("input.double[type='password']").length;
         if (n > 1)
         {
           var i;
           for (i = 0; i < n; i++)
             if (form.find("input.double[type='password']:eq("+i+")").val() != value)
               ret = false;
         }
       }
   }
 else if (input.is('select'))
 {
   if (input.val())
     ret = true;
 }
 
 return ret;
}


/**
 * @brief checa se um e-mail eh valido
 * @param email
 * @return
 */
function validateEmail(email)
{
  var login = '[_%A-z0-9]+[+%]?([._-][A-z0-9]+[+%]?)?';
  var server = '[A-z0-9]+([._-][A-z0-9]+)?([.][A-z0-9]{1,4})+';
  var reg = new RegExp('^'+login+'@'+server+'$');
  
  return reg.test(email);
}



/**
 * @brief
 * @param source
 * @param replace
 * @return
 */
RegExp.prototype.replace = function(source, replace, ind)
{
  ind = ind !== null ? ind : 0;
  if (this.test(source)) do
    source = source.replace(this.exec(source)[ind], replace);
  while (this.global && this.test(source));
  return source;
};



/**
 * @brief indexed and ordered list by key
 *
 * Every Item in the list is kept by a key and these keys are ordered
 */
function indexedList(def)
{
  var keys = [];
  var obj = {};
  this.length = 0;
  this.add = function(key, val)
  {
    if (keys.find(key) < 0)
      keys.push(key);
    obj[key] = val;
    this.length = keys.length;
  };

  this.getKeys = function()
  {
    var out = keys;
    return out;
  };

  this.get = function(key)
  {
    return obj[key];
  };
  
  this.hasKey = function(key)
  {
    return this.get(key) != null;
  };
  
  this.getByInd = function(ind)
  {
    return this.get(keys[ind]);
  };
  
  this.toArray = function(){
    var ret = [];
    for (var i = 0; i < keys.length; i++)
      ret.push({key:keys[i], value:obj[keys[i]]});
    return ret;
  };
  
  if (def)
  {
    switch(def.constructor)
    {
      case indexedList:
        def = def.toArray();
      case Array:
        for (var i = 0; i < def.length; i++)
        {
          keys.push(def[i].key);
          obj[def[i].key] = def[i].value;
        }
        break;
      case Object:
        for (var key in def)
        {
          keys.push(key);
          obj[key] = def[key];
        }
        break;
    }
  }
}




/**
 * @brief 
 * @param url
 * @param pairs
 * @return
 */
function setGetURL(url,pairs)
{
  if(typeof pairs == "string")
    pairs=pairs.split('&');
  if (pairs.constructor == Array)
  {
    var obj = {};
    for (var i = 0; i < pairs.length; i++)
    {
      spl = pairs.match(/=/) ? pairs.split('=') : pairs.split(':');
      obj[spl[0]]=spl[1];
    }
    pairs = obj;
  }
  if (url.match(/\?/))
  {
    url = url.replace(/\?/,"?&");
    for (var prop in pairs)
    {
      url = url.replaceAll("((&"+prop+")(=[^&]*)?)","");
    }
  }
  else
    url += "?&";

  var arr = [];
  for (var prop in pairs)
  {
    if (pairs[prop] !== null)
      arr.push(prop+'='+pairs[prop]);
    else
      arr.push(prop);
  }
  url += '&'+arr.join('&');
  url = url.replace(/\?&+/,"?");
  
  return url;
}

Array.prototype.merge = function(){
	for (var i = 0; i < arguments.length; i++)
	{
		this.push.apply(this,arguments[i]);
	}
};
