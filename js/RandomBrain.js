defind(["Brain"],
function(Brain){
    "use strict";

    var RandomBrain = function(user){
        Brain.call(this, user);
    };

    RandomBrain.prototype = Object.create(Brain.prototype);

    RandomBrain.prototype.decide = function(board){
        var vc = this.user.getValidCards();
        return vc[Math.floor(Math.random() * vc.length)].ind;
    };

    return RandomBrain;
});