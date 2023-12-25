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