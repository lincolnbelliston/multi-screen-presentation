// close windows on "ctrl-k" event

// listening for 'kill' event from content script
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	background.getIds();
})

var background = {};

background.getIds = function(){
	chrome.storage.sync.get('kill',function(obj){
		ids = obj.kill;
		background.kill()
	});
}

background.kill = function(){
	$.each(ids, function(index,value){
		chrome.windows.remove(value);
	});
}