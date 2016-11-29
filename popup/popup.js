var popup = {};
popup.object = {};
popup.ids = []
popup.lastLaunch = [];

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

	chrome.storage.sync.get('kill',function(obj){
		popup.ids = obj.kill;
		if(obj.lastLaunch){
			popup.lastLaunch = obj.lastLaunch;
		}
	});
});



// populate dropdown list with saved profiles
popup.populate = function(){
	chrome.storage.sync.get('settings',function(obj){
		popup.object = obj.settings;
		$.each(popup.object,function(index,value){
			prf = JSON.parse(value).name
			$('#profiles').append('<option value="'+prf+'">'+prf+'</option>');
		});
	});
}

// open a saved presentation on "Launch" click
popup.launch = function(){
	profileName = $('#profiles').val();
	data = JSON.parse(popup.object[profileName]);


	popup.lastLaunch.push(parseInt(data.mon));
	
	var w = screen.width;
	var h = screen.height;
	
	var left_0 = data.ctl[1];
	var top_0 = data.ctl[0];

	var windowsOpened = 0;
	
	$(data.loc).each(function(index,value){
		url_string = data.url[index];
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

				if(windowsOpened == data.mon){
					popup.storeIDs();
				}
			}
		)
	});
	
	
}

// as windows are opened, save window ids to an array
popup.storeIDs = function(){
	chrome.storage.sync.set(
	{
		'kill':popup.ids,
		'lastLaunch':popup.lastLaunch
	})
	console.log(popup.ids);
	console.log(popup.lastLaunch);
}

// on "Close" click, access array of saved windows ids
popup.getLastIds = function(){
	chrome.storage.sync.get('kill',function(obj){
		popup.ids = obj.kill;
		chrome.storage.sync.get('lastLaunch',function(obj){
			popup.lastLaunch = obj.lastLaunch;
			popup.killLast();

		})
		
	
	});
}

popup.getAllIds = function(){
	chrome.storage.sync.get('kill',function(obj){
		popup.ids = obj.kill;
		popup.kill();
		
		})
	};
	


// iterate through window ids and close each one
popup.kill = function(){
	$.each(popup.ids, function(index,value){
		try {
			chrome.windows.remove(value);
		}
		catch(err){
			console.log('Window with id '+value+' already closed')
		}
	});	

	popup.ids = [];
	popup.lastLaunch = [];
	popup.storeIDs();

}

popup.killLast = function(){
	var k = popup.lastLaunch.pop();
	var n = popup.ids.length;
	for (var i = n-1; i >= n-k; i--){
		chrome.windows.remove(popup.ids[i])
		popup.ids.pop();

		if(i == n-k){
			popup.storeIDs();
		}
	}


}



