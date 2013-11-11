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
        clearEvents: function(){
            $(button).off("click");
            $(arrow).off("click");
        },
        showArrow: function(){
            arrow.classList.add('show');
        },
        hideArrow: function(){
            arrow.classList.remove('show');
        },
        showButton: function(text){
            button.innerHTML = text;
            button.classList.add('show');
        },
        hideButton: function(text){
            button.classList.remove('show');
        },
        arrowClickOnce: function(cb){
            $(arrow).on("click", function(){
                cb();
                $(this).off("click");
            });
        },
        buttonClickOnce: function(cb){
            $(button).on("click", function(){
                cb();
                $(this).off("click");
            });
        },
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
        }
    };
});
