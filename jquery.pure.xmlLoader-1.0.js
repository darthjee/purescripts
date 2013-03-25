/**
 * @file jquery.xmlLoader-1.0.js
 * @brief 
 */

 
/**
 * @brief realiza a leitura de um XML de lista de dados retornando os dados dentro do elemento selecionado
 *
 * @param 
 */
jQuery.prototype.loadXMLList = function(url,config)
{
	if (config == null)
		config = typeof url == "string" ? {} : url;
	if (config.modelType == 'html')
	{
		config.selModel = getDefaultValue(config.selModel , '.model');
		var eleM = this.find(config.selModel).first().get(0);
		config.selModel = getDefaultValue(eleM, config.selModel);
	}
	var eleD = config.selDest != null ? this.find(config.selDest).first().get(0) : this.first().get(0);
	var selDest = getDefaultValue(eleD, config.selDest);
	jQuery.loadXMLList(selDest,url,config);
};
/**
 * @brief realiza a leitura de um XML de lista de dados
 */
jQuery.loadXMLList = function(selDest,url,config)
{
	config = config != null ? config : typeof url == "string" ? {} : url;
	var callBack = getDefaultValue(config.callBack,function(){});
	var clearBefore = getDefaultValue(config.clearBefore , true);
	var clearAfter = getDefaultValue(config.clearAfter , true);
	var selModel = getDefaultValue(config.selModel , '.model');
	var modelType = getDefaultValue(config.modelType , 'xml' );
	var inputData = getDefaultValue(config.inputData , null );
	var inputMethod = inputData ? 'var' : 'xml';
	var postObj = config.postObj;
	/**
 	* @brief loaded XML class
 	* the class loads an XML and parses it to infuse the HTML with the data
 	*/
	function loadedXML(url, callBack)
	{
		var objSelf = this;
		var xmlObj;
		var fields = new indexedList();
		var target = jQuery(selDest);
		var model = (modelType == 'html' ? jQuery(selModel) : null);
		var htmlModel = (model != null ? model.html() : '');
		if (modelType == 'html' && clearAfter)
			model.remove();
		/**
 		* @breif method that loads the element list
 		*/
		this.loadList = function()
		{
			if (clearBefore)
				target.html('');
			xmlObj.find('list item').each(function(ind, it){
				function itemRead(item, field)
				{
					this.fill = function(html){return html;};
					var fill = jQuery(item).find("fill[type='"+field.key+"']");
					if (fill)
					{
						var value = fill.attr('value');
						if (value == null)
							value = fill.text();
						if (value == null)
							value = field.def;
						if (value != null)
						{
							this.fill = function(html){
								html = html.replaceAll(field.sample, value);
								return html;
							};
						}
					}
				}
				var html = htmlModel;
				for (var i = 0; i < fields.length; i++)
				{
					var ir = new itemRead(this, fields.getByInd(i));
					html = ir.fill(html);
				}
				target.append(html);
			});
			callBack(this.parseVars());
		};
		/**
 		* @brief method that loads the XML and starts the pre-parsing of it
 		*/
		this.start = function ()
		{
			function parse(xml){
				xmlObj = jQuery(xml);
				if (modelType == 'xml')
					htmlModel = xmlObj.find('model').text();
				xmlObj.find('fields field').each(function (ind, f){
					function field(sample, def, key){
						this.sample=sample;
						this.def = def;
						this.key = key;
					}
					o = jQuery(f);
					fields.add(o.attr('id'), new field(o.attr('sample'), o.attr('def'), o.attr('id')));
				});
				objSelf.loadList();
			}
			if (inputMethod == 'xml')
			{
				if (postObj)
					jQuery.post(url, postObj, parse);
				else
					jQuery.get(url, parse);
			}
			else
				parse(inputData);
		};
		this.parseVars = function(){
			/*
			var vars = {};
			xmlObj.find('variables var').each(function(){
				var obj = jQuery(this);
				vars[obj.attr('key')]= obj.attr('value') ? obj.attr('value') : obj.text(); 
			});
			return vars;
			*/
 			return xmlObj.parseXmlVars();
		};
		
		this.start();
	}
	var ldxml = new loadedXML(url, callBack);
};

/**
 * @brief do a search in an Array
 */
Array.prototype.find = function(val, offset, limit)
{
	if (offset == null)
		offset = 0;
	if (limit == null)
		limit = this.length;
	for (var i = offset; i < limit; i++)
	{
		if (this[i] == val)
			break;
	}
	if (i >= limit)
		i = -1;
	return i;
};

/**
 * @brief Replace all the pattern found on a String
 */
String.prototype.replaceAll = function(pattern, newstring, param)
{
	param = param ? param : "";
	newstring = newstring.replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/'/g,'\\\'');
	var str = this.toString().replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/\"/g,"\\\"");
	str = eval('"'+str+'"'+".replace(/"+pattern+"/g"+param+",'"+newstring+"');");
	return str;
};


/**
 * @brief abre um xml e joga os dados nos campos
 * @param url : caminho do xml
 */
jQuery.xmlLoad = function(url, config)
{
	if (config == null)
		config = typeof url == "string" ? {} : url;
	jQuery(document).xmlLoad(url, config);
};

/**
 * @brief abre um xml e joga os dados nos campos
 * @param url : caminho do xml
 */
