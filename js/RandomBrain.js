define(["Brain", "jquery"],
function(Brain,   $){
    "use strict";

    var RandomBrain = function(user){
        Brain.call(this, user);
    };

    RandomBrain.prototype = Object.create(Brain.prototype);

    RandomBrain.prototype.decide = function(validCards){
        return $.Deferred().resolve(validCards[Math.floor(Math.random() * validCards.length)].ind);
    };

    return RandomBrain;
});