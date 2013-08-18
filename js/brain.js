var Brain = function(user){
    this.user = user;
    this.playerInfo = [[], [], [], []];
};

Brain.prototype.watch = function(info){
    // var infos = this.playerInfo;
    // info.forEach(function(a,ind){
    //     if(!a) return;
    //     var c;
    //     if(!(a instanceof Array)){
    //         c = [a];
    //     }else{
    //         c = a;
    //     }
    //     c.forEach(function(cc){
    //         infos[ind].addCard(cc);
    //     });
    // });
};

Brain.prototype.scoreOf = function(card){
    if(card.suit === 0 && card.num === 11){
        return 13;
    }else if(card.suit === 1){
        return 1;
    }else{
        return 0;
    }
};

var randomBrain = function(user){
    Brain.call(this, user);
};

randomBrain.prototype = Object.create(Brain.prototype);

// probBrain.prototype.eScore = function(card){
//     if(game.board.desk.cards.length > 0){
//         if(card.suit !== game.board.desk.cards[0].suit){
//             return 0;
//         }
//         if(game.board.desk.cards.some(function(c){
//             return c.suit === game.board.desk.cards[0].suit && c.num > card.num;
//         })){
//             return 0;
//         }
//     }
//     var score = this.scoreOf(card);
//     for(var i = 0; i < game.board.desk.cards.length; i++){
//         score += this.scoreOf(game.board.desk.cards);
//     }
//     if(game.board.desk.cards.length === 3){
//         return score;
//     }else{
//         var suit = game.board.desk.cards.length > 0 ? game.board.desk.cards[0].suit : card.suit;
//         return this.getExpected(score, suit, 3 - game.board.desk.cards.length);
//     }
    
// };

