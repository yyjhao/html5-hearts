define(function(){
    "use strict";

    return {
        getValidCards: function(cards, firstSuit, isHeartBroken){
            if(firstSuit == -1){
                if(isHeartBroken){
                    return cards;
                }else if(cards.length === 13){
                    for(var i = 0; i < cards.length; i++){
                        if(cards[i].suit == 2 && cards[i].num == 1){
                            return [cards[i]];
                        }
                    }
                    return null;
                }else{
                    var vcards = cards.filter(function(c){
                        return c.suit !== 1;
                    });
                    if(vcards.length === 0){
                        return vcards.concat(cards);
                    }else{
                        return vcards;
                    }
                }
            }else{
                var vcards = cards.filter(function(c){
                    return c.suit === firstSuit;
                });
                if(vcards.length === 0){
                    if(cards.length === 13){
                        vcards = cards.filter(function(c){
                            return c.suit !== 1 && !(c.suit === 0 && c.num === 11);
                        });
                        if(vcards.length === 0){
                            vcards = cards;
                        }
                        return vcards;
                    }else{
                        return vcards.concat(cards);
                    }
                }else{
                    return vcards;
                }
            }
        }
    };
})
