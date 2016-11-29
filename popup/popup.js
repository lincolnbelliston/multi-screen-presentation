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


});



// populate dropdown list with saved profiles
popup.populate = function(){
	chrome.storage.sync.get('settings',function(obj){
		popup.object = obj.settings;
		$.each(popup.object,function(index,value){
			prf = JSON.parse(value).profileName;
			$('#profiles').append('<option value="'+prf+'">'+prf+'</option>');
		});
	});
}

// open a saved presentation on "Launch" click
popup.launch = function(){
	popup.getIDs();

	profileName = $('#profiles').val();
	data = JSON.parse(popup.object[profileName]);

	

	var w = screen.width;
	var h = screen.height;
	
	var left_0 = data.controlMonitorLocation[1];
	var top_0 = data.controlMonitorLocation[0];

	var windowsOpened = 0;
	
	$(data.monitorLocationArray).each(function(index,value){
		url_string = data.urlArray[index];
		if(url_string == '') {
			url_string = 'chrome://newtab';
		} else if(!(/http/).test(url_string)){
			url_string = 'https://' + url_string;
		}
		
		var left_x = value[1];
		var top_y = value[0];
		
		var x = Math.round(Number(w*(left_x - left_0)));
		if(x == -0){left = 0};
		var y = Math.round(Number(h*(top_y - top_0)));
		if(y == -0){y = 0}

		
		chrome.windows.create({url: url_string,left:x,top:y,focused:false},
			function(newWindow){
				popup.ids.push(newWindow.id);
				chrome.windows.update(newWindow.id,{state:"fullscreen"});
				windowsOpened ++;
				if(windowsOpened == data.numberOfMonitors){
					popup.storeIDs(popup.ids, data.numberOfMonitors);
				}
				
			}
		)

		
	});
	
	
}


popup.storeIDs = function(ids, lastLaunch){
	popup.lastLaunchArray.push(parseInt(lastLaunch));	
	chrome.runtime.sendMessage({
		msg: "storeIDs",
		ids: ids,
		lastLaunch: popup.lastLaunchArray
	});
}

popup.getIDs = function(){
	chrome.storage.sync.get('kill',function(obj){
		if(obj.kill){
			popup.ids = obj.kill
		} else {
			popup.ids = [];
		}
	})

	chrome.storage.sync	.get('lastLaunch',function(obj){
		if(obj.lastLaunch){
			popup.lastLaunchArray = obj.lastLaunch;
		} else {
			popup.lastLaunchArray = [];
		}
	})
}


popup.getAllIds = function(){
	chrome.runtime.sendMessage({msg: "getAllIds"})
}	

popup.getLastIds = function(){
	chrome.runtime.sendMessage({msg: "getLastIds"})
}



