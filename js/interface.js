window.onload = function(){
	game.init();
	$('#newgame-but')[0].onclick = function(){
		if(confirm("This will end the current game. Are you sure?")){
			game.newGame();
		}
	};
	$('#control-region>button')[0].onclick = function(){
		$('#control-region')[0].hidden = true;
	};
	$('#settings-but')[0].onclick = function(){
		var nums = ['one', 'two', 'three', 'four'];
		$('#settings-dialog')[0].hidden = false;
		config.names.forEach(function(n,ind){
			$('.player-set-name.' + nums[ind])[0].innerHTML = n;
		});
		$('#control-region')[0].hidden = false;
	};
	setTimeout(function(){
		game.newGame();
	},0);
};