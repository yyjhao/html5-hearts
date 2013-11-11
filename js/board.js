define(["Card", "jquery", "layout"],
function(Card,  $,         layout){
    var cards = [];

    for(var i = 0; i < 52; i++){
        cards.push(new Card(i));
    }

    var carddeck = [];
    for(i = 0; i < 52; i++) {
        carddeck.push(i);
    }
    return {
        cards: cards,
        init: function(){
            this.desk.cards.length = 0;
            this.desk.players.length = 0;
            var self = this;
            this.cards.forEach(function(c){
                c.parent = self;
            });
        },
        shuffleDeck: function(){
            var i;
            
            for(i = 0; i < 52; i++){
                var ran = Math.floor(Math.random() * (52 - i));
                var tmp = carddeck[ran];
                carddeck[ran] = carddeck[51-i];
                carddeck[51 - i] = tmp;
            }

            for(i = 51; i >= 0; i--){
                this.cards[carddeck[i]].ind = carddeck[i];
                this.cards[carddeck[i]].adjustPos();
            }
        },
        distribute: function(players){
            var curI = 0;
            var d = $.Deferred();
            function move(){
                if(curI === cards.length){
                    d.resolve();
                    return;
                }
                players[curI % 4].row.addCard(cards[carddeck[curI]]);
                players[curI % 4].row.adjustPos();
                curI++;
                setTimeout(move, 10);
            }
            setTimeout(function(){move();}, 300);
            return d;
        },
        getPosFor: function(ind){
            return {
                x: (52 - ind) / 4,
                y: (52 - ind) / 4,
                z: -i,
                rotateY: 180
            };
        },
        desk: {
            cards: [],
            players: [],
            getPosFor: function(ind){
                var pos = {
                    x: 0,
                    y: layout.cardHeight / 2 + layout.cardWidth / 2,
                    z: ind + 52,
                    rotateY: 0
                };
                pos.rotation = this.cards[ind].pos.rotation;
                return pos;
            },
            addCard: function(card, player){
                card.ind = this.cards.length;
                this.cards.push(card);
                this.players.push(player);
                card.parent = this;
            },
            adjustPos: function(){
                this.cards.forEach(function(c){
                    c.adjustPos();
                });
            },
            score: function(){
                var max = 0;
                for(var i = 1; i < 4; i++){
                    if( this.cards[i].suit === this.cards[max].suit && (this.cards[i].num > this.cards[max].num)){
                        max = i;
                    }
                }
                var p = this.players[max],
                    self = this;
                var nextTime = 600,
                    time = 800;
                if(window.isDebug){
                    nextTime = 0;
                    time = 0;
                }
                setTimeout(function(){
                    currentPlay = p.id;
                    p.waste.addCards(self.cards);
                    self.players = [];
                    self.cards = [];
                    if(players[0].row.cards.length === 0){
                        setTimeout(function(){
                            end();
                        },nextTime);
                    }else{
                        setTimeout(function(){
                            proceed();
                        },nextTime);
                    }
                }, time);
            }
        }
    };
});
