// inject event listener into page
$(document).ready(function(){
	document.onkeydown = content.handleKeyDown;
});

var content = {};

content.handleKeyDown = function(e) {
 var ctrlPressed=0;
 var shiftPressed=0;

 var evt = (e==null ? event:e);

 ctrlPressed = evt.ctrlKey;
 shiftPressed = evt.shiftKey;

 if (ctrlPressed && shiftPressed && evt.keyCode==75) {
	chrome.runtime.sendMessage('kill')
	// dispatch kill event to background script
 }
}