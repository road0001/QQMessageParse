let fs=require(`fs`);
let path=require(`path`);

String.prototype.replaceAll=function(org,tgt){
	return this.split(org).join(tgt);
}

Date.prototype.format = function(fmt) { 
	var o = { 
	"M+" : this.getMonth()+1,                 //月份 
	"d+" : this.getDate(),                    //日 
	"h+" : this.getHours(),                   //小时 
	"m+" : this.getMinutes(),                 //分 
	"s+" : this.getSeconds(),                 //秒 
	"q+" : Math.floor((this.getMonth()+3)/3), //季度 
	"S"  : this.getMilliseconds(),            //毫秒
	"w"	: this.getDay(),                     //星期
	}; 
	var w = [`日`,`一`,`二`,`三`,`四`,`五`,`六`];
	if(/(y+)/.test(fmt)) {
		fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
	}
	for(var k in o) {
		if(new RegExp("("+ k +")").test(fmt)){
			switch(k){
				case `w`:
					fmt = fmt.replace(RegExp.$1, w[o[k]]);
				break;
				default:
					fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
				break;
			}
		}
	}
	return fmt; 
}

async function readFile(path,format=`utf-8`){
	return new Promise((resolve,reject)=>{
		fs.readFile(path, format, (err, data)=>{
			if (err) {
				reject(err);
			}else{
				resolve(data);
			}
		});
	})
}

function getAllFiles(directory, ext) {
	const files = [];

	try {
		const fileNames = fs.readdirSync(directory);
		
		for (let fileName of fileNames) {
			if (!fileName.endsWith(`.${ext}`)) continue; // 只处理JS文件
			
			const fullFilePath = path.join(directory, fileName);
			const stats = fs.statSync(fullFilePath);
			
			if (stats.isDirectory()) {
				files.push(...getAllFiles(fullFilePath)); // 如果是子目录则递归调用自身
			} else {
				files.push(fullFilePath.replaceAll(`\\`,`/`));
			}
		}
	} catch (error) {
		console.log(`Error reading directory ${directory}:`, error);
	}
	return files;
}

function getAllFolders(directory){
	const files = [];

	try {
		const fileNames = fs.readdirSync(directory);
		
		for (let fileName of fileNames) {
			const fullFilePath = path.join(directory, fileName);
			const stats = fs.statSync(fullFilePath);
			
			if (stats.isDirectory()) {
				files.push(fullFilePath.replaceAll(`\\`,`/`)); // 如果是子目录则递归调用自身
			}
		}
	} catch (error) {
		console.log(`Error reading directory ${directory}:`, error);
	}
	return files;
}

/*
* jQuery Highlight plugin
*
* Based on highlight v3 by Johann Burkard
* http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
*
* Code a little bit refactored and cleaned (in my humble opinion).
* Most important changes:
*  - has an option to highlight only entire words (wordsOnly - false by default),
*  - has an option to be case sensitive (caseSensitive - false by default)
*  - highlight element tag and class names can be specified in options
*
* Usage:
*   // wrap every occurrance of text 'lorem' in content
*   // with <span class='highlight'> (default options)
*   $('#content').highlight('lorem');
*
*   // search for and highlight more terms at once
*   // so you can save some time on traversing DOM
*   $('#content').highlight(['lorem', 'ipsum']);
*   $('#content').highlight('lorem ipsum');
*
*   // search only for entire word 'lorem'
*   $('#content').highlight('lorem', { wordsOnly: true });
*
*   // don't ignore case during search of term 'lorem'
*   $('#content').highlight('lorem', { caseSensitive: true });
*
*   // wrap every occurrance of term 'ipsum' in content
*   // with <em class='important'>
*   $('#content').highlight('ipsum', { element: 'em', className: 'important' });
*
*   // remove default highlight
*   $('#content').unhighlight();
*
*   // remove custom highlight
*   $('#content').unhighlight({ element: 'em', className: 'important' });
*
*
* Copyright (c) 2009 Bartek Szopka
*
* Licensed under MIT license.
*
*/

jQuery.extend({
	highlight: function (node, re, nodeName, className) {
		if (node.nodeType === 3) {
			var match = node.data.match(re);
			if (match) {
				var highlight = document.createElement(nodeName || 'span');
				highlight.className = className || 'highlight';
				var wordNode = node.splitText(match.index);
				wordNode.splitText(match[0].length);
				var wordClone = wordNode.cloneNode(true);
				highlight.appendChild(wordClone);
				wordNode.parentNode.replaceChild(highlight, wordNode);
				return 1; //skip added node in parent
			}
		} else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
				!/(script|style)/i.test(node.tagName) && // ignore script and style nodes
				!(node.tagName === nodeName.toUpperCase() && node.className === className)) { // skip if already highlighted
			for (var i = 0; i < node.childNodes.length; i++) {
				i += jQuery.highlight(node.childNodes[i], re, nodeName, className);
			}
		}
		return 0;
	}
});

jQuery.fn.unhighlight = function (options) {
	var settings = { className: 'highlight', element: 'span' };
	jQuery.extend(settings, options);

	return this.find(settings.element + "." + settings.className).each(function () {
		var parent = this.parentNode;
		parent.replaceChild(this.firstChild, this);
		parent.normalize();
	}).end();
};

jQuery.fn.highlight = function (words, options) {
	var settings = { className: 'highlight', element: 'span', caseSensitive: false, wordsOnly: false };
	jQuery.extend(settings, options);
	
	if (words.constructor === String) {
		words = [words];
	}
	words = jQuery.grep(words, function(word, i){
		return word != '';
	});
	words = jQuery.map(words, function(word, i) {
		return word.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	});
	if (words.length == 0) { return this; };

	var flag = settings.caseSensitive ? "" : "i";
	var pattern = "(" + words.join("|") + ")";
	if (settings.wordsOnly) {
		pattern = "\\b" + pattern + "\\b";
	}
	var re = new RegExp(pattern, flag);
	
	return this.each(function () {
		jQuery.highlight(this, re, settings.element, settings.className);
	});
};