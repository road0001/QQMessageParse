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
	htmlFiles.sort();
	$(`title`).html(`${title} - ${name}`);
	for(let i=0; i<htmlFiles.length; i++){
		let curHtml=htmlFiles[i].replaceAll(`${messagePath}/`,``).replaceAll(`.html`,``);
		if(i==0){
			$(`#mainFrame`).attr(`src`,`${messagePath}/${curHtml}.html`);
		}
		if(curHtml!=`index`){
			$(`#dateSelector`).append(`<button id="date_${i}" class="dateBu">${curHtml}</button>`);
			if(i==0){
				$(`#date_${i}`).addClass(`selected`);
			}
			$(`#date_${i}`).bind(`click`,{date:curHtml},function(e){
				$(`#mainFrame`).attr(`src`,`${messagePath}/${e.data.date}.html`);
				$(`.dateBu`).removeClass(`selected`);
				$(this).addClass(`selected`);
			});
		}
	}
	showHome(false);
}

async function main(){
	$(`title`).html(title);
	$(`.messageTitle`).html(title);
	let htmlFolders=getAllFolders(`./${messageFolder}/`);
	htmlFolders.sort();
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