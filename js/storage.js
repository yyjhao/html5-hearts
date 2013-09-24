if(window.isDebug){
	localStorage = {};
}

window.game.state = {
	apply: function(){
		var arrangement = game.storage.last;
		game.players.forEach(function(p,ind){
			arrangement[ind].row.forEach(function(c){
				p.row.addCard(game.board.cards[c[0]]);
			});
			arrangement[ind].waste.forEach(function(c){
				p.waste.addCard(game.board.cards[c[0]]);
			});
			p.oldScore = arrangement[ind].oldScore;
		});
		arrangement.desk.cards.forEach(function(c){
			game.board.cards[c[0]].pos = {
				rotation: c[1]
			};
			game.board.desk.addCard(game.board.cards[c[0]], true);
		});
		arrangement.desk.players.forEach(function(c,ind){
			game.board.desk.players[ind] = game.players[c];
		});
		['status','heartBroken','currentPlay','rounds'].forEach(function(c){
			game[c] = arrangement[c];
		});
	},
	save: function(){
		var arrangement = {};
		function cardsToId(c){
			return [c.id, c.pos.rotation];
		}
		game.players.forEach(function(p,ind){
			arrangement[ind] = {
				row: p.row.cards.map(cardsToId),
				waste: p.waste.cards.map(cardsToId),
				oldScore: p.oldScore
			};
		});
		arrangement['desk'] = {
			cards: game.board.desk.cards.map(cardsToId),
			players: game.board.desk.players.map(function(p){
				return p.id;
			})
		};
		['status','heartBroken','currentPlay','rounds'].forEach(function(c){
			arrangement[c] = game[c];
		});
		if(arrangement.status === 'passing'){
			arrangement.status = 'start';
		}
		game.storage.last = arrangement;
	}
};

window.game.storage = {};

var storeSetup = {
	names:  '["Jack", "Octavian", "Antony", "Lepidus"]',
	totalScore: 0,
	totalVictory: 0,
	roundsPlayed: 0,
	timesPlayed: 0,
	totalSTM: 0,
	last: 'false'
};

if(true || window.isDebug){
	window.game.storage = storeSetup;
}else{
	(function(obj, storages){
		function addStorage(obj, name, def){
			if(localStorage['yyjhao.hearts.' + name] === null){
				localStorage['yyjhao.hearts.' + name] = def;
			}
			(function(obj, name){
				var str = localStorage['yyjhao.hearts.' + name];
				obj['_' + name] = str ? JSON.parse(str) : str;
				Object.defineProperty(obj, name,{
					get: function(){
						return this['_'+name];
					},
					set: function(n){
						localStorage['yyjhao.hearts.' + name] = JSON.stringify(n);
						this['_'+name] = n;
					}
				})
			})(obj, name);
		}
		for(name in storages){
			addStorage(obj,name,storages[name]);
		}
	})(window.game.storage, storeSetup);
}