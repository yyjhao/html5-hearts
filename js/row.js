define(["layout"],
function(layout){
    "use strict";

    var Row = function(id, player){
        this.id = id;
        this.cards = [];
        this.isVertical = id%2;
        this.rotation = 90 * (( id + 1) % 4) - 90;
        this.curShifted = [];
        this.flipped = true;
        this.playedBy = player;
    };

    Row.prototype.addCard = function(card){
        card.parent = this;
        card.ind = this.cards.length;
        this.cards.push(card);
        if(!this.flipped){
            card.display.onmouseup = card.shift(card);
        }
    };

    Row.prototype.getSelected = function(){
        return [].concat(this.curShifted);
    };

    Row.prototype.setSelected = function(cards){
        this.curShifted = [].concat(cards);
    };

    Row.prototype.adjustPos = function(){
        if(this.isVertical){
            this.distance = layout.width / 2 - layout.rowMargin - layout.cardHeight / 2;
        }else{
            this.distance = layout.height / 2 - layout.rowMargin - layout.cardHeight / 2;
        }
        this.left = -((this.cards.length - 1) * layout.cardSep) / 2;
        this.cards.forEach(function(c){
            c.adjustPos();
        });
    };

    Row.prototype.getPosFor = function(ind){
        var pos = {
            x: this.left + ind * layout.cardSep,
            y: this.distance,
            rotation: this.rotation,
            rotateY: this.flipped ? 180 : 0,
            z: ind
        };
        if(this.curShifted.indexOf(this.cards[ind]) > -1){
            pos.y -= 30;
        }
        return pos;
    };

    Row.prototype.sort = function(){
        this.cards.sort(function(a, b){
            if(a.suit != b.suit) return b.suit - a.suit;
            return a.num - b.num;
        }).forEach(function(v, ind){
            v.ind = ind;
        });
        this.adjustPos();
    };

    Row.prototype.addShift = function(nc){
        if(this.curShifted.length === this.maxShift){
            this.curShifted.shift();
        }
        this.curShifted.push(nc);
        if(this.curShifted.length === this.maxShift){
            this.playedBy.rowSelected(this.maxShift);
        }
        this.adjustPos();
    };

    Row.prototype.out = function(card){
        card.parent = null;
        var ind = this.cards.indexOf(card);
        this.curShifted = [];
        this.cards.splice(ind, 1);
        for(var i = ind; i < this.cards.length; i++){
            this.cards[i].ind = i;
        }
        this.adjustPos();
    };

    Row.prototype.removeShift = function(nc){
        this.curShifted = this.curShifted.filter(function(v){
            return v !== nc;
        });
        this.playedBy.rowDeselected();
        this.adjustPos();
    };

    Row.prototype.hideOut = function(ind){
        var tmp = this.cards[ind];
        var mid = Math.floor(this.cards.length / 2);
        this.cards[ind] = this.cards[mid];
        this.cards[mid] = tmp;
        this.cards[ind].ind = ind;
        this.cards[mid].ind = mid;
        if(!window.isDebug){
            this.cards[ind].display.style[vendorPrefix + 'Transition'] = 'none';
            this.cards[mid].display.style[vendorPrefix + 'Transition'] = 'none';
        }
        this.cards[mid].adjustPos();
        this.cards[ind].adjustPos();
        if(!window.isDebug){
            this.cards[ind].display.style[vendorPrefix + 'Transition'] = '';
            this.cards[mid].display.style[vendorPrefix + 'Transition'] = '';
        }
        var self = this;
        setTimeout(function(){
            self.out(mid, true);
        }, window.isDebug ? 0 : 100);
    };

    return Row;
});
