define(["Row", "Waste"],
function(Row ,  Waste){
    "use strict";

    var Player = function(id){
        this.row = new Row(id, this);
        this.waste = new Waste(id, this);
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
        if(this.id === 2) this.brain = new McBrain(this);
        else if(this.id === 1) this.brain = new PomDPBrain(this);
        // else if(this.id === 2) this.brain = new randomBrain(this);
        else this.brain = new SimpleBrain(this);
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

    return Player;
});