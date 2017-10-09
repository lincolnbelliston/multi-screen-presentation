/*////////////////////////////////////////////////////////////////
Logic for options page.
*////////////////////////////////////////////////////////////////

var options = {};

options.activeProfileName = '';

$(document).ready(function () {
	//chrome.storage.sync.clear();
	//return
	options.convertProfilesToNewNamingScheme();

	$('#profile-settings').hide();
	$('#shortcuts').hide();
	options.add_to_list = true;
	options.currMon = 1;
	options.gridColumns = 1;
	options.gridRows = 1;
	options.numberOfMonitors = 1;
	options.locations = [];
	
	options.currentShortcuts = {};
	options.customShortcutNames = [];

	$('[data-toggle="tooltip"]').tooltip();
	options.populate();

	// set up listeners for page events
	document.querySelector('#edit').addEventListener('change', function (profileName, isnew) {
		existing = $('select[id=edit]').val();
		options.edit(existing, false)
	});
	document.querySelector('#new').addEventListener('click', function (profileName, isnew) {
		options.edit("New profile", true)
	});
	document.querySelector('#save').addEventListener('click', options.save);
	document.querySelector('#refresh').addEventListener('click', options.refresh);
	document.querySelector('#delete').addEventListener('click', options.deleteProfile)
	document.querySelector('#cancel').addEventListener('click', options.cancel);
	document.querySelector('#monNum').addEventListener('change', options.urlField);
	document.querySelector('#name').addEventListener('change', function () { options.add_to_list = true });
	document.querySelector('#row').addEventListener('change', options.gridY);
	document.querySelector('#col').addEventListener('change', options.gridX);
	document.querySelector('#monGrid').addEventListener('click', options.clickGrid);
	document.querySelector('#monGrid').addEventListener('dblclick', options.clickCtrl);
	document.querySelector('#clear').addEventListener('click', options.clear);
	document.querySelector('#back').addEventListener('click', options.back);
	document.querySelector('#help').addEventListener('click', options.help);
	document.querySelector('#shortcut-button').addEventListener('click', options.shortcuts);
	document.querySelector('#autofillBtn').addEventListener('click', options.autoGenerate);

	var filePicker = $('#filePicker');
	filePicker.change(options.onFilePicked);

	document.querySelector('#import-button').addEventListener('click', function () { filePicker.click(); });
	document.querySelector('#export-button').addEventListener('click', options.export);
	document.querySelector('#trash-button').addEventListener('click', options.clearStorage);

	options.initializeShortcutPage();
});

// update naming scheme if data was saved using old version
options.convertProfilesToNewNamingScheme = function () {
	chrome.storage.sync.get('settings', function (obj) {
		if (obj.settings) {
			var newObject = obj.settings;
			$.each(obj.settings, function (index, value) {
				profileObject = JSON.parse(value)

				if (profileObject.name) {
					profileObject.n = profileObject.name;
					delete profileObject.name;
				}

				if (profileObject.profileName) {
					profileObject.n = profileObject.profileName;
					delete profileObject.profileName;
				}

				if (profileObject.loc) {
					profileObject.l = profileObject.loc;
					delete profileObject.loc;
				}

				if (profileObject.monitorLocationArray) {
					profileObject.l = profileObject.monitorLocationArray;
					delete profileObject.monitorLocationArray;
				}

				if (profileObject.gridRows) {
					profileObject.r = profileObject.gridRows;
					delete profileObject.gridRows;
				}

				if (profileObject.gridColumns) {
					profileObject.c = profileObject.gridColumns;
					delete profileObject.gridColumns;
				}

				if (profileObject.mon) {
					profileObject.m = profileObject.mon;
					delete profileObject.mon;
				}

				if (profileObject.numberOfMonitors) {
					profileObject.m = profileObject.numberOfMonitors;
					delete profileObject.numberOfMonitors;
				}

				if (profileObject.url) {
					profileObject.u = profileObject.url;
					delete profileObject.url;
				}

				if (profileObject.urlArray) {
					profileObject.u = profileObject.urlArray;
					delete profileObject.urlArray;
				}

				if (profileObject.ctl) {
					profileObject.controlMonitorLocation = profileObject.ctl;
					delete profileObject.ctl;
				}

				if (profileObject.controlMonitorLocation) {
					profileObject.t = profileObject.controlMonitorLocation;
					delete profileObject.controlMonitorLocation;
				}

				if (profileObject.save) {
					delete profileObject.save;
				}

				newObject[index] = JSON.stringify(profileObject);

			});
			chrome.storage.sync.set({
				'settings': newObject
			})
		}
	});
}

