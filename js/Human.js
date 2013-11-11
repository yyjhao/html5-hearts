define(["Player", "jquery", "ui"],
function(Player,  $,         ui){
    "use strict";

    var Human = function(id){
        Player.call(this, id);
        this.row.flipped = false;
    };

    Human.prototype = Object.create(Player.prototype);

    Human.prototype.takeIn = function(cards){
        Player.prototype.takeIn.call(this,cards);
        this.row.setSelected(cards);
    };

    Human.prototype.decide = function(validCards){
        validCards.forEach(function(c){
            c.display.setSelectable(true);
        });
        var d = $.Deferred();
        var row = this.row;
        ui.buttonClickOnce(function(){
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
        this.row.maxShift = 3;
        var d = $.Deferred();
        var row = this.row;
        ui.arrowClickOnce(function(){
            this.selected = row.getSelected();
            this.row.maxShift = 1;
            this.row.cards.forEach(function(c){
                c.display.setSelectable(false);
            });
            d.resolve();
        }.bind(this));

        return d;
    };

    Human.prototype.rowSelected = function(){
        if(this.row.maxShift === 3){
            ui.showArrow();
        } else {
            ui.showButton("Go!");
        }
    };

    Human.prototype.rowDeselected = function(){
        if(this.row.maxShift === 3){
            ui.hideArrow();
        } else {
            ui.hideButton();
        }
    };

    return Human;
});