jQuery.prototype.xmlLoad = function(url, config)
{
	config = config != null ? config : typeof url == "string" ? {} : url;
	var langlist = getDefaultValue(config.langlist, ['zz']);
	var inputData = getDefaultValue(config.inputData , null );
	var inputMethod = typeof inputData != "undefined" && inputData != null? 'var' : 'xml';
	
	var self = this;
	/**
 	* @brief faz o parse buscando um objeto jQuery
 	* pelo idioma
 	*
 	* @return um objeto jquery contendo apenas os dados de um idioma
 	* @todo utilizar o idioma default
 	*/
	function transGetData(data)
	{
		var i=0;
		var max = langlist.length;
		do
		{
			lang=langlist[i];
			lang = jQuery(data).find("data[lang='"+lang+"']").attr('lang');
			i++;
		} while(!lang && i < max);
		return jQuery(data).find("data[lang='"+lang+"']");
	}
	

	/**
 	* @brief retorna um objeto
 	* com os dados de um field ja prontos para serem inseridos
 	*
 	* @param field:objeto jquery do campo selecionado com os dados de definicao
 	* @param data: objeto jquery  do idioma selecionado com os textos
 	* @param selector: selector base
 	* @todo fazer com que a funcao
 	* jqeury possa colocar texto em html que nao utilizem $().text()
 	*/
	function transField(field, data, selector)
	{
		/*  os dados basicos podem ser extraidos diretamente  */
		var name = field.attr('name');
		var id = field.attr('id');
		var type = field.attr('type');
		var nobase = field.attr('nobase');
		var selfSelector = field.attr('selector');
		nobase = nobase == null ? 'false' : nobase;
		var idat = field.attr('idat');
		idat = idat == null ? 'id' : idat;
		var ff = field.attr('ff');
		ff = ff == null ? 'text' : ff;
		var obj = data.find("[name='"+name+"']");
		var value = obj.text();
		value = value == null ? obj.val() : value;
		var objSelected;
		
		/**
 		* @brief gera a string selector do campo
 		* @see transField
 		*/
		(function ()
		{
			/* quando nobase for true, o selector base nao podera ser utilizado */
			if (nobase == 'true')
			{
				selector = '';
			}

			var sel;
			if (selfSelector != null)
				sel = selfSelector;
			else
			{
				/* o selector utilizando o id e o type eh gerado em separado */
				if (type != '')
				{
					sel = type;
				}
				/* o id entao eh adcionado dependendo do tipo de atributo idat */
				if (this.id != '')
				{
					if (idat == 'id')
						sel += "#"+id;
					else if (idat == 'class')
						sel += "."+id;
					else
						sel += "["+idat+"='"+id+"']";
				}
				
			}
			if (selector != '')
				objSelected = jQuery(selector).find(sel);
			else if (val != '')
				objSelected = jQuery(sel);
			else
				objSelected = jQuery(selector);
		})();
		this.fill = function()
		{
			switch(ff)
			{
				case 'text' :
					objSelected.html(value);
					break;
				case 'val' :
					objSelected.val(jQuery('<div>'+value+'</div>').text());
					break;
				case 'selected':
				case 'checked':
					objSelected.filter('[value="'+value+'"]').attr(ff,ff);
					break;
				case 'css':
					list = value.split(';');
					var ele = objSelected;
					for (var i = 0; i < list.length; i++)
					{
						var prop = list[i].match(/^(.*?):/)[1];
						var va = list[i].match(/^.*?:(.*)/)[1];
						ele.css(prop, va);
					}
				default:
					objSelected.attr(ff, jQuery('<div>'+value+'</div>').text());
			}
		};
	}

	/**
 	* @brief faz um parse do XML buscando os dados
 	* @param xml: xml retornado do $jquery.ajax()
 	* @param data: parte do xml ja com os dados no idioma selecionado
 	* @return ret: array contendo todos os objetos fields selecionados
 	* @see transField
 	*
 	* @todo melhorar o parser com mais opecoes como tipo de texto
 	*/
	function transGetFields(xml, data)
	{
		var selector = $(xml).find('base selector').text();
		var ret=[];

		var fields = $(xml).find('base fields').children();
		var n = fields.length;
		var i;


		for (i = 0; i < n; i++)
		{
			ret[i] = new transField(fields.eq(i), data, selector);
		}

		return ret;
	}



	/**
 	* @brief joga os dados na pagina
 	*
 	* @param fields: array contendo os objetos utilizados
 	*/
	function transParseFill(fields)
	{
		var n = fields.length;
		for (i = 0; i < n; i++)
		{
			/** a funcao chamada ja foi definida em @ref transField */
			fields[i].fill();
		}
	}
	
	function main(xml)
	{
		/* busca-se os dados de acordo com o idioma */
		var data = transGetData(xml);
		/* gera-se os objetos com os dados e os selectors */
		var fields = transGetFields(xml, data);
		/* joga-se os dadso no pagina */
		transParseFill(fields);
		/* libera-se a memoria */
		var i;
		var n = fields.length;
		for (i = 0; i < n; i++)
			fields[i] = null;
			fields = null;
	}
	
	/* requestor eh o objeto utilizado por ajax */
	var requestor=
	{
		url:url,
		async:false,
		success:main
	};

	if (inputMethod == 'xml')
		jQuery.ajax(requestor);
	else
		main(inputData);
};

/**
 * @brief parses a variable xml into an object
 */
jQuery.parseXmlVars = function(xml)
{
	return jQuery(xml).parseXmlVars();
};

/**
 * @brief parses a variable xml into an object
 */
jQuery.prototype.parseXmlVars = function()
{
	var vars = {};
	this.find('variables var').each(function(){
		var obj = jQuery(this);
		vars[obj.attr('key')]= obj.attr('value') ? obj.attr('value') : obj.text();
	});
	return vars;
};



/*************************
 *  Funcoes de apoio
 ********/


function getDefaultValue(value, defValue)
{
	return (value != null ? value : defValue);
}

