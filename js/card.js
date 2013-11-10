define(["domBinding"],
function(domBinding){
    "use strict";

    var suits = ['spade', 'heart', 'club', 'diamond'];

    var Card = function(id){
        this.id = id;
        this.num = id % 13 + 1;
        this.suit = id % 4;
        this.flipped = true;

        var acutualNum = this.num + 1;
        var numtext = acutualNum + '';
        if(acutualNum > 10){
            numtext = ({
                11: 'J',
                12: 'Q',
                13: 'K',
                14: 'A'
            })[acutualNum];
        }
        this.display = domBinding.createCardDisplay(numtext, this.suit);
     };

    Card.suits = suits;

    Card.prototype.adjustPos = function(time){
        this.pos = this.parent.getPosFor(this.ind);
        this.display.adjustPos(this.pos);
    };

    Card.prototype.shift = function(par){
        return function(){
            if(par.parent.curShifted.indexOf(par) !== -1){
                par.parent.removeShift(par);
            }else{
                par.parent.addShift(par);
            }
        };
    };

    Card.prototype.out = function(){
        this.display.out();
    };

    return Card;
});