/*////////////////////////////////////////////////////////////////
Functions for edit profile menu
*/////////////////////////////////////////////////////////////////
// edit a profile (saved or new)
options.edit = function (profileName, isnew) {
	$('#name').val(profileName);
	$('#main-menu').hide();
	$('#profile-settings').show();
	$('#delete').attr('disabled', true)
	options.controlMonitorSelected = false;
	options.activeProfileName = '';

	if (isnew == false) {
		// retrieve settings and populate fields;
		options.activeProfileName = profileName;

		$('#delete').attr('disabled', false)
		options.add_to_list = false
		chrome.storage.sync.get('settings', function (obj) {
			var object = JSON.parse(obj.settings[profileName]);
			$('#name').val(object.n);
			$('#monNum').val(object.m);
			$('#row').val(object.r);
			$('#col').val(object.c);
			options.gridY();
			options.gridX();
			options.urlField();
			options.controlMonitorSelected = true;

			//Set up monitor grid
			$(object.l).each(function (index, value) {
				var gridCell = $('td.monitor-grid-element[data-row=' + value[0] + '][data-col=' + value[1] + ']');
				$(gridCell).attr('bold', true).html(value[2]);
			});

			options.currMon = object.l.length + 1;

			//Set up control monitor
			$('td.monitor-grid-element').attr('clicked', false);
			var c = $('td.monitor-grid-element[data-row=' + object.t[0] + '][data-col=' + object.t[1] + ']');
			$(c).attr('clicked', true);

			//Set up urls
			$('.url input').each(function (index, value) {
				$(this).val(object.u[index]);
			});

		});
	};
}

// populate dropdown list with saved profiles
options.populate = function () {
	$('#edit').html('');
	options.profile_names = [];
	chrome.storage.sync.get('settings', function (obj) {
		options.object = obj.settings;
		if (options.object == undefined) {
			chrome.storage.sync.set({
				'settings': {}
			});
		} else {
			$.each(options.object, function (index, value) {
				prf = JSON.parse(value).n
				options.profile_names.push(prf);
				$('#edit').append('<option value="' + prf + '">' + prf + '</option>');
			});
			$('#edit').val('none');
		}
	});
}

// update the monitor grid display when row/column controls change
options.gridY = function () {

	//HTML tags did not work
	document.getElementById('row').value = parseInt(document.getElementById('row').value)

	//Cap rows from 1 to 20
	if (Number(document.getElementById('row').value) < 1)
		document.getElementById('row').value = 1;
	else if (Number(document.getElementById('row').value) > 20)
		document.getElementById('row').value = 20;

	var existingRows = options.gridRows;

	var rowsUpdateTo = Number(document.getElementById('row').value);
	if (rowsUpdateTo > existingRows) {
		for (var j = existingRows; j < rowsUpdateTo; j++) {
			var rowStr = '';
			for (var k = 0; k < options.gridColumns; k++) {
				rowStr = rowStr.concat('<td class="monitor-grid-element" data-row=' + j + ' data-col=' + k + ' bold=false></td>');
			}

			$('#monGrid').append('<tr class="monitor-grid-row">' + rowStr + '</tr>');
			existingRows = ++existingRows;
		}
	} else {
		var j = $('tr.monitor-grid-row').length
		for (j; j > rowsUpdateTo; j--) {
			$('tr.monitor-grid-row').last().remove();
			existingRows = --existingRows;
		}
		options.verifyNUpdateMonitors();
	}
	options.gridRows = rowsUpdateTo;
}

options.gridX = function () {

	document.getElementById('col').value = parseInt(document.getElementById('col').value)

	//Cap cols from 1 to 20
	if (Number(document.getElementById('col').value) < 1)
		document.getElementById('col').value = 1;
	else if (Number(document.getElementById('col').value) > 20)
		document.getElementById('col').value = 20;

	var existingCols = options.gridColumns;

	var updateColTo = Number(document.getElementById('col').value);
	if (updateColTo > existingCols) {
		for (var j = existingCols; j < updateColTo; j++) {
			$('tr.monitor-grid-row').each(function (index, value) {
				$(value).append('<td class="monitor-grid-element" data-row=' + (index) + ' data-col=' + j + ' bold=false></td>');
			});
		}
	} else {
		var j = $('td.monitor-grid-element[data-row="0"]').length
		for (j; j > updateColTo; j--) {
			$('tr.monitor-grid-row').each(function (index, value) {
				$(value).children().last().remove();
			})
		}
		options.verifyNUpdateMonitors();
	}
	options.gridColumns = updateColTo;
}

