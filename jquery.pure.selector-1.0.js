jQuery.prototype.createSelector = function(list, config)
{
  var selfObj = this;
  var listObj = jQuery();
  config = getDefaultValue(config,{});
  
  
  for (var i = 0; i < list.length; i++)
    listObj = listObj.add(list[i]);

  var getFunc = getDefaultValue(config.getFunc,function(ind, listHandler){
    return listHandler.get(ind);
  });
  
  var changeFunc = getDefaultValue(config.changeFunc, function(listQuery, selector){
    listQuery.css('display','none').find('input').attr('disabled','disabled');
    jQuery(listQuery.get(selector.selectedIndex)).css('display','').find('input').removeAttr('disabled');
  });
  
  this.bind("change", function(evt){
    changeFunc(listObj,this);
  });
  
  this.change();
};