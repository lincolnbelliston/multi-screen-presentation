$(document).ready(function(){
	//chrome.storage.sync.clear();
	options.convertProfilesToNewNamingScheme();

	$('#profile-settings').hide();
	$('#shortcuts').hide();
	options.add_to_list = true;
	options.currMon = 1;
	options.gridColumns = 1;
	options.gridRows = 1;
	options.numberOfMonitors = 1;
	options.locations = [];
	options.curr_profile = {};
	options.currentShortcuts = {};

    $('[data-toggle="tooltip"]').tooltip();
	options.populate();

	// set up listeners for page events
	document.querySelector('#edit').addEventListener('change',function(profileName,isnew){
		existing = $('select[id=edit]').val();
		options.edit(existing,false)
	});
	document.querySelector('#new').addEventListener('click',function(profileName,isnew){
		options.edit("New profile",true)
	});
	document.querySelector('#save').addEventListener('click',options.save);
	document.querySelector('#refresh').addEventListener('click',options.refresh);
	document.querySelector('#delete').addEventListener('click',options.deleteProfile)
	document.querySelector('#cancel').addEventListener('click',options.cancel);
	document.querySelector('#monNum').addEventListener('change',options.urlField);
	document.querySelector('#name').addEventListener('change',function(){options.add_to_list = true});
	document.querySelector('#row').addEventListener('change',options.gridY);
	document.querySelector('#col').addEventListener('change',options.gridX);
	document.querySelector('#monGrid').addEventListener('click',options.clickGrid);
	document.querySelector('#monGrid').addEventListener('dblclick',options.clickCtrl);
	document.querySelector('#clear').addEventListener('click',options.clear);
	document.querySelector('#back').addEventListener('click',options.back);
	document.querySelector('#help').addEventListener('click',options.help);
	document.querySelector('#shortcut-button').addEventListener('click',options.shortcuts);
	document.querySelector('#done').addEventListener('click',options.cancel);
	document.querySelector('#new-shortcut').addEventListener('click',options.addShortcut);

	var editShorcutButtons = document.querySelectorAll('.edit-shortcut-button')
	for (var i=0; i<editShorcutButtons.length; i++){
		editShorcutButtons[i].addEventListener('click', function(shortcutName){
			options.editShortcut();
		})
	}




});

var options = {};

options.help = function(){
	var help = 'Each grid square represents a monitor. Expand the grid to the desired dimensions, then click a sequence of squares corresponding to the location of the presentation monitors. Then double click the square corresponding to the control monitor (the monitor containing the Start menu).'
	chrome.extension.getBackgroundPage().alert(help);
}

// load keyboad view and add event listeners to its components
options.editShortcut = function(shortcutName){
	$(event.target).parent().parent().parent().children().last().load('keyboard/keyboard.html',function(){
		var keyboardRows = document.querySelectorAll('.keyboard-row');
		for (var i=0; i<keyboardRows.length; i++){
			keyboardRows[i].addEventListener('click', options.keyboardClick);
		}

		var saveEditShortcutButtons = document.querySelectorAll('.save-edit-shortcut');
		var cancelEditShortcutButtons = document.querySelectorAll('.cancel-edit-shortcut');
		for (var i=0; i<saveEditShortcutButtons.length; i++){
			saveEditShortcutButtons[i].addEventListener('click',options.saveEditShortcut);
			cancelEditShortcutButtons[i].addEventListener('click',options.cancelEditShortcut);
		}

		// recover settings from chrome.storage.sync here
	});

}

options.cancelEditShortcut = function() {
	$(event.target).parent().parent().parent().remove();
}

options.saveEditShortcut = function() {
	// store settings in chrome.storage.sync

	var keyboardElements = $('td.keyboard-element');
	var selectedKeys = [];
	for (var i=0; i<keyboardElements.length; i++){
		var key = keyboardElements[i];
		if($(key).attr('bold')=="true"){
			selectedKeys.push($(key).attr('data-keyvalue'));
		}
	}

	var nameOfShortcutToSave = "closeLast";
	var shortcutToSave = {
		name: nameOfShortcutToSave,
		condition: selectedKeys
	}
	chrome.storage.sync.get('shortcuts',function(obj){
		if(obj.shortcuts){
			options.currentShortcuts = obj.shortcuts;
		}
		options.currentShortcuts[nameOfShortcutToSave] = shortcutToSave;
		chrome.storage.sync.set(
		{
			'shortcuts': options.currentShortcuts
		});
	});

	options.cancelEditShortcut();
}


options.keyboardClick = function(event){
	if(event.target !== event.currentTarget){
		var clickedItem = event.target;

		if($(clickedItem).attr('bold') == 'false'){
			$(clickedItem).attr('bold',true)
		} else if($(clickedItem).attr('bold')){
			$(clickedItem).attr('bold',false)
		}

	}
	event.stopPropagation();
}


