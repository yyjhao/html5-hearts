define(function(){
    "use strict";

    var PlayerBoard = function(id){
        this.id = id;
        if(!window.isDebug){
            this.display = document.createElement('div');
            this.display.className = 'info-board';
            this.nametext = document.createElement('div');
            this.nametext.className = 'player-name';
            this.scoretext = document.createElement('div');
            this.scoretext.className = 'player-score';
            this.scoretext.innerHTML = 0;
            this.finaltext = document.createElement('div');
            this.finaltext.className = 'final-score';
            this.finaltext.innerHTML = 0;

            this.display.appendChild(this.nametext);
            this.display.appendChild(this.scoretext);
            this.display.appendChild(this.finaltext);
        }
    };

    PlayerBoard.prototype.showFinal = function(){
        if(window.isDebug) return;
        this.display.style.marginLeft = '-55px';
        this.finaltext.classList.add('show');
    };

    PlayerBoard.prototype.hideFinal = function(){
        if(window.isDebug) return;
        this.display.style.marginLeft = '';
        this.finaltext.classList.remove('show');
    };

    return PlayerBoard;
});