window.onload = function(){
	game.init();
	$('#newgame-but')[0].onclick = function(){
		if(confirm("This will end the current game. Are you sure?")){
			game.newGame();
		}
	};
	$('#control-region>button')[0].onclick = function(){
		if(!$('#settings-dialog')[0].hidden){
			var nums = ['one', 'two', 'three', 'four'],
				names = [];
			for(var i = 0; i < 4; i++){
				names[i] = $('.player-set-name.' + nums[i])[0].innerHTML;
			}
			game.storage.names = names;
			for(var i = 0; i < 4; i++){
				game.players[i].name = game.storage.names[i];
			}
		}
		$('#control-region')[0].hidden = true;
	};
	$('#stats-but')[0].onclick = function(){
		$('#stats-dialog')[0].hidden = false;
		$('#settings-dialog')[0].hidden = true;
		$('#total-game')[0].innerHTML = game.storage.timesPlayed;
		$('#num-vic')[0].innerHTML = game.storage.totalVictory;
		$('#rate-vic')[0].innerHTML = game.storage.timesPlayed === 0 ? 0 : Math.round(game.storage.totalVictory / game.storage.timesPlayed * 1000) / 10 + '%';
		$('#total-round')[0].innerHTML = game.storage.roundsPlayed;
		$('#ave-score')[0].innerHTML = game.storage.roundsPlayed === 0 ? 0 : Math.round(game.storage.totalScore / game.storage.roundsPlayed * 100) / 100;
		$('#num-stm')[0].innerHTML = game.storage.totalSTM;
		$('#control-region')[0].hidden = false;
	};
	$('#settings-but')[0].onclick = function(){
		var nums = ['one', 'two', 'three', 'four'];
		$('#settings-dialog')[0].hidden = false;
		$('#stats-dialog')[0].hidden = true;
		game.storage.names.forEach(function(n,ind){
			$('.player-set-name.' + nums[ind])[0].innerHTML = n;
		});
		$('#control-region')[0].hidden = false;
	};
	setTimeout(function(){
		if(false && game.storage.last){
			game.load();
			//game.createNew();
		}else{
			game.newGame();
		}
	},0);
};

// window.onunload = function(){
// 	if(game.status === 'preparing'){
// 		game.storage.last = false;
// 	}else{
// 		game.state.save();
// 	}
// };