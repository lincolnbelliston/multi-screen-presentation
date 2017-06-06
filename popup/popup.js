var popup = {};
popup.object = {};
popup.ids = []
popup.lastLaunchArray = [];


$(document).ready(function(){

	popup.populate();
	document.querySelector('#go-to-options').addEventListener('click',function() {
	  if (chrome.runtime.openOptionsPage) {
		// New way to open options pages, if supported (Chrome 42+).
		chrome.runtime.openOptionsPage();
	  } else {
		// Reasonable fallback.
		window.open(chrome.runtime.getURL('options.html'));
	  }
	});
	document.querySelector('#launch').addEventListener('click',popup.launch);
	document.querySelector('#kill').addEventListener('click', popup.getAllIds);

	document.querySelector('#kill-last').addEventListener('click', popup.getLastIds);

	popup.getIDs();

	chrome.runtime.sendMessage({msg: "init"});
});


// populate dropdown list with saved profiles
popup.populate = function(){
	chrome.storage.sync.get('settings',function(obj){
		popup.object = obj.settings;
		$.each(popup.object,function(index,value){
			prf = JSON.parse(value).n;
			$('#profiles').append('<option value="'+prf+'">'+prf+'</option>');
		});
	});
}

// open a saved presentation on "Launch" click
popup.launch = function(){
	profileName = $('#profiles').val();
	chrome.runtime.sendMessage({
		msg: 'launch',
		profileData: popup.object[profileName]

	})
}



popup.getIDs = function(){
	chrome.storage.sync.get('kill',function(obj){
		if(obj.kill){
			popup.ids = obj.kill
		} else {
			popup.ids = [];
		}
	})

	chrome.storage.sync.get('lastLaunch',function(obj){
		if(obj.lastLaunch){
			popup.lastLaunchArray = obj.lastLaunch;
		} else {
			popup.lastLaunchArray = [];
		}
	})
}


popup.getAllIds = function(){
	chrome.runtime.sendMessage({msg: "closeAll"})
}

popup.getLastIds = function(){
	chrome.runtime.sendMessage({msg: "closeLast"})
}