// probBrain.prototype.getExpected = function(score, suit, remaining){
//     function conjecture(pos, type){
//         if(pos === remaining){
//             //type 0: does not have any hearts
//             //type 1: has at least one hearts that is lower
//             var lower = this.countLowerCards(1),
//                 hearts = this.countCards(1),
//                 arrange = 1,
//                 others = this.getUnknownCards(4),
//                 add = 0,
//                 rest = other;
//             for(var i = 0; i < curCjt.length; i++){
//                 if(curCjt[i]){
//                     if(lower === 0){
//                         return;
//                     }
//                     add++;
//                     if(!this.getKnownLowerInSuit((first + i) % 4, 1) > 0){
//                         arrange *= this.getUnknownCards((first + i) % 4) * lower;
//                         others -= 1;
//                         lower--;
//                         rest--;
//                     }
//                 }
//             }
//             for(var i = 0; i < curCjt.length; i++){
//                 if(!curCjt[i]){
//                     if(this.getUnknownInSuit((first + i) % 4, 1) > 0){
//                         return;
//                     }
//                     others -= this.getUnknownCards((first + i) % 4);
//                     if(others < hearts){
//                         return;
//                     }
//                 }
//             }
//             arrange *= this.waysChoose(others, hearts) * this.fac(rest - hearts);
//             r += (score + add) * arrange;
//         }else{
//             for(var type = 0; type < 2; type++){
//                 curCjt[pos] = type;
//                 conjecture(pos + 1, type);
//             }
//         }
//     }
//     if(suit === 1){
//         var r = 0, curCjt = [], first = this.user.id + 1;
//         conjecture(0, 0);
//         conjecture(0, 1);
//         return r / this.countAllArrangements();
//     }else{
//         var r = 0, curCjt = [], first = this.user.id + 1;
//         function conjecture(pos, type){
//             if(pos === remaining){
//                 //type 0: hasLower
//                 //type 1: doesNotHaveSuit but hasQS
//                 //type 2: doesNotHaveSuit or QS but hasHearts
//                 //type 3: doesNotHaveSuit or QS or Hearts
//                 var lower = this.countLowerCards(suit),
//                     sui = this.getUnknownCards(suit),
//                     hearts = this.getUnknownCards(1),
//                     allSuit = this.getUnknownCards(suit),
//                     arrange = 1,
//                     qs = this.getUnknownCards(5),
//                     others = this.getUnknownCards(4),
//                     rest = others,
//                     add = 0,
//                     hasQs = [],
//                     hasHearts = [],
//                     hasLower = [],
//                     noSuit = [],
//                     noQs = []；
//                     noHearts = []，
//                     unknownCards = [];
//                 for(var i = 0; i < remaining; i++){
//                     unknownCards[i] = this.getUnknownCards((i + first) % 4);
//                 }
//                 for(var i = 0; i < curCjt.length; i++){
//                     var cur = i;
//                     [
//                         function(){
//                             hasLower.push(cur);
//                         },
//                         function(){
//                             hasQs.push(cur);
//                             noSuit.push(cur);
//                         },
//                         function(){
//                             hasHearts.push(cur);
//                             noSuit.push(cur);
//                             noQs.push(cur);
//                         },
//                         function(){
//                             noSuit.push(cur);
//                             noQs.push(cur);
//                             noHearts.push(cur);
//                         }
//                     ][curCjt[i]]();
//                 }
//                 for(var i = 0; i < hasLower.length; i++){
//                     if(lower === 0){
//                         return;
//                     }
//                     if(!this.hasLowerInSuit(hasLower[i],suit)){
//                         arrange *= unknownCards[i];
//                         lower--;
//                         unknownCards[i]--;
//                     }
//                 }
//                 for(var i = 0; i < hasQs.length; i++){
//                     if(qs === 0){
//                         return;
//                     }else{
//                         add += 13;
//                         arrange *= unknownCards[i];
//                         unknownCards[i]--;
//                         qs--;
//                     }
//                 }
//                 for(var i = 0; i < hasHearts.length; i++){
//                     if(hearts === 0){
//                         return;
//                     }
//                     add++;
//                     if(this.numCardInSuit((first + i) % 4, 1) > 0){
//                         arrange *= unknownCards[i];
//                         unknownCards[i]--;
//                         hearts--;
//                     }
//                 }
//                 var sum = 0;
//                 if(noSuit.length > 0){
//                     for(var i = 0; i < unknownCards.length; i++){
//                         if(noSuit.indexOf(i) < 0){
//                             sum += unknownCards[i];
//                         }
//                     }
//                     if(sum < suit){
//                         return;
//                     }
//                     arrange *= this.choose(sum, suit);
//                     sum -= suit;
//                 }else{
//                     for(var i = 0; i < remaining; i++){
//                         noSuit.push(i);
//                     }
//                 }
//                 if(noQs.length > 0){
//                     for(var i = 0; i < unknownCards.length; i++){
//                         if(noSuit.indexOf(i) >= 0 && noQs.indexOf(i) < 0){
//                             sum += unknownCards[i];
//                         }
//                     }
//                     if(sum < qs){
//                         return;
//                     }
//                     arrange *= this.choose(sum, qs);
//                     sum -= qs;
//                 }
//                 for(var i = 0; i < unknownCards.length; i++){
//                     if(noSuit.indexOf(i) >= 0 && noQs.indexOf(i) >= 0 && noHearts.indexOf(i) < 0){
//                         sum += unknownCards[i];
//                     }
//                 }
//                 if(sum < hearts){
//                     return;
//                 }
//                 arrange *= this.choose(sum, hearts);
//                 sum -= hearts;
//                 r += (score + add) * arrange;
//             }else{
//                 for(var type = 0; type < 4; type++){
//                     curCjt[pos] = type;
//                     conjecture(pos + 1, type);
//                 }
//             }
//         }
//         for(var i = 0; i < 4; i++){
//             conjecture(0, i);
//         }
//         return r / this.countAllArrangement();
//     }
// };

randomBrain.prototype.decide = function(board){
    // var a = 10,
    //     b = 1,
    //     vc = this.user.getValidCards(),
    //     len = vc.length,
    //     min = 0,
    //     minS = 1/0;

    // for(var i = 0;i < len; i++){
    //     var score = a * this.eScore(vc[i]) + b * this.wScore(vc[i]);
    //     if(score < minS){
    //         min = i;
    //         minS = score;
    //     }
    // }

    // return vc[min].ind;
    var vc = this.user.getValidCards();
    return vc[Math.floor(Math.random() * vc.length)].ind;
};