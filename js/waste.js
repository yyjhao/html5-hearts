
var Waste = function(id){
    this.id = id;
    this.isVertical = id % 2;
    this.rotation = 90 * ((id + 1) % 4) -90;
    this.cards = [];
}

Waste.prototype.adjustPos = function(){
    if(this.isVertical){
        this.distance = game.layout.width / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
    }else{
        this.distance = game.layout.height / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
    }
    this.cards.forEach(function(c){
        c.adjustPos();
    })
}

Waste.prototype.getPosFor = function(ind){
    var pos = {
        x: 0,
        y: this.distance,
        rotation: this.rotation,
        z: ind + 52
    };
    return pos;
}

Waste.prototype.addCards = function(cards){
    this.playedBy.score += cards.reduce(function(p, c){
        if(c.suit === 1){
            return p + 1;
        }else if(c.suit === 0 && c.num === 11){
            return p + 13;
        }else{
            return p;
        }
    }, 0);
    for(var i = 0; i < cards.length; i++){
        if(cards[i].pos.rotation === this.rotation){
            cards[i].pos.z = 104;
            var finalCard = cards[i];
        }else{
            cards[i].pos.rotation = this.rotation;
            this.addCard(cards[i]);
        }
        cards[i].adjustDisplay();
    }
    this.addCard(finalCard);
    var self = this;
    setTimeout(function(){
        self.adjustPos();
    },300);
}

Waste.prototype.addCard = function(card){
    card.parent = this;
    this.cards.push(card);
}
