define(["Row", "Waste", "RandomBrain", "domBinding"],
function(Row ,  Waste,   RandomBrain,   domBinding){
    "use strict";

    var Player = function(id, name){
        this.row = new Row(id, this);
        this.waste = new Waste(id, this);
        this.id = id;
        this.score = 0;
        this.oldScore = 0;
        this.display = domBinding.createPlayerDisplay(id, name);
    };

    Player.prototype.adjustPos = function(){
        this.row.adjustPos();
        this.waste.adjustPos();
        this.display.adjustPos();
    };

    Player.prototype.initForNewRound = function(){
        this.score = 0;
        this.row.cards = [];
        this.waste.cards = [];

        // if(this.id % 2 === 1) this.brain = new McBrain(this);
        // if(this.id === 2) this.brain = new McBrain(this);
        // else if(this.id === 1) this.brain = new PomDPBrain(this);
        // else if(this.id === 2) this.brain = new randomBrain(this);
        // else this.brain = new SimpleBrain(this);
        this.brain = new RandomBrain();
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

    Player.prototype.watch = function(){};

    Player.prototype.transferTo = function(other){
        var cards = this.selected;
        this.selected = null;
        this.out(cards);
        other.takeIn(cards);
    };

    return Player;
});