options.gridY = function(){

	var r = options.gridRows

	var rowStr = "";
	for(var k=0; k<options.gridColumns; k++){
		rowStr = rowStr.concat('<td class="monitor-grid-element" data-row='+r+' data-col='+k+'></td>');
	}

	var row = Number(document.getElementById('row').value);
	if (row>r){
		for (var j=r; j<row; j++){
			$('#monGrid').append('<tr class="monitor-grid-row">'+rowStr+'</tr>');
			r = ++r;
		}
	} else{
		var j = $('tr.monitor-grid-row').length
		for (j; j>row; j--){
			$('tr.monitor-grid-row').last().remove();
			r = --r;
		}
	}
	options.gridRows = row;

}

options.gridX = function(){
	var c = options.gridColumns
	var r = options.gridRows

	var col = Number(document.getElementById('col').value);
	if (col>c){
		for (var j=c; j<col; j++){
			$('tr.monitor-grid-row').each(function(index,value){
				$(value).append('<td class="monitor-grid-element" data-row='+(index)+' data-col='+j+' bold=false></td>');
			});
		}
	} else{
		var j = $('td.monitor-grid-element[data-row="0"]').length
		for (j; j>col; j--){
			$('tr.monitor-grid-row').each(function(index,value){
				$(value).children().last().remove();
			})
		}
	}
	options.gridColumns = col;

}


options.clickGrid = function(event){
	if(event.target !== event.currentTarget){
		var clickedItem = event.target;
		var monNum = Number($('#monNum').val())

		if (options.currMon <= monNum){
			if($(clickedItem).attr('bold') == 'false'){
				$(clickedItem).attr('bold',true).html(options.currMon)
				options.currMon = ++options.currMon
			}
		}
	}
	event.stopPropagation();
}

options.clickCtrl = function() {
	options.alreadyClicked = true;
	if(event.target !== event.currentTarget){
		var dblClicked;
		dblClicked = event.target;
		$('td.monitor-grid-element[clicked=true]').attr('clicked',false);

		$(dblClicked).attr('clicked',true);
	}
	event.stopPropagation();
}

options.clear = function(){
	$('td.monitor-grid-element').attr('bold',false).attr('clicked',false).html('');
	options.currMon = 1;

}

options.back = function(){
	$('td.monitor-grid-element:contains("'+(options.currMon-1)+'")').attr('bold',false).html('');
	if (options.currMon > 1){
		options.currMon = --options.currMon;
	};
}


// populate dropdown list with saved profiles
options.populate = function(){
	$('#edit').html('');
	options.profile_names = [];
	chrome.storage.sync.get('settings',function(obj){
		options.object = obj.settings;
		if (options.object == undefined){
			chrome.storage.sync.set({
				'settings':{}
			});
		} else {
		$.each(options.object,function(index,value){
			prf = JSON.parse(value).profileName
			options.profile_names.push(prf);
			$('#edit').append('<option value="'+prf+'">'+prf+'</option>');
		});
		$('#edit').val('none');
		}
	});
}


// edit a saved profile
options.edit = function(profileName,isnew) {
	$('#name').val(profileName);
	$('#main-menu').hide();
	$('#profile-settings').show();
	$('#delete').attr('disabled',true)
	options.alreadyClicked = false;

	if(isnew==false){
		// retrieve settings and populate fields;
		options.alreadyClicked = true;
		$('#delete').attr('disabled',false)
		options.add_to_list = false
		chrome.storage.sync.get('settings',function(obj){
			var object = JSON.parse(obj.settings[profileName]);
			$('#name').val(object.profileName);
			$('#monNum').val(object.numberOfMonitors);
			$('#row').val(object.gridRows);
			$('#col').val(object.gridColumns);
			options.gridY();
			options.gridX();
			$(object.monitorLocationArray).each(function(index,value){
				var numberOfMonitors = $('td.monitor-grid-element[data-row='+value[0]+'][data-col='+value[1]+']');
				$(numberOfMonitors).attr('bold',true).html(value[2]);
				options.currMon = Number(value[2]) + 1;
			});
			var c = $('td.monitor-grid-element[data-row='+object.controlMonitorLocation[0]+'][data-col='+object.controlMonitorLocation[1]+']');
			$('td.monitor-grid-element').attr('clicked',false);
			$(c).attr('clicked',true);
			options.urlField();
			var n = 0;
			$('.url input').each(function(index,value){
				$(this).val(object.urlArray[index]);
			});
		});
	};
}



// add url fields when # of Monitors is changed (this could be set by # of browsers later on)
options.urlField = function() {
	var i = options.numberOfMonitors
	var monitors = Number(document.getElementById('monNum').value);
	if (monitors>i){
		for (var j=i; j<monitors; j++){
				$('#urls').append('<div id="a'+j+'" class="url"><input type="url" class="form-control"></br></div>');
		}
	} else{
		var j = $('.url').length
		for (j; j>monitors; j--){
				$('.url').last().remove();
		}
	}
	options.numberOfMonitors = monitors;
}

