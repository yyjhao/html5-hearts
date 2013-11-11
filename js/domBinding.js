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

    return {
        fragmentToDom: function(dom){
            if(frag){
                dom.appendChild(frag);
                frag = null;
            }
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