
var suits = ['spade', 'heart', 'club', 'diamond'];

var Card = function(id){
    this.id = id;
    this.num = id % 13 + 1;
    this.suit = id % 4;
    this.flipped = true;
    this.rotateY = 180;

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

    if(!window.isDebug){
        this.display = document.createElement('div');
        this.display.className = 'card flipped';
        this.display.style[vendorPrefix + 'Transform'] = 'rotateY(180deg)';

        var numText = document.createElement('div');
        numText.className = 'num';
        numText.innerHTML = numtext;

        this.front = document.createElement('div');
        this.front.className = 'front';
        this.front.appendChild(numText);
        this.display.classList.add(suits[this.suit]);

        var icon = document.createElement('div');
        icon.className = 'icon';
        this.front.appendChild(icon);

        this.display.appendChild(this.front);

        this.back = document.createElement('div');
        this.back.className = 'back';

        this.display.appendChild(this.back);
    }
 };

Card.suits = suits;

Card.prototype.flip = function(flipped){
    if(flipped != this.flipped){
        this.flipped = flipped;
        if(flipped){
            this.rotateY = 180;
            if(!window.isDebug) this.display.classList.add('flipped');
        }else{
            this.rotateY = 0;
            if(!window.isDebug) this.display.classList.remove('flipped');
        }
    }
};

Card.prototype.adjustPos = function(time){
    this.pos = this.parent.getPosFor(this.ind);
    this.adjustDisplay();
};

Card.prototype.adjustDisplay = function(){
    if(window.isDebug) return;
    this.display.style.zIndex = this.pos.z;
    this.display.style[vendorPrefix + 'Transform'] =
        'rotate(' + this.pos.rotation + 'deg) translate3d(' +
            this.pos.x + 'px,' + this.pos.y + 'px, 0) ' +
            'rotateY(' + this.rotateY +'deg)';
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
    if(!window.isDebug) return;
    this.display.style[vendorPrefix + 'Transform'] =
        'rotate(' + this.pos.rotation + ')';
};
