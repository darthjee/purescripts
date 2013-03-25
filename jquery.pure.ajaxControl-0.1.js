(function($){
	$.fn.loadDiv = function(id, opt){
		var $this = this;
		var $div = $this.find('#'+id);
		
		opt = $.extend({
			callBack : function(){},
			html:'',
			rewrite:false,
			classe:''
		},opt);
		
		var url = opt.url;
		$this.children().hide();
		
		if ($div.length <= 0 || opt.rewrite)
		{
			if ($div.length <= 0)
			{
				$div = $('<div id="'+id+'" class="'+opt.classe+'"></div>');
				$this.append($div);
			}
			if (typeof url != "undefined")
			{
				$.ajax(url, {
					success:function(html){
						$div.html(html);
						opt.callBack.apply($div, arguments);
					}
				});
			}
			else
			{
				var html = opt.html;
				$div.html(html);
				opt.callBack.apply($div, arguments);
			}
		}
		$div.show();
	};
	
	
	
	/**
	 * @brief Envia um formulario via ajax
	 * @param config
	 * @parma config.callBack(data)
	 * @return
	 */

	jQuery.prototype.ajaxFormSubmit = function(config)
	{
		config = config ? config : {};
		var rsel = config.rSel;
		var finalCall = rsel == null ? config.callBack : function(data){
			/* form return div object */
			var retdiv=jQuery(rsel);
			var html = jQuery(data).find('body').html();
			if (html != null && html != "")
			{
				retdiv.html(html);
				config.callBack();
			}
			else
				retdiv.html("Falha");
		};
		
		/* form jQuery object */
		var form = this;
		/* creation of the iframe where the request will be sent to */
		var frameid;
		do
		{
			frameid="loadframe-"+Date.now();
		} while (jQuery("iframe#"+frameid).length > 0);
		jQuery("body").append('<iframe id="'+frameid+'" name="'+frameid+'" height="1" width="1" style="display:none"></iframe>');
		var frame = jQuery('iframe#'+frameid);
		var oldtarget = form.attr('target');
		
		form.attr('target', frameid);
		/* whenever the frame loads (after a submition), its content must be passed to the returning div */
		
		frame.ready(function (){
			frame.load(function (){
				finalCall(frame.contents().get()[0]);
				setTimeout(function(){frame.remove();},200);
				form.attr('target', oldtarget);
			});
		});
		form.submit();
	};
})(jQuery);