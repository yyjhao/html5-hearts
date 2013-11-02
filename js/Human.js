define(["Player"],
function(Player){
    "use strict";

    var Human = function(id){
        Player.call(this, id);
        this.row.flipped = false;
    };

    Human.prototype = Object.create(Player.prototype);

    Human.prototype.takeIn = function(cards){
        Player.prototype.takeIn.call(this,cards);
        this.row.curShifted = cards;
    };

    Human.prototype.next = function(){
        this.row.cards.forEach(function(c){
            [].forEach.call($('.movable'), function(e){
                e.classList.remove('movable');
            });
        });
        Player.prototype.next.call(this);
    };

    Human.prototype.myTurn = function(){
        if(game.getStatus() === 'start'){
            game.setStatus('passing');
            game.proceed();
        }else if(game.getStatus() === 'confirming'){
            game.interface.button.innerHTML = 'Confirm';
            game.interface.button.classList.add('show');
        }else{
            var cs = this.getValidCards();
            cs.forEach(function(c){
                c.display.classList.add('movable');
            });
            if(cs[0].id === 26){
                game.interface.showMessage('Please start with 2 of Clubs.');
            }
        }
    };

    Human.prototype.prepareTransfer = function(){
        game.showPassingMsg();
        this.row.cards.forEach(function(c){
            c.display.classList.add('movable');
        });
    };

    return Human;
});