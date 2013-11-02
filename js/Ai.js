define(["Player"],
function(Player){
    "use strict";

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

    return Ai;
});