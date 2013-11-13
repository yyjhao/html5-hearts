define(["Row", "Waste", "domBinding"],
function(Row ,  Waste,   domBinding){
    "use strict";

    var Player = function(id, name){
        this.row = new Row(id, this);
        this.waste = new Waste(id, this);
        this.id = id;
        this._score = 0;
        this._oldScore = 0;
        this.display = domBinding.createPlayerDisplay(id, name);
        this.brain = null;
        this.selected = null;

        Object.seal(this);
    };

    Player.prototype.adjustPos = function(){
        this.row.adjustPos();
        this.waste.adjustPos();
        this.display.adjustPos();
    };

    Player.prototype.initForNewRound = function(){
        this._score = 0;
        this.row.cards = [];
        this.waste.cards = [];
        this.display.rank = null;
        this.display.moveUp = false;
        this.display.adjustPos();
        this.display.setScoreText(this._oldScore);

        // if(this.id % 2 === 1) this.brain = new McBrain(this);
        // if(this.id === 2) this.brain = new McBrain(this);
        // else if(this.id === 1) this.brain = new PomDPBrain(this);
        // else if(this.id === 2) this.brain = new randomBrain(this);
        // else this.brain = new SimpleBrain(this);
        // this.brain = new RandomBrain();
    };

    Player.prototype.out = function(outCards){
        var self = this;
        outCards.forEach(function(c){
            self.row.out(c);
        });
    };

    Player.prototype.takeIn = function(inCards){
        var self = this;
        inCards.forEach(function(c){
            self.row.addCard(c);
        });
    };

    Player.prototype.clearScore = function(){
        this._score = this._oldScore = 0;
    };

    Player.prototype.setScore = function(val){
        this._score = val;
        this.display.setScoreText(this._oldScore + " + " + this._score);
    };

    Player.prototype.finalizeScore = function(){
        this._oldScore += this._score;
        this._score = 0;
        this.display.setFinalText(this._oldScore);
    };

    Player.prototype.incrementScore = function(val){
        this.setScore(this._score + val);
        if(val > 0) this.display.highlight();
    };

    Player.prototype.getScore = function(){
        return this._score;
    };

    Player.prototype.setActive = function(yes){
        this.display.setHighlight(yes);
    };

    Player.prototype.watch = function(){};

    Player.prototype.transferTo = function(other){
        var cards = this.selected;
        this.selected = null;
        this.out(cards);
        other.takeIn(cards);
    };

    return Player;
});