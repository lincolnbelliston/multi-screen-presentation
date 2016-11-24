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
	document.querySelector('#kill').addEventListener('click',popup.getIds);
});


var popup = {};
popup.object = {};
popup.ids = []

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
	popup.ids=[];
	
	var w = screen.width;
	var h = screen.height;
	
	var left_0 = data.ctl[1];
	var top_0 = data.ctl[0];
	
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
		
		console.log(x,y)

		chrome.windows.create({url: url_string,left:x,top:y,focused:false},
			function(newWindow){
				console.log(newWindow.id);
				popup.ids.push(newWindow.id);
				chrome.windows.update(newWindow.id,{state:"fullscreen"})
				popup.storeIds();
			}
		)
	});
	
	
	

		

	
}

// as windows are opened, save window ids to an array
popup.storeIds = function() {
	chrome.storage.sync.set(
		{
			'kill':popup.ids
		});
	};

// on "Close" click, access array of saved windows ids
popup.getIds = function(){
	chrome.storage.sync.get('kill',function(obj){
		popup.ids = obj.kill;
		popup.kill()
	});
}

// iterate through window ids and close each one
popup.kill = function(){
	$.each(popup.ids, function(index,value){
		chrome.windows.remove(value);
	});	
}

