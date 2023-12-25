// let imgDataObj={};
let messagePath;
let imgDataMap=new Map();
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

let dateDataArr=[];
async function loadDate(name){
	return new Promise((resolve, reject)=>{
		fs.readFile(name, `utf-8`, (err, data)=>{
			if (err) {
				reject(err);
			}
			dateDataArr=JSON.parse(data);
			resolve(dateDataArr);
		});
	});
}

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

function showImg(bool, src, dataSrc){
	$(`.showImgBG`).remove();
	if(bool==true){
		$(`body`).append(`<div class="showImgBG"><table class="showImgTable"><tr><td><img class="showImg" src="${src}" data-src="${dataSrc}"></td></tr></table></div>`);
		$(`.showImgBG`).bind(`click`,function(){
			showImg(false);
		});
		$(`.showImg`).bind(`contextmenu`,function(e){
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
	}
}

async function main(){
	let pathSplit=window.location.pathname.split(`/`);
	pathSplit.shift();
	pathSplit.pop();
	messagePath=decodeURIComponent(pathSplit.join(`/`));

	await Promise.all([
		loadConfig(`${messagePath}/imgdata.json`),
		loadDate(`${messagePath}/date.json`),
	])

	//日期选择列表
	$(`body`).append(`<div id="dateSelector" class="dateSelector"></div>`);
	for(let i=0; i<dateDataArr.length; i++){
		let curDate=dateDataArr[i];
		let curDateSplit=curDate.split(`-`);
		let curMonth=`${curDateSplit[0]}-${curDateSplit[1]}`;
		if(window.location.pathname.includes(curMonth)){
			let curDateFormat=new Date(curDate).format(`yyyy-MM-dd 星期w`);
			$(`#dateSelector`).append(`<button id="dateBu_${curDate}" class="dateBu">${curDateFormat}</button>`);
			if(i==0){
				$(`#dateBu_${curDate}`).addClass(`selected`);
			}
			$(`#dateBu_${curDate}`).bind(`click`,{curDate:curDate},function(e){
				window.location.href=`#dateStr_${e.data.curDate}`;
				setTimeout(()=>{
					$(`.dateBu`).removeClass(`selected`);
					$(this).addClass(`selected`);
				},50);
			});
		}
	}
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

	//图片选择列表
	let imgObserver = new IntersectionObserver(
		(changes) => {
			changes.forEach(async (change) => {
				if (change.intersectionRatio > 0) {
					let img = change.target;
					let imgData=new ReadImg(img.dataset.src);
					img.src = await imgData.read();
					imgObserver.unobserve(img);

					// img.addEventListener(`contextmenu`,(e)=>{
					// 	e.preventDefault();
					// 	let imageData=imgData.getData();
					// 	console.log(imageData);
					// 	let imageName=imageData.name.replaceAll(`.dat`,``);
					// 	let imageType=imageData.type.split(`/`)[1];
					// 	let image = document.createElement('a');
					// 	image.href = img.src;
					// 	image.download = `${imageName}.${imageType}`;
					// 	image.click();
					// })
				}
			})
		}
	)
	getTag('img').forEach((item) => {
		imgObserver.observe(item);
	});
	$(`img`).bind(`click`,function(){
		showImg(true,$(this).attr(`src`),$(this).attr(`data-src`));
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
}


window.onload=function(){
	main();
}