options.verifyNUpdateMonitors = function () {
	var monitorPositions = [];
	var selectedMonitorsArray = $('td.monitor-grid-element[bold=true]');

	$.each(selectedMonitorsArray, function (index, value) {
		monitorPositions.push([$(value).attr('data-row'), $(value).attr('data-col'), $(value).html()])
	});

	monitorPositions.sort(
		function (first, second) {
			return (first[2] - second[2]);
		});

	$.each(monitorPositions, function name(index, value) {
		$('td[data-row=' + value[0] + '][data-col=' + value[1] + ']').html(index + 1);
	});

	options.currMon = monitorPositions.length + 1;

	var controlElement = $('td.monitor-grid-element[clicked=true]');
	options.controlMonitorSelected = (controlElement.length > 0)? true: false;
}

// when a grid element is clicked, highlight element and display monitor number
options.clickGrid = function (event) {
	if (event.target !== event.currentTarget) {
		var clickedItem = event.target;
		var monNum = Number($('#monNum').val());

		if (options.currMon <= monNum) {
			if ($(clickedItem).attr('bold') == 'false') {
				$(clickedItem).attr('bold', true).html(options.currMon)
				options.currMon = ++options.currMon;
			}
		}
	}
	event.stopPropagation();
}

// when a grid element is double-clicked, highlight element
options.clickCtrl = function () {
	options.controlMonitorSelected = true;
	if (event.target !== event.currentTarget) {
		var dblClicked;
		dblClicked = event.target;
		$('td.monitor-grid-element[clicked=true]').attr('clicked', false);

		$(dblClicked).attr('clicked', true);
	}
	event.stopPropagation();
}

// undo last section from monitor grid
options.back = function () {
	$('td.monitor-grid-element:contains("' + (options.currMon - 1) + '")').attr('bold', false).html('');
	if (options.currMon > 1) {
		options.currMon = --options.currMon;
	};
}

// clear selections from grid display
options.clear = function () {
	$('td.monitor-grid-element').attr('bold', false).attr('clicked', false).html('');
	options.currMon = 1;

	$('td.monitor-grid-element[clicked=true]').attr('clicked', false);
	options.controlMonitorSelected = false;
}

// show help alert on click
options.help = function () {
	var help = 'Each grid square represents a monitor. Expand the grid to the desired dimensions, then click a sequence of squares corresponding to the location of the presentation monitors. Then double click the square corresponding to the control monitor (the monitor containing the Start menu).'
	chrome.extension.getBackgroundPage().alert(help);
}

// add url fields when # of Monitors is changed (this could be set by # of browsers later on)
options.urlField = function () {

	document.getElementById('monNum').value = parseInt(document.getElementById('monNum').value)
	
	var monitors = Number(document.getElementById('monNum').value);
	var actualMonitors = $('#urls').children().length;

	if (monitors < 1) {
		monitors = 1;
		document.getElementById('monNum').value = 1;
	}
	else if (monitors > 50) {
		monitors = 50;
		document.getElementById('monNum').value = 50;
		options.createAutoClosingAlert("Window limit is soft-capped to 50");
	}

	if (monitors > actualMonitors) {
		for (var j = actualMonitors; j < monitors; j++) {
			$('#urls').append('<div id="a' + j + '" class="url"><input type="url" class="form-control" placeholder="Screen ' + (j+1) + ' URL"></br></div>');
		}
	} else {
		var j = actualMonitors;
		for (j; j > monitors; j--) {
			$('.url').last().remove();
		}
	}
	options.m = monitors;

	actualMonitors = $('#urls').children().length;
}

