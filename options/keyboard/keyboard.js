var keyboard = {};
$(document).ready(function(){
	var keyboardRows = document.querySelectorAll('.keyboard-row');
	console.log(keyboardRows);
	for (var i=0; i<keyboardRows.length; i++){
		keyboardRows[i].addEventListener('click', keyboard.keyboardClick);
	}
})

keyboard.keyboardClick = function(event){
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