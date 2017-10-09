/*//////////////////////////////////////////////////
This code is injected into all webpages when the extension is enabled.
Listens for key events and compares them with saved keyboard shortcuts,
sending a message to background.js when a keyboard shortcut is recognized.
*///////////////////////////////////////////////////



// inject event listener into page
$(document).ready(function(){
	document.onkeydown = content.handleKeyDown;
	document.onkeyup = content.handleKeyUp;

	window.addEventListener('focus', function(event){
		content.setAllKeysToFalse()
	})

	// get array of keyboard shortcuts from chrome.storage.sync
	chrome.storage.sync.get('shortcuts',function(obj){
		content.shortcuts = obj.shortcuts;
	})

	//logging the complete storage for debug purposes
	chrome.storage.sync.get(null, function(obj){
		//console.log(obj);
	})
});

var content = {};

content.handleKeyDown = function(e) {
	var code = e.which;
	// in case numpad is used, translate to primary number keys
	if(code>=96 && code<=105){
		code = code - 48;
	}
	var key = content.keycodes[code];
	if(key != undefined && !key.pressed){
		key.pressed = true;

		content.checkShortcuts();
	};
}

content.handleKeyUp = function(e) {
	var code = e.which;
	// in case numpad is used, translate to primary number keys
	if(code>=96 && code<=105){
		code = code - 48;
	}
	var key = content.keycodes[code];
	if(key != undefined)
		key.pressed = false;
}

content.checkShortcuts = function() {
	for (var key in content.shortcuts){
		//console.log(content.shortcuts);
		shortcut = content.shortcuts[key];

		if(content.checkShortcutCondition(shortcut)){
			chrome.runtime.sendMessage({msg: shortcut.name})
		}
	}
}

content.checkShortcutCondition = function(shortcut) {
	var condition = shortcut.condition;
	var conditionMet = false;
	for(i=0; i<condition.length; i++){
		if(content.keycodes[condition[i]].pressed){
			conditionMet = true;
		} else {
			conditionMet = false;
			return conditionMet;
		}
	}
	return conditionMet;
}

content.setAllKeysToFalse = function(){
	for(var key in content.keycodes){
		content.keycodes[key].pressed = false;
	}
}

content.keycodes = {
	9: {
		key: "tab",
		pressed: false
	},
	16: {
		key: "shift",
		pressed: false
	},
	17: {
		key: "ctrl",
		pressed: false
	},
	18: {
		key: "alt",
		pressed: false
	},
	27: {
		key: "esc",
		pressed: false
	},
	32: {
		key: "space",
		pressed: false
	},
	48: {
		key: "0",
		pressed: false
	},
	49: {
		key: "1",
		pressed: false
	},
	50: {
		key: "2",
		pressed: false
	},
	51: {
		key: "3",
		pressed: false
	},
	52: {
		key: "4",
		pressed: false
	},
	53: {
		key: "5",
		pressed: false
	},
	54: {
		key: "6",
		pressed: false
	},
	55: {
		key: "7",
		pressed: false
	},
	56: {
		key: "8",
		pressed: false
	},
	57: {
		key: "9",
		pressed: false
	},
	65: {
		key: "a",
		pressed: false
	},
	66: {
		key: "b",
		pressed: false
	},
	67: {
		key: "c",
		pressed: false
	},
	68: {
		key: "d",
		pressed: false
	},
	69: {
		key: "e",
		pressed: false
	},
	70: {
		key: "f",
		pressed: false
	},
	71: {
		key: "g",
		pressed: false
	},
	72: {
		key: "h",
		pressed: false
	},
	73: {
		key: "i",
		pressed: false
	},
	74: {
		key: "j",
		pressed: false
	},
	75: {
		key: "k",
		pressed: false
	},
	76: {
		key: "l",
		pressed: false
	},
	77: {
		key: "m",
		pressed: false
	},
	78: {
		key: "n",
		pressed: false
	},
	79: {
		key: "o",
		pressed: false
	},
	80: {
		key: "p",
		pressed: false
	},
	81: {
		key: "q",
		pressed: false
	},
	82: {
		key: "r",
		pressed: false
	},
	83: {
		key: "s",
		pressed: false
	},
	84: {
		key: "t",
		pressed: false
	},
	85: {
		key: "u",
		pressed: false
	},
	86: {
		key: "v",
		pressed: false
	},
	87: {
		key: "w",
		pressed: false
	},
	88: {
		key: "x",
		pressed: false
	},
	89: {
		key: "y",
		pressed: false
	},
	90: {
		key: "z",
		pressed: false
	},
	112: {
		key: "f1",
		pressed: false
	},
	113: {
		key: "f2",
		pressed: false
	},
	114: {
		key: "f3",
		pressed: false
	},
	115: {
		key: "f4",
		pressed: false
	},
	116: {
		key: "f5",
		pressed: false
	},
	117: {
		key: "f6",
		pressed: false
	},
	118: {
		key: "f7",
		pressed: false
	},
	119: {
		key: "f8",
		pressed: false
	},
	120: {
		key: "f9",
		pressed: false
	},
	121: {
		key: "f10",
		pressed: false
	},
	122: {
		key: "f11",
		pressed: false
	},
	123: {
		key: "f12",
		pressed: false
	},
	186: {
		key: ";",
		pressed: false
	},
	187: {
		key: "=",
		pressed: false
	},
	188: {
		key: ",",
		pressed: false
	},
	189: {
		key: "-",
		pressed: false
	},
	190: {
		key: ".",
		pressed: false
	},
	191: {
		key: "/",
		pressed: false
	},
	192: {
		key: "`",
		pressed: false
	},
	219: {
		key: "[",
		pressed: false
	},
	220: {
		key: "\\",
		pressed: false
	},
	221: {
		key: "]",
		pressed: false
	},
	222: {
		key: "'",
		pressed: false
	}
}