options.save = function () {
	if (document.getElementById('name').value == '') {
		chrome.extension.getBackgroundPage().alert('Error: Please provide a valid name.');
	} else if (options.controlMonitorSelected == false) {
		chrome.extension.getBackgroundPage().alert('Error: no control monitor selected. Please double click the square that corresponds to the control monitor (the monitor on which the start menu is displayed.')
	} else {
		var name = document.getElementById('name').value.replace(' ', '_');
		var monitors = document.getElementById('monNum').value;
		var rows = document.getElementById('row').value;
		var col = document.getElementById('col').value;
		var controlElement = $('td.monitor-grid-element[clicked=true]');
		var control = [$(controlElement).attr('data-row'), $(controlElement).attr('data-col')]
		var locations = [];
		var selected = $('td.monitor-grid-element[bold=true]');

		$.each(selected, function (index, value) {
			locations.push([$(value).attr('data-row'), $(value).attr('data-col'), $(value).html()])
		});
		var project_urls = [];
		$('.url input[type=url]').each(function (index, value) {
			project_urls.push(this.value);
		});

		// This settings object will be saved in chrome.storage.sync a a stringified
		// JSON object. The byte (character) limit per item is 8192, and the total is
		// 102400. TO save space, I have chosen minimal, rather than descriptive
		// names for keys.
		var settings = {
			n: name,
			m: monitors,
			r: rows,
			c: col,
			l: locations,
			u: project_urls,
			t: control,
		}
		var exit = false
		var confirm_overwrite = false
		// check if name is in use
		$.each(options.profile_names, function (index, value) {
			if (options.add_to_list == true && value == name) {
				confirm_overwrite = true
			}
		});

		if (confirm_overwrite) {
			var overwrite = chrome.extension.getBackgroundPage().confirm('A profile already exists by that name. Overwrite?')
			if (overwrite) {
				exit = false;
				options.add_to_list = false;
			} else {
				exit = true;
			}
		}

		if (!exit) {
			if (options.add_to_list == true) {
				$('#edit').append('<option value="' + name + '">' + name + '</option>');
			}

			// to save, the entire object must be retrieved, the individual profile altered,
			// and then the whole object saved again
			chrome.storage.sync.get('settings', function (obj) {
				if(options.activeProfileName != '')
					delete obj.settings[options.activeProfileName];

				obj.settings[name] = JSON.stringify(settings);
				if (JSON.stringify(obj.settings).length > 8190) {
					chrome.extension.getBackgroundPage().alert('Chrome storage allotment exceeded. Please delete one or more profiles before saving another.');
					return;
				}
				chrome.storage.sync.set({
					'settings': obj.settings
				});
			});

			options.profile_names.push(name);
			$('#profile-settings').hide();
			$('#main-menu').show();
			$('#edit').val('none');
			options.refresh();
		};
	};
}

// reset settings to "New Profile" settings
options.refresh = function () {
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
	options.clear();
	setTimeout(options.populate, 1000);
}

// delete profile. Since profile is deleted by accessing the name, if two items on the list have the same name, both will be deleted
options.deleteProfile = function () {

	var del = chrome.extension.getBackgroundPage().confirm('Are you sure you want to delete the profile: "'
		+ options.activeProfileName + '" ?');
	if (del) {
		var toDelete = options.activeProfileName;
		chrome.storage.sync.get('settings', function (obj) {
			newObject = obj.settings;
			delete newObject[toDelete];
			//$('#edit option[value='+toDelete+']').remove();
			chrome.storage.sync.set({
				'settings': newObject
			})
			options.cancel()
		});
	};

}

// close editor without saving changes
options.cancel = function () {
	options.refresh();
	var cancelButtons = document.querySelectorAll('.cancel-edit-shortcut')
	for (i = 0; i < cancelButtons.length; i++) {
		$(cancelButtons[i]).click();
	}
	$('#profile-settings').hide();
	$('#shortcuts').hide();
	$('#main-menu').show();
	$('#edit').val('none');
}



/*////////////////////////////////////////////////////////////////
Functions for shortcut settings menu
*/////////////////////////////////////////////////////////////////
options.initializeShortcutPage = function () {
	document.querySelector('#done').addEventListener('click', options.cancel);
	document.querySelector('#add-new-shortcut').addEventListener('click', options.addShortcut);

	options.retrieveShortcutList(function () {
		var editShorcutButtons = document.querySelectorAll('.edit-shortcut-button');
		var deleteShortcutButtons = document.querySelectorAll('.delete-shortcut-button');
		for (var i = 0; i < editShorcutButtons.length; i++) {
			editShorcutButtons[i].addEventListener('click', function () {
				options.editShortcut(false);

			});
			if (i > 1) {
				deleteShortcutButtons[i - 2].addEventListener('click', options.deleteShortcut);
			}
		}
	});
}

// When the "Shortcuts" button is clicked open shortcuts menu
options.shortcuts = function () {
	$('#main-menu').hide();
	$('#shortcuts').show();
}

