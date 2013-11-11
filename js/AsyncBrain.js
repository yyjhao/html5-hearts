define(["Brain"],
function(Brain){
    "use strict";

    var AsyncBrain = function(user, workerName){
        Brain.call(this, user);
        var worker = this.worker = new Worker("js/BrainWorker.js");
        this.initDefer = $.Deferred();
        var self = this;
        this.worker.onmessage = function(e){
            console.log(e)
            if(e.data.type === "decision"){
                self.curDefer.resolve(e.data.result);
                self.curDefer = null;
            } else if(e.data.type === "loaded"){
                worker.postMessage({
                    type: "ini",
                    userId: user.id,
                    brain: "McBrain"
                });
            } else if(e.data.type === "ini-ed"){
                self.initDefer.resolve();
            } else if(e.data.type === "confirmed"){
                self.confirmDefer.resolve();
            }
        };
    };

    AsyncBrain.prototype = Object.create(Brain.prototype);

    AsyncBrain.prototype.init = function(){
        return this.initDefer;
    };

    AsyncBrain.prototype.watch = function(info){
        var tinfo = {
            type: info.type,
            player: info.player.id
        };
        if(info.cards){
            tinfo.cards = info.cards.map(function(c){ return c.id; });
        }
        if(info.card){
            tinfo.card = info.card.id;
        }
        if(info.curSuit){
            tinfo.curSuit = info.curSuit;
        }
        this.worker.postMessage({
            type: "watch",
            params: tinfo
        });
    };

    AsyncBrain.prototype.confirmCards = function(){
        this.worker.postMessage({
            type: "confirm",
            cards: this.user.row.cards.map(function(c){ return c.id; })
        });
        this.confirmDefer = $.Deferred();
        return this.confirmDefer;
    };

    AsyncBrain.prototype.decide = function(validCards, boardCards, boardPlayers, scores){
        this.worker.postMessage({
            type: "decide",
            params: {
                validCards: validCards.map(function(c){ return { id: c.id, ind: c.ind }; }),
                boardCards: boardCards.map(function(c){ return c.id; }),
                boardPlayers: boardPlayers.map(function(c){ return c.id; }),
                scores: scores
            }
        });
        this.curDefer = $.Deferred();
        return this.curDefer;
    };

    return AsyncBrain;
});