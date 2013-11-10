define(["layout"],
function(layout){
    "use strict";

    var Row = function(id){
        this.id = id;
        this.cards = [];
        this.isVertical = id%2;
        this.rotation = 90 * (( id + 1) % 4) - 90;
        this.curShifted = [];
        this.flipped = true;
    };

    Row.prototype.addCard = function(card){
        card.parent = this;
        card.ind = this.cards.length;
        this.cards.push(card);
        if(!this.flipped){
            card.display.onmouseup = card.shift(card);
        }
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
        this.cards.forEach(function(v){
            v.adjustPos();
        });
    };

    Row.prototype.addShift = function(nc){
        if(!nc.display.classList.contains('movable'))return;
        ({
            'start': function(){
                if(this.curShifted.length === 3){
                    this.curShifted.shift();
                }
                this.curShifted.push(nc);
                if(this.curShifted.length === 3){
                    game.interface.arrow.classList.add('show');
                }
            },
            'playing': function(){
                this.curShifted.pop();
                this.curShifted.push(nc);
                this.showButton();
            },
            'confirming': function(){}
        })[game.getStatus()].call(this);
        this.adjustPos();
    };

    Row.prototype.showButton = function(){
        if(window.isDebug) return;
        game.interface.button.innerHTML = 'Go!';
        game.interface.button.classList.add('show');
    };


    Row.prototype.out = function(ind, toDesk){
        this.curShifted = [];
        var c = this.cards[ind];
        if(c.suit === 1 && toDesk){
            game.informHeartBroken();
        }
        if(!window.isDebug){
            c.display.onmouseup = null;
        }
        this.cards.splice(ind, 1);
        for(var i = ind; i < this.cards.length; i++){
            this.cards[i].ind = i;
        }
        if(toDesk){
            game.board.desk.addCard(c);
            c.adjustPos();
            this.adjustPos();
        }
    };

    Row.prototype.removeShift = function(nc){
        if(game.getStatus() === 'confirming') return;
        game.interface.arrow.classList.remove('show');
        game.interface.button.classList.remove('show');
        this.curShifted = this.curShifted.filter(function(v){
            return v !== nc;
        });
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
