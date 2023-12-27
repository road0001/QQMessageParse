// let imgDataObj={};
messagePath=``;
imgDataMap=new Map();
async function loadConfig(name){
	return new Promise((resolve, reject)=>{
		fs.readFile(name, `utf-8`, (err, data)=>{
			if (err) {
				reject(err);
			}
			// imgDataObj=JSON.parse(data);
			let imgDataList=JSON.parse(data);
			for(let cur of imgDataList){
				let curSp=cur.split(`&`);
				imgDataMap.set(curSp[1], {
					file:curSp[0],
					name:curSp[1],
					type:curSp[2],
					offset:parseInt(curSp[3]),
					size:parseInt(curSp[4]),
				});
			}
			// for(let key in imgDataObj){
			// 	imgDataMap.set(key, imgDataObj[key]);
			// }
			resolve(imgDataMap);
		});
	});
}

// let dateDataArr=[];
// async function loadDate(name){
// 	return new Promise((resolve, reject)=>{
// 		fs.readFile(name, `utf-8`, (err, data)=>{
// 			if (err) {
// 				reject(err);
// 			}
// 			dateDataArr=JSON.parse(data);
// 			resolve(dateDataArr);
// 		});
// 	});
// }

class ReadImg{
	constructor(name){
		this._imgData=imgDataMap.get(name);
	}
	getData(){
		return this._imgData;
	}
	async read(){
		if(!this._imgData || !this._imgData.file){
			return ``;
		}
		let type=this._imgData.type;
		return new Promise((resolve, reject)=>{
			let rs=fs.createReadStream(`${messagePath}/${this._imgData.file}`,{
				start:this._imgData.offset,
				end:this._imgData.offset + this._imgData.size - 1,
			});
			let buffer=[];
			rs.on(`data`,(data)=>{
				buffer.push(data);
			});
			rs.on(`end`,()=>{
				resolve(`data:${type};base64,${Buffer.concat(buffer).toString('base64')}`);
			});
			rs.on(`error`,(e)=>{
				reject(e);
			})
		})
	}
}

function getTag(tag) {
    return Array.from(document.getElementsByTagName(tag));
}
function getClass(c){
	return Array.from(document.getElementsByClassName(c));
}

function applySearch(text, type){
	$(`body`).unhighlight();
	$(`#searchNum`).html(`&nbsp;`);
	if(text){
		$(`body`).highlight(text);
		$(`#searchNum`).html(`${$(`.highlight`).length==0?`0`:`1`}/${$(`.highlight`).length}`);
	}
	global.applyGlobalSearch(text);
	let textHightEl=$(`.highlight`);
	switch(type){
		case `prev`:
			textHightEl.removeClass(`highlight2`);
			for(let i=textHightEl.length-1; i>=0; i--){
				// if(textHightEl.eq(i)[0].getBoundingClientRect().y < 32 || i==0){
				if(i==0 || textHightEl.eq(i)[0].getBoundingClientRect().y < window.innerHeight / 2 - 32){
					textHightEl.eq(i)[0].scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`});
					textHightEl.eq(i).addClass(`highlight2`);
					$(`#searchNum`).html(`${i+1}/${textHightEl.length}`);
					break;
				}
			}
		break;
		case `next`:
			textHightEl.removeClass(`highlight2`);
			for(let i=0; i<textHightEl.length; i++){
				if(i==textHightEl.length-1 || textHightEl.eq(i)[0].getBoundingClientRect().y > window.innerHeight / 2 + 32){
					textHightEl.eq(i)[0].scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`});
					textHightEl.eq(i).addClass(`highlight2`);
					$(`#searchNum`).html(`${i+1}/${textHightEl.length}`);
					break;
				}
			}
		break;
	}
}

function insertSearch(){
	$(`body`).appendDOM(`div`,{class:`searchBar`,children:[
		{tag:`input`,id:`searchInput`,class:`searchInput`,placeholder:`搜索`},
		{tag:`button`,id:`searchNum`,class:`searchBu num`,html:`&nbsp;`},
		{tag:`button`,id:`searchClear`,class:`searchBu clear`,title:`清空`,html:`×`,bind:{click(){
			$(`#searchInput`).val(``);
			applySearch($(`#searchInput`).val(),`clear`);
		}}},
		{tag:`button`,id:`searchPrev`,class:`searchBu prev`,title:`上一个`,html:`↑`,bind:{click(){
			applySearch($(`#searchInput`).val(),`prev`);
		}}},
		{tag:`button`,id:`searchNext`,class:`searchBu next`,title:`下一个`,html:`↓`,bind:{click(){
			applySearch($(`#searchInput`).val(),`next`);
		}}},
		{tag:`button`,id:`searchSubmit`,class:`searchBu submit`,title:`搜索`,html:`>`,bind:{click(){
			applySearch($(`#searchInput`).val());
		}}},
	]});
	$(window).bind(`keydown`,function(e){
		let keyCode = e.which || e.keyCode;
		if (keyCode === 13) { // Enter键
			applySearch($(`#searchInput`).val());
		}
	});
}