options.retrieveShortcutList = function (callBack) {
	chrome.storage.sync.get('custom', function (obj) {
		options.customShortcutNames = obj.custom;
		var i = 0
		if (options.customShortcutNames) {
			if (options.customShortcutNames.length == 0) {
				callBack();
			} else {
				$.each(options.customShortcutNames, function (index, value) {
					if (i < options.customShortcutNames.length - 1) {
						var callbackToCallOnce = function () { };
					} else {
						var callbackToCallOnce = callBack;
					}
					options.appendShortcut(false, value, callbackToCallOnce);
					i++
				});
			}
		} else {
			chrome.storage.sync.set({
				'custom': []
			});
			callBack();
		}
	});
}

// load keyboad view and add event listeners to its components
options.editShortcut = function (isNew) {
	$(event.target).hide();
	$('.cancel-edit-shortcut').click();

	$(event.target).parent().append("<button class='btn btn-default pull-right cancel-edit-shortcut'><span class='glyphicon glyphicon-remove'></span></button>")

	var shortcutPanel = $(event.target).closest('.shortcut-panel');
	var shortcutName = $(shortcutPanel).attr('data-shortcutName');

	if ($(shortcutPanel).hasClass('custom-shortcut')) {
		var shortcutTitle = $(shortcutPanel).find('.shortcut-title')
		$(shortcutTitle).parent().append("<select class='shortcut-title form-control'></select>")
		$(shortcutTitle).remove();
		var shortcutSelect = $(shortcutPanel).find('.shortcut-title');
		// populate <select>
		$.each(options.profile_names, function (index, value) {
			if (!options.customShortcutNames.find(function (name) { return value == name }) || (value == shortcutName)) {
				$(shortcutSelect).append('<option value="' + value + '">' + value + '</option>');
			}
		})
		$(shortcutSelect).val(shortcutName);
	}

	var shortcutName = shortcutPanel.attr('data-shortcutName');
	// select on shortcutName

	$(shortcutPanel).children().last().load('keyboard/keyboard.html', function () {
		var keyboardRows = document.querySelectorAll('.keyboard-row');
		for (var i = 0; i < keyboardRows.length; i++) {
			keyboardRows[i].addEventListener('click', options.keyboardClick);
		}

		document.querySelector('.save-edit-shortcut').addEventListener('click', options.saveEditShortcut);
		document.querySelector('.cancel-edit-shortcut').addEventListener('click', options.cancelEditShortcut);
		document.querySelector('.clear-edit-shortcut').addEventListener('click', options.clearEditShortcut);

		if (!isNew) {
			options.recoverShortcutSettings(shortcutName);
		}
	});
}

options.recoverShortcutSettings = function (shortcutName) {
	chrome.storage.sync.get('shortcuts', function (obj) {
		if (obj.shortcuts) {
			if (obj.shortcuts[shortcutName]) {
				var shortcutCondition = obj.shortcuts[shortcutName].condition;
				options.displayShortcutSettings(shortcutName, shortcutCondition);
			}
		}
	})
}

options.displayShortcutSettings = function (shortcutName, shortcutCondition) {

	var keyboardView = $('div[data-shortcutName=' + shortcutName + ']').find('.keyboard-view');
	for (var i = 0; i < shortcutCondition.length; i++) {
		$(keyboardView).find('td[data-keyvalue=' + shortcutCondition[i] + ']').attr('bold', 'true');
	};
}

options.keyboardClick = function (event) {
	if (event.target !== event.currentTarget) {
		var clickedItem = event.target;

		if ($(clickedItem).attr('bold') == 'false') {
			$(clickedItem).attr('bold', true)
		} else if ($(clickedItem).attr('bold')) {
			$(clickedItem).attr('bold', false)
		}

	}
	event.stopPropagation();
}

