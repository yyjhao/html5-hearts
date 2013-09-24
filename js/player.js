
var Player = function(id){
    this.row = new Row(id);
    this.row.playedBy = this;
    this.waste = new Waste(id);
    this.waste.playedBy = this;
    this.board = game.interface.playerBoards[id];
    this.id = id;
    this._score = 0;
    this._name = '';
    this._oldScore = 0;
    Object.defineProperty(this, 'score', {
        get: function(){
            return this._score;
        },
        set: function(v){
            if(!window.isDebug){
                if(v > this._score){
                    var b = this.board.scoretext.classList;
                    b.add('highlight');
                    setTimeout(function(){
                        b.remove('highlight');
                    },100);
                }
                if(game.getRounds() > 0){
                    this.board.scoretext.innerHTML = this._oldScore + '+' + v;
                }else{
                    this.board.scoretext.innerHTML = v;
                }
            }
            this._score = v;
        }
    });
    Object.defineProperty(this, 'name', {
        get: function(){
            return this._name;
        },
        set: function(v){
            this._name = v;
            if(!window.isDebug){
                this.board.nametext.innerHTML = v;
            }
        }
    });
    Object.defineProperty(this, 'oldScore', {
        get: function(){
            return this._oldScore;
        },
        set: function(v){
            this._oldScore = v;
            if(!window.isDebug){
                this.board.finaltext.innerHTML = v;
            }
        }
    });
};

Player.prototype.initForNewRound = function(){
    this.score = 0;
    this.row.cards = [];
    this.waste.cards = [];

    // if(this.id % 2 === 1) this.brain = new McBrain(this);
    // if(this.id === 1) this.brain = new McBrain(this);
    if(this.id === 1) this.brain = new PomDPBrain(this);
    // else if(this.id === 2) this.brain = new randomBrain(this);
    else this.brain = new simpleBrain(this);
};

Player.prototype.next = function(delay){
    game.nextPlayer(this.id);
    if(delay){
        setTimeout(function(){
            game.proceed();
        }, window.isDebug ? 0 : delay);
    }else{
        game.proceed();
    }
};

Player.prototype.watch = function(){};

Player.prototype.myTurn = function(){};

Player.prototype.out = function(outCards){
    var self = this;
    outCards.forEach(function(c){
        self.row.out(self.row.cards.indexOf(c));
    });
};

Player.prototype.takeIn = function(inCards){
    var self = this;
    inCards.forEach(function(c){
        self.row.addCard(c);
    });
};

Player.prototype.getValidCards = function(cards, _game){
    cards = cards || this.row.cards;
    var game = _game || window.game;
    if(game.board.isEmpty()){
        if(game.isHeartBroken()){
            return cards;
        }else if(cards.length === 13){
            return [game.board.cards[26]];
        }else{
            var vcards = cards.filter(function(c){
                return c.suit !== 1;
            });
            if(vcards.length === 0){
                return vcards.concat(cards);
            }else{
                return vcards;
            }
        }
    }else{
        var vcards = cards.filter(function(c){
            return c.suit === game.board.desk.cards[0].suit;
        });
        if(vcards.length === 0){
            return vcards.concat(cards);
        }else{
            return vcards;
        }
    }
};

Player.prototype.transfer = function(cards){
    return game.transfer(this, cards);
};

var Human = function(id){
    Player.call(this, id);
    this.row.flipped = false;
};

Human.prototype = Object.create(Player.prototype);

Human.prototype.takeIn = function(cards){
    Player.prototype.takeIn.call(this,cards);
    this.row.curShifted = cards;
};

Human.prototype.next = function(){
    this.row.cards.forEach(function(c){
        [].forEach.call($('.movable'), function(e){
            e.classList.remove('movable');
        });
    });
    Player.prototype.next.call(this);
};

Human.prototype.myTurn = function(){
    if(game.getStatus() === 'start'){
        game.setStatus('passing');
        game.proceed();
    }else if(game.getStatus() === 'confirming'){
        game.interface.button.innerHTML = 'Confirm';
        game.interface.button.classList.add('show');
    }else{
        var cs = this.getValidCards();
        cs.forEach(function(c){
            c.display.classList.add('movable');
        });
        if(cs[0].id === 26){
            game.interface.showMessage('Please start with 2 of Clubs.');
        }
    }
};

Human.prototype.prepareTransfer = function(){
    game.showPassingMsg();
    this.row.cards.forEach(function(c){
        c.display.classList.add('movable');
    });
};

var Ai = function(id){
    Player.call(this, id);
};

Ai.prototype = Object.create(Player.prototype);

Ai.prototype.prepareTransfer = function(){
    var select = [], cards = [];
    while(select.length < 3){
        var s = Math.floor(Math.random() * this.row.cards.length);
        if(select.indexOf(s) === -1){
            select.push(s);
        }
    }
    for(var i = 0; i < 3; i++){
        cards.push(this.row.cards[select[i]]);
    }
    this.myTurn = function(){
        this.transfer(cards);
        delete this.myTurn;
    };
};

Ai.prototype.transfer = function(cards){
    var to = Player.prototype.transfer.call(this,cards);
    this.brain.watch({
        type: "in",
        player: game.players[to],
        cards: cards
    });
};

Ai.prototype.watch = function(info){
    this.brain.watch(info);
};

Ai.prototype.myTurn = function(){
    var ind = this.brain.decide(game.board.desk.cards);
    var card = this.row.cards[ind];
    this.row.hideOut(ind);
    game.informCardOut(this, card);
    this.next(500);
};

var PlayerBoard = function(id){
    this.id = id;
    if(!window.isDebug){
        this.display = document.createElement('div');
        this.display.className = 'info-board';
        this.nametext = document.createElement('div');
        this.nametext.className = 'player-name';
        this.scoretext = document.createElement('div');
        this.scoretext.className = 'player-score';
        this.scoretext.innerHTML = 0;
        this.finaltext = document.createElement('div');
        this.finaltext.className = 'final-score';
        this.finaltext.innerHTML = 0;

        this.display.appendChild(this.nametext);
        this.display.appendChild(this.scoretext);
        this.display.appendChild(this.finaltext);
    }
};

PlayerBoard.prototype.showFinal = function(){
    if(window.isDebug) return;
    this.display.style.marginLeft = '-55px';
    this.finaltext.classList.add('show');
};

PlayerBoard.prototype.hideFinal = function(){
    if(window.isDebug) return;
    this.display.style.marginLeft = '';
    this.finaltext.classList.remove('show');
};