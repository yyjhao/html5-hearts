define(["Player", "jquery"],
function(Player,  $){
    "use strict";

    var Human = function(id, ui){
        Player.call(this, id);
        this.row.flipped = false;
    };

    Human.prototype = Object.create(Player.prototype);

    Human.prototype.takeIn = function(cards){
        Player.prototype.takeIn.call(this,cards);
        this.row.setCurShifted(cards);
    };

    Human.prototype.decide = function(){
        var cs = this.getValidCards();
        cs.forEach(function(c){
            c.display.setSelectable(true);
        });
        var d = $.Deferred();
        var row = this.row;
        ui.buttonOnOnce(function(){
            d.resolve(row.getSelected()[0]);
        });
        return d;
    };

    Human.prototype.doneTransfer = function(){
        this.row.curShifted = [];
        this.row.adjustPos();
    };

    Human.prototype.prepareTransfer = function(){
        this.row.cards.forEach(function(c){
            c.display.setSelectable(true);
        });
        var d = $.Deferred();
        var row = this.row;
        var self = this;
        ui.buttonOnOnce(function(){
            d.resolve();
            self.selected = row.getSelected();
        });

        return d;
    };

    return Human;
});