define(function(){
    "use strict";

    var Brain = function(user){
        this.user = user;
        this.playerInfo = [[], [], [], []];
    };

    Brain.prototype.watch = function(info){};

    return Brain;
});