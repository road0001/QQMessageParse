/*
	JQuery Extensions DOM
	(c) 2020-2023 JMRY
	MIT Licensed.

	Version: 1.0.8 Build 20231222
		- 加入获取生成的HTML功能。
	Version: 1.0.7 Build 20230606
		- 加入表格DOM的语法糖。
		- 修复部分情况下，元素中children会出现重复内容的bug。
	Version: 1.0.6 Build 20210514
		- 修复部分情况下，appendDOM中直接传递对象时无法添加元素的bug。
	Version: 1.0.5 Build 20210301
	Version: 1.0.4 Build 20200908

	Feature:
		Optimize JQuery experience of insert DOM.
		Use object to instead string to generate HTML DOM string or objects.

	How to use:
		Get the DOM string:
			$.getDOMString(`div`,{id:`div`,class:`div`},`This is a DIV.`);
		Insert element:
			$(`body`).appendDOM(`div`,{id:`div`,class:`div`},`This is a DIV.`);
			$(`body`).prependDOM(`div`,{id:`div`,class:`div`},`This is a DIV.`);
			$(`body`).beforeDOM(`div`,{id:`div`,class:`div`},`This is a DIV.`);
			$(`body`).afterDOM(`div`,{id:`div`,class:`div`},`This is a DIV.`);
			$(`body`).htmlDOM(`div`,{id:`div`,class:`div`},`This is a DIV.`);
		
		Events bind:
			$(`body`).appendDOM(`div`,{
				id:`div`,class:[`div`,`div2`],
				bind:{
					click(e){
						console.log(`test`);
					}
				}
			},`This is a DIV.`);

			The bind events can also push the data:
				$(`body`).appendDOM(`div`,{
					id:`div`,class:`div`,
					bind:{
						click:{
							data:{index:1},
							function(e){
								console.log(e.data.index);
							}
						}
					}
				},`This is a DIV.`);
			
		Styles with JQuery css object struct:
			$(`body`).appendDOM(`div`,{
				id:`div`,class:[`div`,`div2`],
				style:{
					backgrundColor:`#FFF`,
					opacity:0,
				}
			},`This is a DIV.`);

		Children elements:
		You can direct insert multi-children in one element, and supports cascade.
			$(`body`).appendDOM(`div`,{
				id:`div`,class:[`div`,`div2`],
				children:[
					{
						tag:`div`,
						attr:{
							id:`div_child_1`,class:[`div`,`div_child`],
							children:{
								tag:`div`,
								attr:{
									id:`div_grandson`,class:[`div`,`div_child`,`div_grandson`]
								},
								html:`This is a grandson DIV.`
							}
						},
						html:`This is a child DIV.`
					},
					{
						tag:`div`,
						attr:{
							id:`div_child_2`,class:[`div`,`div_child`],
						},
						html:`This is a child DIV.`
					}
				]
			},`This is a DIV.`);

		Table elements:
		You can insert table and table body like this:
			$(`body`).appendDOM(`table`,{
				id:`testTable`,class:`testTable`,tbody:[
					{attr:{id:`tr1`,class:`tr1`},td:[
						{attr:{id:`td1`,class:`td1`,html:`test td 1`}},
						{attr:{id:`td2`,class:`td2`},html:`test td 2`},
						{html:`test td 3`},
						`test td 4`,
					]},
					{td:[
						{attr:{id:`td1`,class:`td1`,html:`test td 31`}},
						{attr:{id:`td2`,class:`td2`},html:`test td 32`},
						{html:`test td 33`},
						`test td 34`,
					]},
				],
			});

		HTML string in attributes without dom_html param:
			Notice: the priority of HTML string in attributes is higher than dom_html param.
			$(`body`).appendDOM(`div`,{
				id:`div`,class:[`div`,`div2`],
				html:`This is a DIV.`,
				children:{
					tag:`div`,
					attr:{
						id:`div_child_1`,class:[`div`,`div_child`],
						html:`This is a child DIV.`
					}
				}
			});

		You can also insert element without attributes:
			$(`body`).appendDOM(`div`,`This is a DIV.`);

		Use object to insert element:
			$(`body`).appendDOM({
				tag:`div`,
				attr:{
					id:`div`,class:[`div`,`div2`],
					html:`This is a DIV.`,
					children:{
						tag:`div`,
						attr:{
							id:`div_child_1`,class:[`div`,`div_child`],
							html:`This is a child DIV.`
						}
					}
				}
			})

		Batch insert elements:
			$(`body`).appendDOM([
				{
					tag:`div`,
					attr:{
						id:`div1`,class:[`div`,`div1`],
						html:`This is a DIV 1.`,
						children:{
							tag:`div`,
							attr:{
								id:`div_child_1`,class:[`div`,`div_child`],
								html:`This is a child DIV 1.`
							}
						}
					}
				},
				{
					tag:`div`,
					attr:{
						id:`div2`,class:[`div`,`div2`],
						html:`This is a DIV 2.`,
						children:{
							tag:`div`,
							attr:{
								id:`div_child_1`,class:[`div`,`div_child`],
								html:`This is a child DIV 2.`
							}
						}
					}
				},
			])
*/