options.saveEditShortcut = function () {
	// store settings in chrome.storage.sync

	var saveEvent = event
	var keyboardElements = $('td.keyboard-element');
	var selectedKeys = [];
	for (var i = 0; i < keyboardElements.length; i++) {
		var key = keyboardElements[i];
		if ($(key).attr('bold') == "true") {
			selectedKeys.push($(key).attr('data-keyvalue'));
		}
	}

	var shortcutPanel = $(event.target).closest('.shortcut-panel');

	if ($(shortcutPanel).hasClass('custom-shortcut')) {
		//		update data-shortcutName with whatever is in the select menu
		var shortcutName = $(shortcutPanel).find('select').val();
		$(shortcutPanel).attr('data-shortcutName', shortcutName);


		// add shortcutName to added-shortcut array in storage
		chrome.storage.sync.get('custom', function (obj) {
			if (obj.custom) {
				options.customShortcutNames = obj.custom;
			}
			if (!options.customShortcutNames.find(function (name) { return name == shortcutName })) {
				options.customShortcutNames.push(shortcutName);

				var editButton = $(shortcutPanel).find('button.edit-shortcut-button');
				$(editButton).unbind('click');
				$(editButton).click(function () {
					options.editShortcut(false);
				})
			}
			chrome.storage.sync.set(
				{
					'custom': options.customShortcutNames
				});
		})
	}

	var nameOfShortcutToSave = shortcutPanel.attr('data-shortcutName');

	var shortcutToSave = {
		name: nameOfShortcutToSave,
		condition: selectedKeys
	}
	chrome.storage.sync.get('shortcuts', function (obj) {
		if (obj.shortcuts) {
			options.currentShortcuts = obj.shortcuts;
		}
		options.currentShortcuts[nameOfShortcutToSave] = shortcutToSave;
		chrome.storage.sync.set(
			{
				'shortcuts': options.currentShortcuts
			});

		options.cancelEditShortcut(saveEvent);
	});
}

options.clearEditShortcut = function () {
	var boldKeyboardElements = $('td.keyboard-element[bold="true"]');
	for (var i = 0; i < boldKeyboardElements.length; i++) {
		$(boldKeyboardElements[i]).attr('bold', 'false');
	}
}

options.cancelEditShortcut = function (event) {
	var shortcutPanel = $(event.target).closest('.shortcut-panel');
	var shortcutName = $(shortcutPanel).attr('data-shortcutName');

	if ($(shortcutPanel).hasClass('custom-shortcut')) {
		// 	replace select with h5
		var shortcutSelect = $(shortcutPanel).find('.shortcut-title')
		$(shortcutSelect).parent().append("<h5 class='shortcut-title'>" + shortcutName + "</h5>")
		$(shortcutSelect).remove();

		if (!options.customShortcutNames.find(function (name) { return shortcutName == name })) {
			$(shortcutPanel).parent().remove();
		}

	}

	$(shortcutPanel).find('.edit-shortcut-button').show();
	$(shortcutPanel).find('.keyboard-view').remove();
	$(shortcutPanel).find('.cancel-edit-shortcut').remove();
}

options.addShortcut = function () {
	options.appendShortcut(true, "", function () {
		$('button.edit-shortcut-button:last')[0].click()
	});
}

options.appendShortcut = function (isNew, shortcutName, callBack) {
	$('#shortcut-list-display').append('<div></div>');

	// load template into div
	var addedShortcutContainer = $('#shortcut-list-display').children().last();
	var addedShortcut = null;
	addedShortcutContainer.load('shortcut.html', function () {
		addedShortcut = $(addedShortcutContainer).children()[0];
		$(addedShortcut).attr('data-shortcutName', shortcutName);
		$(addedShortcut).find('h5').text(shortcutName);

		// add event listeners to buttons
		var deleteButton = $(addedShortcut).find('button.delete-shortcut-button');
		$(deleteButton).click(function () {
			options.deleteShortcut();
		});

		if (isNew) {
			var editButton = $(addedShortcut).find('button.edit-shortcut-button');
			$(editButton).click(function () {
				options.editShortcut(true);
			})
		}
		callBack();
	});

}

options.deleteShortcut = function () {
	shortcutPanel = $(event.target).closest('.shortcut-panel');
	shortcutName = $(shortcutPanel).attr('data-shortcutName');
	// dialog are you sure?

	chrome.storage.sync.get('shortcuts', function (obj) {
		newObject = obj.shortcuts;
		delete newObject[shortcutName];
		chrome.storage.sync.set({
			'shortcuts': newObject
		})
	});

	chrome.storage.sync.get('custom', function (obj) {
		newArray = obj.custom;
		$.each(newArray, function (index, value) {
			if (value == shortcutName) {
				newArray.splice(index, index + 1);
				return
			}
		});
		chrome.storage.sync.set({
			'custom': newArray
		});
		options.customShortcutNames = newArray;
	})

	$(shortcutPanel).parent().remove();
}