let loadCompleted=false;
function setLoadCompleted(){
	loadCompleted=true;
}
function isLoadCompleted(){
	return loadCompleted;
}

async function main(){
	let pathSplit=window.location.pathname.split(`/`);
	pathSplit.shift();
	pathSplit.pop();
	messagePath=decodeURIComponent(pathSplit.join(`/`));
	insertSearch();

	//日期选择列表
	let dateElement=$(`.dateTag`);
	let dateDataArr=[];
	for(let i=0; i<dateElement.length; i++){
		dateDataArr.push(dateElement.eq(i).attr(`date`));
	}
	
	let dateChildren=[];
	for(let i=0; i<dateDataArr.length; i++){
		let curDate=dateDataArr[i];
		let curDateSplit=curDate.split(`-`);
		let curMonth=`${curDateSplit[0]}-${curDateSplit[1]}`;
		if(window.location.pathname.includes(curMonth)){
			let curDateFormat=new Date(curDate).format(`yyyy-MM-dd 星期w`);
			dateChildren.push({
				tag:`button`,
				id:`dateBu_${curDate}`,
				class:`dateBu ${i==0?`selected`:``}`,
				html:curDateFormat,
				bind:{
					click:{
						data:{curDate:curDate},
						function(e){
							$(`#dateStr_${e.data.curDate}`)[0].scrollIntoView({behavior:`smooth`,block:`center`,inline:`center`});
							setTimeout(()=>{
								$(`.dateBu`).removeClass(`selected`);
								$(this).addClass(`selected`);
							},50);
						}
					}
				}
			});
		}
	}
	$(`body`).appendDOM(`div`,{id:`dateSelector`,class:`dateSelector`,children:dateChildren});

	let dateObserver = new IntersectionObserver(
		(changes) => {
			changes.forEach((change) => {
				let d = change.target;
				let curDate=d.getAttribute(`date`);
				if (change.intersectionRatio > 0) {
					console.log(curDate);
					$(`.dateBu`).removeClass(`selected`);
					$(`#dateBu_${curDate}`).addClass(`selected`);
					// dateObserver.unobserve(d);
				}
			})
		}
	);
	getClass(`dateTag`).forEach((item) => {
		dateObserver.observe(item);
	});
	setTimeout(()=>{setLoadCompleted()},500);
	await loadConfig(`${messagePath}/imgdata.json`);
	//图片列表（懒加载）
	// let imgObserver = new IntersectionObserver(
	// 	(changes) => {
	// 		changes.forEach(async (change) => {
	// 			if (change.intersectionRatio > 0) {
	// 				let img = change.target;
	// 				let imgData=new ReadImg(img.dataset.src);
	// 				img.src = await imgData.read();
	// 				imgObserver.unobserve(img);

	// 				// img.addEventListener(`contextmenu`,(e)=>{
	// 				// 	e.preventDefault();
	// 				// 	let imageData=imgData.getData();
	// 				// 	console.log(imageData);
	// 				// 	let imageName=imageData.name.replaceAll(`.dat`,``);
	// 				// 	let imageType=imageData.type.split(`/`)[1];
	// 				// 	let image = document.createElement('a');
	// 				// 	image.href = img.src;
	// 				// 	image.download = `${imageName}.${imageType}`;
	// 				// 	image.click();
	// 				// })
	// 			}
	// 		})
	// 	}
	// )
	// getTag('img').forEach((item) => {
	// 	imgObserver.observe(item);
	// });

	$(`img`).bind(`click`,function(){
		global.showImg(true,$(this).attr(`src`),$(this).attr(`data-src`));
	});
	$(`img`).bind(`contextmenu`,function(e){
		e.preventDefault();
		let imageData=imgDataMap.get($(this).attr(`data-src`));
		console.log(imageData);
		let imageName=imageData.name.replaceAll(`.dat`,``);
		let imageType=imageData.type.split(`/`)[1];
		let image = document.createElement('a');
		image.href = $(this).attr(`src`);
		image.download = `${imageName}.${imageType}`;
		image.click();
	});

	//图片列表（非懒加载）
	let imgEl=$(`img`);
	for(let i=0; i<imgEl.length; i++){
		let curImgEl=imgEl.eq(i);
		let imgData=new ReadImg(curImgEl.attr(`data-src`));
		let imgSrc=await imgData.read();
		curImgEl.attr(`src`,imgSrc);
	}
}


window.onload=function(){
	main();
}