$.getDOMString=function(dom_tag,dom_attr,dom_html){
	/*
	dom_tag:string
		HTML tags, like div, input, p, button, and so on.
	dom_attr:object
		HTML attributes, struct:
		{
			id:`id`,
			class:`class1 class2` OR [`class1`,`class2`],
			style:`border:none;` OR {border:`none`},

			Extend attributes:
			bind:{
				click:function,
			},
		}
	dom_attr:string
		HTML inner text
	dom_html:string
		HTML inner text
	*/

	//属性黑名单指的是在遍历属性时直接忽略的key。
	//如果需要处理这些key但不要插入html中，则应使用allow_insert_attr，将它置为false即可。
	let attr_blacklist=[
		`bind`,`children`,
	]
	
	if(dom_tag==undefined){ //html标记为空时，直接返回空值
		return ``;
	}else if(dom_tag!=undefined && dom_attr==undefined && dom_html==undefined){ //html标记不为空、属性和内容为空时，直接返回字符串
		return dom_tag;
	}else if(dom_tag!=undefined && dom_attr!=undefined && dom_html==undefined){
		dom_html=``;
	}

	let dom_attr_string=``;

	//dom_attr is string, it will be the inner html, without attributes.
	if(typeof dom_attr==`string`){
		dom_html=dom_attr;
	}else if(typeof dom_attr==`object`){
		let allow_insert_attr;
		for(let key in dom_attr){
			allow_insert_attr=true;
			let cur_dom_attr=dom_attr[key];
			// if(key!=`bind`){
			if($.inArray(key,attr_blacklist)<0){
				//HTML属性的特殊处理
				switch(key){
					//Class数组化处理
					case `class`:
						if(typeof cur_dom_attr==`object`){
							cur_dom_attr=cur_dom_attr.join(` `);
						}
					break;

					//Style对象化处理（交给getDOMObject，因此将allow_insert_attr置为false，以跳过插入属性）
					case `style`:
						if(typeof cur_dom_attr==`object`){
							allow_insert_attr=false;
						}
					break;

					//Html属性转为text。此属性会覆盖dom_html参数，因此不可混用
					case `html`:
						dom_html=cur_dom_attr;
						allow_insert_attr=false;
					break;
					//tbody属性处理
					case `tbody`:
						allow_insert_attr=false;
					break;
				}

				//cur_dom_attr为undefined、null时，不插入此属性
				if(cur_dom_attr!=undefined && cur_dom_attr!=null && allow_insert_attr){
					dom_attr_string+=` ${key}="${cur_dom_attr}"`;
				}
			}
		}
	}

	if(dom_tag==`html`){
		return `${dom_html}`;
	}
	
	return `<${dom_tag}${dom_attr_string}>${dom_html}</${dom_tag}>`;
}

