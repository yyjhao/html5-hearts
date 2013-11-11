define(["Player", "jquery"],
function(Player,  $){
    "use strict";

    var Ai = function(id, name){
        Player.call(this, id, name);
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
        this.selected = cards;
        return $.Deferred().resolve();
    };

    Ai.prototype.confirmTransfer = function(){
        return $.Deferred().resolve();
    };

    Ai.prototype.transferTo = function(other){
        var selected = this.selected;
        Player.prototype.transferTo.call(this, other);
        this.brain.watch({
            type: "in",
            player: other,
            cards: selected
        });
    };

    Ai.prototype.watch = function(info){
        this.brain.watch(info);
    };

    Ai.prototype.decide = function(validCards, boardCards, boardPlayers, scores){
        return this.brain.decide(validCards, boardCards, boardPlayers, scores).then(function(c){
            return this.row.cards[c];
        }.bind(this));
    };

    return Ai;
});