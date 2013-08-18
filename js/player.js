
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
            if(v > this._score){
                var b = this.board.scoretext.classList;
                b.add('highlight');
                setTimeout(function(){
                    b.remove('highlight');
                },100);
            }
            this._score = v;
            if(game.getRounds() > 0){
                this.board.scoretext.innerHTML = this._oldScore + '+' + v;
            }else{
                this.board.scoretext.innerHTML = v;
            }
        }
    });
    Object.defineProperty(this, 'name', {
        get: function(){
            return this._name;
        },
        set: function(v){
            this._name = v;
            this.board.nametext.innerHTML = v;
        }
    });
    Object.defineProperty(this, 'oldScore', {
        get: function(){
            return this._oldScore;
        },
        set: function(v){
            this._oldScore = v;
            this.board.finaltext.innerHTML = v;
        }
    });
};

Player.prototype.initForNewRound = function(){
    this.score = 0;
    this.row.cards = [];
    this.waste.cards = [];
};

Player.prototype.next = function(delay){
    game.nextPlayer(this.id);
    if(delay){
        setTimeout(function(){
            game.proceed();
        },delay);
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

Player.prototype.getValidCards = function(){
    if(game.board.isEmpty()){
        if(game.isHeartBroken()){
            return this.row.cards;
        }else if(this.row.cards.length === 13){
            return [game.board.cards[26]];
        }else{
            var cards = this.row.cards.filter(function(c){
                return c.suit !== 1;
            });
            if(cards.length === 0){
                return this.row.cards;
            }else{
                return cards;
            }
        }
    }else{
        var cards = this.row.cards.filter(function(c){
            return c.suit === game.board.desk.cards[0].suit;
        });
        if(cards.length === 0){
            return this.row.cards;
        }else{
            return cards;
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
    this.brain = new probBrain(this);
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
    var to = Player.prototype.transfer.call(this,cards),
        info = [null,null,null,null];
    info[to] = cards;
    this.brain.watch(info);
};

Ai.prototype.watch = function(){
    this.brain.watch(game.board.desk.cards);
};

Ai.prototype.myTurn = function(){
    this.row.hideOut(this.brain.decide());
    this.next(500);
};

var PlayerBoard = function(id){
    this.id = id;
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
};

PlayerBoard.prototype.showFinal = function(){
    this.display.style.marginLeft = '-55px';
    this.finaltext.classList.add('show');
};

PlayerBoard.prototype.hideFinal = function(){
    this.display.style.marginLeft = '';
    this.finaltext.classList.remove('show');
};