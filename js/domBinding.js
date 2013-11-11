define(function(){

    var suits = ['spade', 'heart', 'club', 'diamond'];

    var frag;

    var CardDisplay = function(dom){
        this.dom = $(dom);
        this.dom.on("click", function(){
            this.onClick && this.onClick();
        }.bind(this));
    };

    CardDisplay.prototype.adjustPos = function(pos){
        if(!pos.rotation){
            pos.rotation = 0;
        }
        if(!pos.rotateY){
            pos.rotateY = 0;
        }
        this.dom.css({
            zIndex: 200 - pos.z,
            transform: 'rotate(' + pos.rotation + 'deg) translate3d(' + pos.x + 'px, ' + pos.y + 'px, ' + pos.z + 'px) rotateY(' + pos.rotateY + 'deg)'
        });
    };

    CardDisplay.prototype.setSelectable = function(yes){
        if(yes){
            this.dom.addClass("movable");
        } else {
            this.dom.removeClass("movable");
        }
    };

    CardDisplay.prototype.isSelectable = function(){
        return this.dom.is(".movable");
    };


    var PlayerDisplay = function(id, name){
        this.id = id;
        this.display = document.createElement('div');
        this.display.className = 'info-board board-' + id;
        this.nametext = document.createElement('div');
        this.nametext.className = 'player-name';
        this.nametext.innerHTML = name;
        this.scoretext = document.createElement('div');
        this.scoretext.className = 'player-score';
        this.scoretext.innerHTML = 0;
        this.finaltext = document.createElement('div');
        this.finaltext.className = 'final-score';
        this.finaltext.innerHTML = 0;

        this.display.appendChild(this.nametext);
        this.display.appendChild(this.scoretext);
        this.display.appendChild(this.finaltext);

        frag.appendChild(this.display);
    };

    PlayerDisplay.prototype.showFinal = function(){
        this.display.style.marginLeft = '-55px';
        this.finaltext.classList.add('show');
    };

    PlayerDisplay.prototype.hideFinal = function(){
        this.display.style.marginLeft = '';
        this.finaltext.classList.remove('show');
    };

    PlayerDisplay.prototype.adjustPos = function(){
        var d = $(this.display);
        d.css({
            marginLeft: -d.width() / 2,
            marginTop: -d.height() / 2
        });
    };

    PlayerDisplay.prototype.setScoreText = function(text){
        this.scoretext.innerHTML = text;
    };

    PlayerDisplay.prototype.highlight = function(){
        var b = this.scoretext.classList;
        b.add('highlight');
        setTimeout(function(){
            b.remove('highlight');
        }, 100);
    };

    return {
        fragmentToDom: function(dom){
            if(frag){
                dom.appendChild(frag);
                frag = null;
            }
        },
        createPlayerDisplay: function(id, name){
            return new PlayerDisplay(id, name);
        },
        createCardDisplay: function(numtext, suit){
            if(!frag){
                frag = document.createDocumentFragment();
            }
            var display = document.createElement('div');
            display.className = 'card flipped';
            $(display).css({
                transform: 'rotateY(180deg)'
            });

            var numText = document.createElement('div');
            numText.className = 'num';
            numText.innerHTML = numtext;

            front = document.createElement('div');
            front.className = 'front';
            front.appendChild(numText);
            display.classList.add(suits[suit]);

            var icon = document.createElement('div');
            icon.className = 'icon';
            front.appendChild(icon);

            display.appendChild(front);

            back = document.createElement('div');
            back.className = 'back';

            display.appendChild(back);

            frag.appendChild(display);

            return new CardDisplay(display);
        }
    };
});