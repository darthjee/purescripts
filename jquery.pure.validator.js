/**
 * @file jquery.pure.validator.js
 * @author Fernando "DarthJee" Vicente Favini
 * 
 * This Library is released under the Creative Commons Licence By-Sa by its author
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
(function($){
	Validator = function()
	{
		var scope = this.scope = arguments[0];
		this.list = [];
		
		var $form = scope.is('form') ? scope : scope.find('form');
		if ($form.length == 0)
			$form = scope.findParent('form');
		$form.data('validator', this);
		
		var opts = $.extend({
			error:function(){},
			success:function(){}
		},arguments[1]);
		
		this.error = opts.error;
		this.success = opts.success;
		
		var list = opts.validates;
		
		if (typeof list != "undefined")
			this.addValidate(list);
	}
	Validator.prototype.validate = function(valObj){
		var errorList = [];
		var elem = [];
		var controller = this;
		
		if (arguments.length == 0)
		{
			var list = this.list;
			for (var i = 0; i < list.length; i++)
			{
				if (!this.validate(list[i]))
				{
					errorList.merge(list[i].errorList);
				}
				else
				{
					elem.merge(list[i].elem.get());
				}
			}
		}
		else
		{
			controller = valObj;
			var func = valObj.validation;
			var elem = valObj.elem;
			$(elem).each(function(){
				var $e = $(this);
				if (!func.apply($e))
				{
					errorList.push(this);
				}
			});
			valObj.errorList = errorList;
		}
		
		var valid = (errorList.length <= 0);
		if (valid)
			controller.success.call($(elem));
		else
			controller.error.call($(errorList));
		return valid;
	};
	Validator.prototype.addValidate = function(){
		if (arguments.length == 1)
		{
			if (typeof arguments[0] == "object" && arguments[0].constructor == Array)
				return this.addValidateArray.apply(this, arguments);
			else
				return this.addValidateObj.apply(this, arguments);
		}
		else if (arguments.length > 1)
		{
			
		}
	};
	Validator.prototype.addValidateArray = function(list){
		for (var i = 0; i < list.length; i++)
			this.addValidateObj(list[i]);
	};
	Validator.prototype.addValidateObj = function(obj){
		var $scope = this.scope;
		var elem = typeof obj.selector == "function" ? obj.selector.call($scope) : typeof obj.selector == "string" ? $scope.find(obj.selector) : obj.selector;
		var validation = obj.validation == "function" ? obj.validation : this.buildValidate(obj.validation);
		var error = obj.error ? obj.error : function(){};
		var success = obj.success ? obj.success : function(){};
		var add = {
			elem : elem,
			validation : validation,
			type:obj.validation,
			error:error,
			success:success
		};
		this.list.push(add);
		return add;
	};
	Validator.prototype.buildValidate = function(type)
	{
		if (this.buildValidate.validates[type])
			return this.buildValidate.validates[type];
		return function(){return false;}
	};
	Validator.prototype.buildValidate.validates = {};
	
	Validator.prototype.buildValidate.validates.required = function()
	{
		var $elem = this;
		var $form = $elem.findParent('form'); 
		if ($elem.is(':checkbox'))
			return $elem.is(':checked');
		else if($elem.is(':radio'))
		{
			var name = $elem.attr('name');
			return $form.find('input:radio[name="'+name+'"]:checked').length > 0;
		}
		else
			return $elem.val() != "" && $elem.val().trim() != "";
	};
	Validator.prototype.buildValidate.validates.email = function()
	{
		var $elem = this;
		return $elem.val().match(/\w[\w\d]*([-.+_][\w\d])*@[\w\d]+([-._][\w\d])*/);
	};
	
	$.fn.validator = function(list){
		return new Validator(this, list);
	};
	
	$.fn.validator.prototype = Validator.prototype;
})(jQuery);