options.save = function() {
	if (options.alreadyClicked == false){
		chrome.extension.getBackgroundPage().alert('Error: no control monitor selected. Please double click the square that corresponds to the control monitor (the monitor on which the start menu is displayed.')
	} else{

		var name = document.getElementById('name').value.replace(' ','_');
		var monitors = document.getElementById('monNum').value;
		var rows = document.getElementById('row').value;
		var col = document.getElementById('col').value;
		var controlElement = $('td.monitor-grid-element[clicked=true]');
		var control = [$(controlElement).attr('data-row'),$(controlElement).attr('data-col')]
		var locations = [];
		var selected = $('td.monitor-grid-element[bold=true');
		$.each(selected,function(index,value){
			locations.push([$(value).attr('data-row'),$(value).attr('data-col'),$(value).html()])
		});
		var project_urls = [];
		$('.url input[type=url]').each(function(index,value){
			project_urls.push(this.value);
		});

		var settings = {
			profileName: name,
			numberOfMonitors: monitors,
			gridRows: rows,
			gridColumns: col,
			monitorLocationArray: locations,
			urlArray: project_urls,
			controlMonitorLocation: control,
			save: save
		}
		var exit = false
		var confirm_overwrite = false
		// check if name is in use
		$.each(options.profile_names, function(index,value){
			if (options.add_to_list==true && value == name){
				confirm_overwrite = true
			}
		});

		if (confirm_overwrite){
			var overwrite = chrome.extension.getBackgroundPage().confirm('A profile already exists by that name. Overwrite?')
			if(overwrite){
				exit = false;
				options.add_to_list=false;
			} else {
				exit = true;
			}
		}

		if(!exit){
			if (options.add_to_list==true){
				$('#edit').append('<option value="'+name+'">'+name+'</option>');
			}

			// to save, the entire object must be retrieved, the individual profile altered,
			// and then the whole object saved again
			chrome.storage.sync.get('settings',function(obj){
				options.curr_profile = obj.settings;
				options.curr_profile[name] = JSON.stringify(settings);
				chrome.storage.sync.set({
					'settings':options.curr_profile
				});
			});

			$('#profile-settings').hide();
			$('#main-menu').show();
			$('#edit').val('none');
			options.refresh();
		};
	};
}

// reset settings to "New Profile" settings
options.refresh = function() {
	$('#name').val('New profile');
	$('#monNum').val('1');
	$('#a0').children()[0].value = ''
	$('#row').val(1);
	$('#col').val(1);
	options.gridY();
	options.gridX();
	options.currMon = 1;
	options.urlField();
	options.add_to_list = true;
	setTimeout(options.populate,1000);
}

// delete profile. Since profile is deleted by accessing the name, if two items on the list have the same name, both will be deleted
options.deleteProfile = function() {

		//var del = chrome.extension.getBackgroundPage().confirm('Are you sure you want to delete this profile?');
		//if(del){
			var toDelete = $('#name').val();
			chrome.storage.sync.get('settings',function(obj){
				newObject = obj.settings;
				delete newObject[toDelete];
				$('#edit option[value='+toDelete+']').remove();
				chrome.storage.sync.set({
					'settings':newObject
				})
				options.cancel()
			});
		//};

}

options.shortcuts = function(){
	$('#main-menu').hide();
	$('#shortcuts').show();
}

options.addShortcut = function(){

}



// close editor without saving changes
options.cancel = function() {
	options.refresh();
	$('#profile-settings').hide();
	$('#shortcuts').hide();
	$('#main-menu').show();
	$('#edit').val('none');
}

options.convertProfilesToNewNamingScheme = function() {
	chrome.storage.sync.get('settings',function(obj){
		var newObject = obj.settings;
		$.each(obj.settings,function(index,value){
			profileObject = JSON.parse(value)

			if(profileObject.name){
				profileObject.profileName = profileObject.name;
				delete profileObject.name;
			}

			if(profileObject.loc){
				profileObject.monitorLocationArray = profileObject.loc;
				delete profileObject.loc;
			}

			if(profileObject.r){
				profileObject.gridRows = profileObject.r;
				delete profileObject.r;
			}

			if(profileObject.c){
				profileObject.gridColumns = profileObject.c;
				delete profileObject.c;
			}

			if(profileObject.mon){
				profileObject.numberOfMonitors = profileObject.mon;
				delete profileObject.mon;
			}

			if(profileObject.url){
				profileObject.urlArray = profileObject.url;
				delete profileObject.url;
			}

			if(profileObject.ctl){
				profileObject.controlMonitorLocation = profileObject.ctl;
				delete profileObject.ctl;
			}


			newObject[index] = JSON.stringify(profileObject);

		});
		chrome.storage.sync.set({
				'settings':newObject
		})
	});
}
