var background = {};
background.object = {};
background.ids = [];
background.lastLaunchArray = [];

// listening for message events from content script
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	var msg = message.msg

	switch(msg){
		case("closeAll"):
			background.closeAll();
			break;

		case("closeLast"):
			background.closeLast();
			break

		case("launch"):
			background.launch(JSON.parse(message.profileData));
			break

		case("init"):
			background.getIDs();
			break

		default:
			background.accessProfileToLaunch(msg);
	}

})


background.accessProfileToLaunch = function(profileName) {
	chrome.storage.sync.get('settings', function(obj){
		var profileData = JSON.parse(obj.settings[profileName]);
		background.launch(profileData);
	})
}

background.launch = function(profileData){

	profileName = profileData.n
	var w = screen.width;
	var h = screen.height;
	var left_0 = profileData.t[1];
	var top_0 = profileData.t[0];

	var windowsOpened = 0;

	$(profileData.l).each(function(index,value){
		var url_string = profileData.u[index];
		if(url_string == '' || url_string == undefined) {
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
				background.ids.push(newWindow.id);
				chrome.windows.update(newWindow.id,{state:"fullscreen"});
				windowsOpened ++;
				if(windowsOpened == profileData.m){
					background.lastLaunchArray.push(profileData.m);
					background.storeIDs(background.ids, profileData.m);
				}

				//Close a blank window to keep screen clear
				if(url_string == 'chrome://newtab')
				{
					chrome.windows.remove(newWindow.id);
				}
			}
		)
	});
}

background.getIDs = function(){
	chrome.storage.sync.get('kill',function(obj){
		if(obj.kill){
			background.ids = obj.kill
		} else {
			background.ids = [];
		}
	})

	chrome.storage.sync	.get('lastLaunch',function(obj){
		if(obj.lastLaunch){
			background.lastLaunchArray = obj.lastLaunch;
		} else {
			background.lastLaunchArray = [];
		}
	})
}

// as windows are opened, save window ids to an array
background.storeIDs = function(ids, lastLaunch){
	chrome.storage.sync.set(
	{
		'kill': background.ids,
		'lastLaunch': background.lastLaunchArray
	})
}

// on "Close" click, access array of saved windows ids

background.closeAll = function(){
	chrome.storage.sync.get('kill',function(obj){
		background.ids = obj.kill;
		background.kill();
		})
	};

background.closeLast = function(){

	chrome.storage.sync.get('kill',function(obj){
		background.ids = obj.kill;
		chrome.storage.sync.get('lastLaunch',function(obj){
			background.lastLaunchArray = obj.lastLaunch;
			background.killLast();
		})
	});
}

// iterate through window ids and close each one
background.kill = function(){
	$.each(background.ids, function(index,value){
		chrome.windows.remove(value, function () {
			if(chrome.runtime.lastError)
				console.warn("Warning, but that's ok:", chrome.runtime.lastError);
		});
	});

	background.ids = [];
	background.lastLaunchArray = [];
	background.storeIDs(background.ids, background.lastLaunchArray);
}

background.killLast = function(){
	var k = background.lastLaunchArray.pop();
	var n = background.ids.length;

	for (var i = n-1; i >= n-k; i--){
			chrome.windows.remove(background.ids[i], function () {
				if(chrome.runtime.lastError)
					console.warn("Warning, but that's ok:", chrome.runtime.lastError);
			});

		background.ids.pop();

		if(i == n-k){
			background.storeIDs(background.ids, background.lastLaunchArray);
		}
	}
}
