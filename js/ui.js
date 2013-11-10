define(function(){
    "use strict";

    var arrow = document.createElement('div'),
        button = document.createElement('button'),
        message = document.createElement('div');

    button.id = 'play-button';
    message.id = 'game-message';
    arrow.innerHTML = "&larr;";
    arrow.id = 'pass-arrow';

    document.body.appendChild(arrow);
    document.body.appendChild(button);
    document.body.appendChild(message);

    return {
        showMessage: function(msg){
            message.innerHTML = msg;
            message.style.display = 'block';
        },
        showPassingScreen: function(dir){
            var directions = ['left', 'right', 'opposite'];
            this.showMessage("Pass three cards to the " + directions[dir]);
            [function(){
                $(arrow).css("transform", 'rotate(0)');
            },function(){
                $(arrow).css("transform", 'rotate(180deg)');
            },function(){
                $(arrow).css("transform", 'rotate(90deg)');
            }][dir]();
        },
        hideMessage: function(){
            message.style.display = '';
        },
        hideButton: function(){
            $(button).removeClass("show");
        }
    };
});
