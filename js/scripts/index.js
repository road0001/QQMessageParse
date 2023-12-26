let title=`QQ消息查看器`;
let notice={
	empty:`消息列表为空！`,
}
let messageFolder=`messages`;

async function showHome(bool){
	if(bool==undefined || bool==true){
		$(`title`).html(title);
		$(`.backBu`).css(`opacity`,0);
		$(`.messageSelector`).css(`display`,``);
		if(bool!=undefined){
			$(`.messageSelector`).css(`opacity`,0);
			$(`.messageSelector`).animate({
				opacity:1,
			},250);
		}
	}else{
		$(`.backBu`).css(`opacity`,1);
		$(`.messageSelector`).animate({
			opacity:0,
		},250,()=>{
			$(`.messageSelector`).css(`display`,`none`);
		});
	}
}

async function showMessage(name){
	$(`#dateSelector`).html(``);
	$(`#mainFrame`).attr(`src`,``);
	let messagePath=`${messageFolder}/${name}`;
	let htmlFiles=getAllFiles(`./${messagePath}/`,`html`);
	htmlFiles.sort((a, b)=>{return a.localeCompare(b)});
	let messageFilesList=[];
	$(`title`).html(`${title} - ${name}`);
	for(let i=0; i<htmlFiles.length; i++){
		let curHtml=htmlFiles[i].replaceAll(`${messagePath}/`,``).replaceAll(`.html`,``);
		let curHtmlPath=`${messagePath}/${curHtml}.html`;
		if(i==0){
			$(`#mainFrame`).attr(`src`,curHtmlPath);
		}
		if(curHtml!=`index`){
			messageFilesList.push({key:curHtml,path:curHtmlPath});
			$(`#dateSelector`).append(`<button id="dateBu_${curHtml}" class="dateBu">${curHtml}</button>`);
			if(i==0){
				$(`#dateBu_${curHtml}`).addClass(`selected`);
			}
			$(`#dateBu_${curHtml}`).bind(`click`,{date:curHtml},function(e){
				changePage(messagePath, curHtml);
			});
		}
	}
	loadMessageHtmlContents(messageFilesList);
	if(global.searchText){
		waitPageLoaded().then(()=>{
			$(`#mainFrame`)[0].contentWindow.$(`#searchInput`).val(global.searchText);
			$(`#mainFrame`)[0].contentWindow.applySearch(global.searchText);
			global.applyGlobalSearch(global.searchText);
		});
	}
	showHome(false);
}

function changePage(path, page){
	$(`#mainFrame`).attr(`src`,`${path}/${page}.html`);
	$(`.dateBu`).removeClass(`selected`);
	$(`#dateBu_${page}`).addClass(`selected`);
	if(global.searchText){
		waitPageLoaded().then(()=>{
			$(`#mainFrame`)[0].contentWindow.$(`#searchInput`).val(global.searchText);
			$(`#mainFrame`)[0].contentWindow.applySearch(global.searchText);
			global.applyGlobalSearch(global.searchText);
		});
	}
}

async function loadMessageHtmlContents(list){
	if(typeof list==`object` && list.length!=undefined){
		global.messageHtmlContentsLoaded=false;
		global.messageHtmlContents=[];
		for(let i=0; i<list.length; i++){
			let curFile=list[i];
			let htmlContent=await readFile(curFile.path);
			curFile.content=htmlContent.replace(/<[^>]+>/g, ``);
			global.messageHtmlContents.push(curFile);
		}
		global.messageHtmlContentsLoaded=true;
	}
}

global.applyGlobalSearch=function(text){
	global.searchText=text;
	$(`.dateBu`).removeClass(`highlight`);
	if(text!=`` && global.messageHtmlContents && global.messageHtmlContents.length && global.messageHtmlContentsLoaded==true){
		for(let i=0; i<global.messageHtmlContents.length; i++){
			let curHtml=global.messageHtmlContents[i];
			if(curHtml.content.includes(text)){
				$(`#dateBu_${curHtml.key}`).addClass(`highlight`);
			}
		}
	}
}

let wplInterval;
async function waitPageLoaded(){
	return new Promise((resolve, reject)=>{
		console.log(`Wait Page  Load...`);
		wplInterval=setInterval(()=>{
			try{
				let pageWindow=$(`#mainFrame`)[0].contentWindow;
				if(pageWindow){
					if(pageWindow.isLoadCompleted()){
						clearInterval(wplInterval);
						console.log(`Page Loaded.`);
						resolve();
					}
				}
			}catch(e){}
		},100);
	})
}

async function main(){
	$(`title`).html(title);
	$(`.messageTitle`).html(title);
	let htmlFolders=getAllFolders(`./${messageFolder}/`);
	htmlFolders.sort((a, b)=>{return a.localeCompare(b)});
	if(htmlFolders.length==0){
		$(`#messageSelector`).append(`<h2 class="messageNotice">${notice.empty}</h2>`);
	}else{
		for(let i=0; i<htmlFolders.length; i++){
			let curFolder=htmlFolders[i].replaceAll(`${messageFolder}/`,``);
			$(`#messageSelector`).append(`<button id="folder_${i}" class="messageBu">${curFolder}</button>`);
			$(`#folder_${i}`).bind(`click`,{folder:curFolder},function(e){
				showMessage(e.data.folder);
			})
		}
	}

	$(`#backBu`).bind(`click`,function(){
		showHome(true);
	});
	showHome();
}

window.onload=function(){
	main();
}