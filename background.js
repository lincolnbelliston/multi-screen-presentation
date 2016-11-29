// close windows on "ctrl-shift-k" event

// listening for 'kill' event from content script
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	var msg = message.msg

	switch(msg){
		case("storeIDs"):
			background.storeIDs(message.ids, message.lastLaunch);
			break;

		case("getAllIds"):
			background.getAllIds();
			break;

		case("getLastIds"):
			background.getLastIds();
			break

		default:
			console.log("Unknown message recieved");
	}
	
})

var background = {};

// as windows are opened, save window ids to an array
background.storeIDs = function(ids, lastLaunch){
	background.ids = ids;
	background.lastLaunch = lastLaunch;
	chrome.storage.sync.set(
	{
		'kill': background.ids,
		'lastLaunch': background.lastLaunch
	})
}

// on "Close" click, access array of saved windows ids

background.getAllIds = function(){
	chrome.storage.sync.get('kill',function(obj){
		background.ids = obj.kill;
		background.kill();
		
		})
	};
	
background.getLastIds = function(){

	chrome.storage.sync.get('kill',function(obj){
		background.ids = obj.kill;
		chrome.storage.sync.get('lastLaunch',function(obj){
			background.lastLaunch = obj.lastLaunch;
			background.killLast();

		})
		
	
	});
}

// iterate through window ids and close each one
background.kill = function(){
	$.each(background.ids, function(index,value){
		try {
			chrome.windows.remove(value);
		}
		catch(err){
			console.log('Window with id '+value+' already closed.')
		}
	});	

	background.ids = [];
	background.lastLaunch = [];
	background.storeIDs(background.ids, background.lastLaunch);

}

background.killLast = function(){
	console.log(background.lastLaunch);
	var k = background.lastLaunch.pop();
	var n = background.ids.length;
	

	for (var i = n-1; i >= n-k; i--){
		try{
			chrome.windows.remove(background.ids[i])
		}
		catch(err){
			console.log('Window with id '+background.ids[i]+' already closed.')
		}

		background.ids.pop();

		if(i == n-k){
			background.storeIDs(background.ids, background.lastLaunch);
		}
	}


}