let title=`Message Viewer`;
let messageFolder=`messages`;

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
	$(`.messageSelector`).animate({
		opacity:0,
	},250,()=>{
		$(`.messageSelector`).css(`display`,`none`);
	});
}

async function main(){
	$(`title`).html(title);
	$(`.messageTitle`).html(title);
	let htmlFolders=getAllFolders(`./${messageFolder}/`);
	htmlFolders.sort();
	for(let i=0; i<htmlFolders.length; i++){
		let curFolder=htmlFolders[i].replaceAll(`${messageFolder}/`,``);
		$(`#messageSelector`).append(`<button id="folder_${i}" class="messageBu">${curFolder}</button>`);
		$(`#folder_${i}`).bind(`click`,{folder:curFolder},function(e){
			showMessage(e.data.folder);
		})
	}

	$(`#backBu`).bind(`click`,function(){
		$(`title`).html(title);
		$(`.messageSelector`).css(`opacity`,0);
		$(`.messageSelector`).css(`display`,``);
		$(`.messageSelector`).animate({
			opacity:1,
		},250);
	})
}

window.onload=function(){
	main();
}