$.getDOMObject=function(dom_tag,dom_attr,dom_html){
	try{
		let domObject=$($.getDOMString(dom_tag, dom_attr, dom_html));
		if(typeof dom_attr==`object`){
			//DOM样式
			try{
				/*
				CSS Struct:
				style:{
					width:`255px`,
					height:`255px`,
				}
				*/
				if(typeof dom_attr.style==`object`){
					domObject.css(dom_attr.style);
				}
			}catch(e){
				console.error(e);
			}

			//DOM事件绑定
			try{
				/*
				Bind Struct:
				bind:{
					click:function,
				}
				Another Struct:
				bind:{
					click:{
						data:{},
						function:function,
					}
				}
				*/
				if(typeof dom_attr.bind==`object`){
					for(let key in dom_attr.bind){
						let curBind=dom_attr.bind[key];
						domObject.unbind(key);
						if(typeof curBind==`function`){
							domObject.bind(key, curBind);
						}else if(typeof curBind==`object`){
							curBind={
								...{
									data:{},
									function(){},
								},
								...curBind,
							}
							domObject.bind(key, curBind.data, curBind.function);
						}
					}
				}
			}catch(e){
				console.error(e);
			}

			//DOM子项
			try{
				if(typeof dom_attr.children==`object`){
					let default_children={
						tag:undefined,attr:undefined,html:undefined,type:`append`
					};

					if(dom_attr.children.length==undefined){
						/*仅一个子项时，可以直接使用Object
						{
							tag:`html`,attr:{id:`id`},html:`Test`,type:`append`
						}
						*/
						let children={
							// ...default_children,
							...JSON.parse(JSON.stringify(default_children)),
							...dom_attr.children,
						}
						domObject.attachDOM(children.tag,children.attr,children.html,children.type);
					}else{
						/*多个子项时，采用数组形式
						[
							{
								tag:`html`,attr:{id:`id1`},html:`Test1`,type:`append`
							},
							{
								tag:`html`,attr:{id:`id2`},html:`Test2`,type:`append`
							},
						]
						*/
						for(let i=0; i<dom_attr.children.length; i++){
							let children={
								// ...default_children,
								...JSON.parse(JSON.stringify(default_children)),
								...dom_attr.children[i],
							}
							domObject.attachDOM(children.tag,children.attr,children.html,children.type);
						}
					}
				}
			}catch(e){
				console.error(e);
			}

			//TBODY表格
			try{
				if(typeof dom_attr.tbody==`object`){
					let default_tr={
						tag:`tr`,attr:{},html:undefined,children:[],type:`append`
					};
					let default_td={
						tag:`td`,attr:{},html:undefined,children:[],type:`append`
					}
					let trList=[];
					for(let i=0; i<dom_attr.tbody.length; i++){
						let curTr=dom_attr.tbody[i];
						let tr={
							...JSON.parse(JSON.stringify(default_tr)),
							...curTr
						}
						let trDomObject=domObject.attachDOM(tr.tag,tr.attr,tr.html,tr.type);
						for(let j=0; j<curTr.td.length; j++){
							let curTd=curTr.td[j];
							if(typeof curTd==`string`){
								curTd={html:curTd};
							}
							let td={
								...JSON.parse(JSON.stringify(default_td)),
								...curTd,
							}
							trDomObject.attachDOM(td.tag,td.attr,td.html,td.type);
						}
					}
					
				}
			}catch(e){
				console.error(e);
			}
		}
		return domObject;
	}catch(e){
		//对不规范写法的容错，如：只传dom_tag的情况下，直接返回字符串，而不是JQuery对象。
		return $.getDOMString(dom_tag, dom_attr, dom_html);
	}
}

$.fn.attachDOM=function(dom_tag, dom_attr, dom_html, attach_type){
	//dom_tag为数组时，批量为母元素添加元素
	if(typeof dom_tag==`object` && dom_tag.length!=undefined){
		let default_children={
			tag:undefined,attr:undefined,html:undefined,type:`append`
		};
		for(let cur of dom_tag){
			cur={
				...default_children,
				...cur,
			}
			this.attachDOM(cur);
		}
		return;
	}

	//dom_tag为对象时，和普通情况一样
	if(typeof dom_tag==`object` && dom_tag.length==undefined){
		dom_attr=dom_tag.attr;
		dom_html=dom_tag.html;
		attach_type=dom_tag.type || attach_type;
		dom_tag=dom_tag.tag;
		
	}

	let domObject=$.getDOMObject(dom_tag, dom_attr, dom_html);

	switch(attach_type){
		case `append`:
			this.append(domObject);
		break;
		case `prepend`:
			this.prepend(domObject);
		break;
		case `after`:
			this.after(domObject);
		break;
		case `before`:
			this.before(domObject);
		break;
		case `html`:
			this.html(domObject);
		break;
	}
	
	return domObject;
}

$.fn.appendDOM=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`append`);
}
$.fn.prependDOM=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`prepend`);
}
$.fn.afterDOM=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`after`);
}
$.fn.beforeDOM=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`before`);
}
$.fn.htmlDOM=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`html`);
}
$.fn.getHtml=function(dom_tag,dom_attr,dom_html){
	return this.attachDOM(dom_tag,dom_attr,dom_html,`html`)[0].outerHTML;
}
$.getHtml=function(dom_tag,dom_attr,dom_html){
	return $.fn.getHtml(dom_tag,dom_attr,dom_html);
}