//Extract the 'settings' section of the storage, which contains the presentation profiles.
options.export = function () {
	//extracting the complete storage structure from storage
	chrome.storage.sync.get('settings', function (obj) {
		if (!$.isEmptyObject(obj.settings)) {
			var data = {};
			//Serialise
			data.profiles = JSON.stringify(obj);
			data.hash = options.getHash(data.profiles);
			// Save as file
			var url = 'data:application/json;base64,' + btoa(JSON.stringify(data));
			chrome.downloads.download({
				url: url,
				filename: 'MultiScreenPresentation.profiles.settings'
			}, function () {
				if (chrome.runtime.lastError)
					options.createAutoClosingAlert("Export failed. Error:" + chrome.runtime.lastError);
				else
					options.createAutoClosingAlert("All Profiles exported");
			});
		}
		else {
			options.createAutoClosingAlert("Nothing to export. Are you looking for import instead?");
		}
	})
}

//Triggered on 'import profile'
options.onFilePicked = function () {
	// create reader
	var reader = new FileReader();
	reader.readAsText($(this).get(0).files[0]);
	reader.onload = function (e) {
		try {
			//browser completed reading file - display it
			var obj = JSON.parse(e.target.result);

			//making sure the file is not tempered and fit to be imported
			if (obj.hash === options.getHash(obj.profiles)) {
				var settingsObj = JSON.parse(obj.profiles).settings;
				var keys = " ";
				$.each(settingsObj, function (k) { keys += '\n * ' + k; });
				var overwrite = chrome.extension.getBackgroundPage().confirm('The following profiles are being imported: '
					+ '\n' + keys
					+ '\n\nAny existing profile with same name will be overwritten!');

				if (overwrite) {
					//making sure the structure is within the allowed limits
					if (JSON.stringify(settingsObj).length > 8190) {
						chrome.extension.getBackgroundPage().alert('Chrome storage allotment exceeded. Please delete one or more profiles before saving another.');
						return;
					}

					chrome.storage.sync.set({ 'settings': settingsObj }, function () {
						if (chrome.runtime.lastError)
							options.createAutoClosingAlert("Import failed. Error:" + chrome.runtime.lastError);
						else
							options.createAutoClosingAlert("Profiles have been imported.");
					});
				}

				//refresh once new profiles are loaded
				options.refresh();
			}
			else {
				options.createAutoClosingAlert('CheckSum didn\'t match. Invalid file.');
			}
		} catch (e) {
			options.createAutoClosingAlert('Invalid format. Please try again with a valid file.');
			console.log(e);
		} finally {
			var filePicker = $('#filePicker');
			filePicker.val('');
		}
	};
}

//Hash is added to the export data structure to verify the integrity of the data.
//If the saved and calculated hash dont match while impoting, appropriate message is shown.
options.getHash = function (content) {
	//from http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
	var hash = 0,
		strlen = content.length,
		i,
		c;
	if (strlen === 0) {
		return hash;
	}
	for (i = 0; i < strlen; i++) {
		c = content.charCodeAt(i);
		hash = ((hash << 5) - hash) + c;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

//bootstrap alert box comes to the rescue
options.createAutoClosingAlert = function (message) {
	var alertBox = $('#alert-box');
	alertBox.html("<strong>" + message + "</strong>");
	alertBox.show();
	window.setTimeout(function () { alertBox.hide() }, 4000);
}

//clear the complete storage structure and start afresh
options.clearStorage = function () {
	var proceed = chrome.extension.getBackgroundPage().confirm('Do you really want to clear the storage.'
		+ ' This action is irreversible!');
	if (proceed) {
		chrome.storage.sync.clear(function () {
			options.createAutoClosingAlert("Profiles cleared. Start afresh...");
			options.refresh();
		});
	}
}

//Tries to fill the URLs, Automatically.
options.autoGenerate = function () {
	var masterInput = $('#urls #a0 #urlInput').val();
	var regex = '(\\d+)([^\\d]*)$';
	var regMatch = masterInput.match(regex);

	if (regMatch != null) {
		var masterURL = masterInput.substring(0, regMatch.index);
		var sequence = regMatch[1];
		var terminal = regMatch[2];
		$('#urls .url').each(function (index, value) {
			$(value).find('input[type=url]').val(masterURL + (Number(sequence) + index) + terminal);
		});
	}
	else
		options.createAutoClosingAlert("Sorry, can't find generator pattern. URL should end with a number.");
}
