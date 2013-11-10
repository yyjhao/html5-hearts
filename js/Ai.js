define(["Player", "jquery"],
function(Player,  $){
    "use strict";

    var Ai = function(id){
        Player.call(this, id);
    };

    Ai.prototype = Object.create(Player.prototype);

    Ai.prototype.prepareTransfer = function(){
        var selected = [], cards = [];
        while(selected.length < 3){
            var s = Math.floor(Math.random() * this.row.cards.length);
            if(selected.indexOf(s) === -1){
                selected.push(s);
            }
        }
        for(var i = 0; i < 3; i++){
            cards.push(this.row.cards[selected[i]]);
        }
        this.selected = selected;
        return $.Deferred.resolve();
    };

    Ai.prototype.transferTo = function(other){
        Player.prototype.transferTo.call(this, other);
        this.brain.watch({
            type: "in",
            player: other,
            cards: cards
        });
    };

    Ai.prototype.watch = function(info){
        this.brain.watch(info);
    };

    Ai.prototype.decide = function(board){
        return this.brain.decide(board);
    };

    return Ai;
});