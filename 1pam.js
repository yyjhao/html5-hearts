var window = {
    isDebug: true
};(function(){
    var allScores = [],
        games = 0,
        maxGames = 1000,
        scoreSums = [0, 0, 0, 0];
    var showStats = function(){
        console.log(allScores);
        var sums = [0, 0, 0, 0];
        allScores.forEach(function(ss){
            ss.forEach(function(s, ind){
                sums[ind] += s;
            });
        });
        console.log("sums: ", sums);
    };
    var test = window.tester = {
        log: function(msg, players, cards){
            if(!window.isDebug) return;
            if(!(players instanceof Array)){
                players = [players];
            }

            if(!(cards instanceof Array)){
                cards = [cards];
            }

            var text = "[log] " + msg + ": players [" +
                        players.map(function(p){ return p.id; }).join(", ") +
                        "] cards [" +
                        cards.map(function(c){
                            return "{" + (c.num + 1) + ", " + (Card.suits[c.suit]) + "}";
                        }).join(", ");

            // console.log(text + "<br>");
        },
        informNewGame: function(){
            if(!window.isDebug) return;
            console.log("Current game: " + games);
            games++;
            if(games > maxGames){
                showStats();
                process.exit();
            }
        },
        recordScore: function(scores){
            if(!window.isDebug) return;
            allScores.push(scores);
            scores.forEach(function(s, ind){
                scoreSums[ind] += s;
            });
            console.log(scoreSums);
        }
    };
})();var $ = function(query){
    return document.querySelectorAll(query);
};

var vendorPrefix = (function(){
    if(window.isDebug) return "";
    var prefixes = ['Moz', 'Webkit', 'O', 'ms'],
        tran = "Transform";

    var el = document.createElement('div');

    for (var i=0; i<prefixes.length; ++i) {
      var vendorTran = prefixes[i] + tran;
      if (vendorTran in el.style){
        return prefixes[i];
      }
  }
})();
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
var Row = function(id){
    this.id = id;
    this.cards = [];
    this.isVertical = id%2;
    this.rotation = 90 * (( id + 1) % 4) - 90;
    this.curShifted = [];
    this.flipped = true;
};

Row.prototype.addCard = function(card){
    card.parent = this;
    card.ind = this.cards.length;
    this.cards.push(card);
    card.flip(this.flipped);
    if(!window.isDebug && !this.flipped){
        card.display.onmouseup = card.shift(card);
    }
};

Row.prototype.adjustPos = function(){
    if(window.isDebug) return;
    if(this.isVertical){
        this.distance = game.layout.width / 2 - game.layout.rowMargin - game.layout.cardHeight / 2;
        this.playedBy.board.display.style.top = game.layout.height / 2 - game.layout.boardHeight / 2 + 'px';
        if(this.id === 1){
            this.playedBy.board.display.style.left = game.layout.rowMargin * 1.5 + 'px';
        }else{
            this.playedBy.board.display.style.left = game.layout.width - game.layout.rowMargin * 1.5 - game.layout.boardWidth + 'px';
        }
    }else{
        this.distance = game.layout.height / 2 - game.layout.rowMargin - game.layout.cardHeight / 2;
        this.playedBy.board.display.style.left = game.layout.width / 2 - game.layout.boardWidth / 2 + 'px';
        if(this.id === 0){
            this.playedBy.board.display.style.top = game.layout.height - 30 - game.layout.rowMargin * 1.5 - game.layout.boardHeight - game.layout.cardHeight + 'px';
        }else{
            this.playedBy.board.display.style.top = 30 + game.layout.rowMargin * 1.5 + 'px';
        }
    }
    this.left = -((this.cards.length - 1) * game.layout.cardSep) / 2;
    this.playedBy.board.display.classList.remove('table');
    if(game.getStatus() === 'end'){
        var top = game.layout.height / 2 - 2 * (game.layout.boardHeight + 10),
            left = game.layout.width / 2 - game.layout.boardWidth / 2;
        var b = this.playedBy.board;
        b.display.style.top = top + b.rank * (game.layout.boardHeight + 10) + 'px';
        b.display.style.left = left + 'px';
        b.display.classList.add('table');
    }
    this.cards.forEach(function(c){
        c.adjustPos();
    });
};

Row.prototype.getPosFor = function(ind){
    var pos = {
        x: this.left + ind * game.layout.cardSep,
        y: this.distance,
        rotation: this.rotation,
        z: ind
    };
    if(this.curShifted.indexOf(this.cards[ind]) > -1){
        pos.y -= 30;
    }
    return pos;
};

Row.prototype.sort = function(){
    this.cards.sort(function(a, b){
        if(a.suit != b.suit) return b.suit - a.suit;
        return a.num - b.num;
    }).forEach(function(v, ind){
        v.ind = ind;
    });
    this.cards.forEach(function(v){
        v.adjustPos();
    });
};

Row.prototype.addShift = function(nc){
    if(!nc.display.classList.contains('movable'))return;
    ({
        'start': function(){
            if(this.curShifted.length === 3){
                this.curShifted.shift();
            }
            this.curShifted.push(nc);
            if(this.curShifted.length === 3){
                game.interface.arrow.classList.add('show');
            }
        },
        'playing': function(){
            this.curShifted.pop();
            this.curShifted.push(nc);
            this.showButton();
        },
        'confirming': function(){}
    })[game.getStatus()].call(this);
    this.adjustPos();
};

Row.prototype.showButton = function(){
    if(window.isDebug) return;
    game.interface.button.innerHTML = 'Go!';
    game.interface.button.classList.add('show');
};


Row.prototype.out = function(ind, toDesk){
    this.curShifted = [];
    var c = this.cards[ind];
    if(c.suit === 1 && toDesk){
        game.informHeartBroken();
    }
    if(!window.isDebug){
        c.display.onmouseup = null;
    }
    this.cards.splice(ind, 1);
    for(var i = ind; i < this.cards.length; i++){
        this.cards[i].ind = i;
    }
    if(toDesk){
        game.board.desk.addCard(c);
        c.adjustPos();
        this.adjustPos();
    }
};

Row.prototype.removeShift = function(nc){
    if(game.getStatus() === 'confirming') return;
    game.interface.arrow.classList.remove('show');
    game.interface.button.classList.remove('show');
    this.curShifted = this.curShifted.filter(function(v){
        return v !== nc;
    });
    this.adjustPos();
};

Row.prototype.hideOut = function(ind){
    var tmp = this.cards[ind];
    var mid = Math.floor(this.cards.length / 2);
    this.cards[ind] = this.cards[mid];
    this.cards[mid] = tmp;
    this.cards[ind].ind = ind;
    this.cards[mid].ind = mid;
    if(!window.isDebug){
        this.cards[ind].display.style[vendorPrefix + 'Transition'] = 'none';
        this.cards[mid].display.style[vendorPrefix + 'Transition'] = 'none';
    }
    this.cards[mid].adjustPos();
    this.cards[ind].adjustPos();
    if(!window.isDebug){
        this.cards[ind].display.style[vendorPrefix + 'Transition'] = '';
        this.cards[mid].display.style[vendorPrefix + 'Transition'] = '';
    }
    var self = this;
    setTimeout(function(){
        self.out(mid, true);
    }, window.isDebug ? 0 : 100);
};

var Waste = function(id){
    this.id = id;
    this.isVertical = id % 2;
    this.rotation = 90 * ((id + 1) % 4) -90;
    this.cards = [];
};

Waste.prototype.adjustPos = function(){
    if(window.isDebug) return;
    if(this.isVertical){
        this.distance = game.layout.width / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
    }else{
        this.distance = game.layout.height / 2 + game.layout.rowMargin + game.layout.cardHeight / 2;
    }
    this.cards.forEach(function(c){
        c.adjustPos();
    });
};

Waste.prototype.getPosFor = function(ind){
    var pos = {
        x: 0,
        y: this.distance,
        rotation: this.rotation,
        z: ind + 52
    };
    return pos;
};

Waste.prototype.addCards = function(cards){
    this.playedBy.score += cards.reduce(function(p, c){
        if(c.suit === 1){
            return p + 1;
        }else if(c.suit === 0 && c.num === 11){
            return p + 13;
        }else{
            return p;
        }
    }, 0);
    for(var i = 0; i < cards.length; i++){
        if(cards[i].pos.rotation === this.rotation){
            cards[i].pos.z = 104;
            var finalCard = cards[i];
        }else{
            cards[i].pos.rotation = this.rotation;
            this.addCard(cards[i]);
        }
        cards[i].adjustDisplay();
    }
    this.addCard(finalCard);
    var self = this;
    setTimeout(function(){
        self.adjustPos();
    }, window.isDebug ? 0 : 300);
};

Waste.prototype.addCard = function(card){
    card.parent = this;
    this.cards.push(card);
};
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
};var cardsInfo = [];

for(var i = 0; i < 52; i++){
    cardsInfo.push({
        num: i % 13 + 1,
        suit: i % 4
    });
}

function infoToCardId(num, suit){
    var r = num - 1;
    while(r % 4 !== suit){
        r += 13;
    }
    return r;
}

function removeFromUnorderedArray(arr, item){
    // console.trace();
    if(!arr.length) return;
    var ind = arr.indexOf(item);
    if(ind === -1) return;
    arr[ind] = arr[arr.length - 1];
    arr.pop();
}
var simpleBrain = function(user){
    Brain.call(this, user);
};

simpleBrain.prototype = Object.create(Brain.prototype);

simpleBrain.prototype.decide = function(board){
    var vc = this.user.getValidCards(),
        len = vc.length,
        suit = -1, maxNum = -1;

    if(board.length){
        suit = board[0].suit;
        maxNum = board.reduce(function(prev, cur){
            if(cur.suit === suit && cur.num > prev){
                return cur.num;
            }else{
                return prev;
            }
        }, 0);
        return vc.reduce(function(prev, cur){
            if(prev.suit === cur.suit){
                if(cur.suit === suit){
                    if(cur.num < maxNum){
                        if(prev.num > maxNum || prev.num < cur.num) return cur;
                        else return prev;
                    }else if(cur.num > maxNum && prev.num > maxNum && board.length === 3){
                        if(cur.num > prev.num) return cur;
                        else return prev;
                    }else if(cur.num < prev.num){
                        return cur;
                    }else{
                        return prev;
                    }
                }else{
                    if(cur.num > prev.num) return cur;
                    else return prev;
                }
            }else{
                if(cur.suit === 0 && cur.num === 11) return cur;
                if(prev.suit === 0 && prev.num === 11) return prev;
                if(cur.suit === 1) return cur;
                if(prev.suit === 1) return prev;
                if(cur.num > prev.num) return cur;
                return prev;
            }
        }).ind;
    }else{
        return vc.reduce(function(prev, cur){
            if(prev.num > cur.num) return cur;
            else return prev;
        }).ind;
    }
};var Simulator = function(){
    this.curCards = [[], [], [], []];
    this.curPlayers = [];
    this.curBoard = [];
    this.heartBroken = false;
    this.curP = 0;

    this.tmpVc = [];
};

Simulator.prototype.run = function(curPlayers, curBoard, heartBroken, curCards, cardToPlay, myID){
    this.curCards.forEach(function(t, ind){
        t.length = 0;
        [].push.apply(t, curCards[ind]);
    });

    this.curPlayers.length = 0;
    [].push.apply(this.curPlayers, curPlayers);

    this.curBoard.length = 0;
    [].push.apply(this.curBoard, curBoard);

    this.heartBroken = heartBroken;

    this.curP = myID;

    this.scores = game.players.map(function(p){ return p.score; });
    this._play(myID, cardToPlay);
    this._rollout();

    var moonShooter = -1;
    this.scores.forEach(function(s, ind){
        if(s === 26) moonShooter = ind;
    });

    if(moonShooter !== -1){
        if(moonShooter === this.curP) return -26;
        else return 26;
    }

    return this.scores[this.curP];
};

Simulator.prototype._play = function(player, card){
    this.curPlayers.push(player);
    this.curBoard.push(card);

    if(cardsInfo[card].suit === 1){
        this.heartBroken = true;
    }

    removeFromUnorderedArray(this.curCards[player], card);
};

Simulator.prototype._getValidCards = function(cards){
    this.tmpVc.length = 0;
    var vc = this.tmpVc;
    if(this.curBoard.length === 0){
        if(this.heartBroken){
            [].push.apply(this.tmpVc, cards);
        } else {
            cards.forEach(function(c){
                if(cardsInfo[c].suit !== 1){
                    vc.push(c);
                }
            });
        }
    } else {
        var suit = cardsInfo[this.curBoard[0]].suit;
        cards.forEach(function(c){
            if(cardsInfo[c].suit === suit){
                vc.push(c);
            }
        });
    }
    if(!vc.length){
        [].push.apply(vc, cards);
    }

    return this.tmpVc;
};

Simulator.prototype._rollout = function(){
    var curPlayer = this.curP;
    curPlayer++;
    curPlayer %= 4;

    while(this.curBoard.length < 4){
        this._play(curPlayer, this._othersDecide(this.curCards[curPlayer]));
        curPlayer++;
        curPlayer %= 4;
    }

    // end the first round
    this._endRound();

    while(this.curCards[this.nextFirst].length){
        curPlayer = this.nextFirst;
        while(this.curBoard.length < 4){
            if(curPlayer === this.curP){
                this._play(curPlayer, this._iDecide(this.curCards[curPlayer]));
            }else{
                this._play(curPlayer, this._othersDecide(this.curCards[curPlayer]));
            }
            curPlayer++;
            curPlayer %= 4;
        }
        this._endRound();
    }
};

Simulator.prototype._endRound = function(){
    var len = this.curCards[0].length;
    for(var i = 1; i < 4; i++){
        if(len != this.curCards[i].length) throw "what!";
    }
    var curSuit = cardsInfo[this.curBoard[0]].suit,
        maxCard = 0,
        maxNum = cardsInfo[this.curBoard[0]].num,
        i,
        score = 0;

    for(i = 0; i < 4; i++){
        var c = cardsInfo[this.curBoard[i]];
        if(c.suit === curSuit && c.num > maxNum){
            maxNum = c.num;
            maxCard = i;
        }

        if(c.suit === 1) score += 1;
        if(c.suit === 0 && c.num === 11) score += 13;
    }

    this.scores[this.curPlayers[maxCard]] += score;

    this.nextFirst = this.curPlayers[maxCard];
    this.curBoard.length = 0;
    this.curPlayers.length = 0;
};

Simulator.prototype._othersDecide = function(cards){
    var vc = this._getValidCards(cards),
        len = vc.length,
        suit = -1, maxNum = -1,
        board = this.curBoard;
    // return vc[Math.floor(vc.length * Math.random())];

    if(board.length){
        suit = cardsInfo[board[0]].suit;
        maxNum = board.reduce(function(prev, curc){
            var cur = cardsInfo[curc];
            if(cur.suit === suit && cur.num > prev){
                return cur.num;
            }else{
                return prev;
            }
        }, 0);
        return vc.reduce(function(prevc, curc){
            var cur = cardsInfo[curc],
                prev = cardsInfo[prevc];
            if(prev.suit === cur.suit){
                if(cur.suit === suit){
                    if(cur.num < maxNum){
                        if(prev.num > maxNum || prev.num < cur.num) return curc;
                        else return prevc;
                    }else if(cur.num > maxNum && prev.num > maxNum && board.length === 3){
                        if(cur.num > prev.num) return curc;
                        else return prevc;
                    }else if(cur.num < prev.num){
                        return curc;
                    }else{
                        return prevc;
                    }
                }else{
                    if(cur.num > prev.num) return curc;
                    else return prevc;
                }
            }else{
                if(cur.suit === 0 && cur.num === 11) return curc;
                if(prev.suit === 0 && prev.num === 11) return prevc;
                if(cur.suit === 1) return curc;
                if(prev.suit === 1) return prevc;
                if(cur.num > prev.num) return curc;
                return prevc;
            }
        });
    }else{
        return vc.reduce(function(prev, cur){
            if(cardsInfo[prev].num > cardsInfo[cur].num) return cur;
            else return prev;
        });
    }
};


// Simulator.prototype._iDecide = function(cards){
//     var vc = this._getValidCards(cards);
//     return vc[Math.floor(vc.length * Math.random())];
// };
Simulator.prototype._iDecide = Simulator.prototype._othersDecide;

var McBrain = function(user){
    Brain.call(this, user);

    this.samplePlayers = [[], [], [], []];
    this.tmpSample = [[], [], [], []];

    this.playersInfo = [
        {
            hasCard: [],
            lackCard: {},
            numCards: 13,
            score: 0
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13,
            score: 0
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13,
            score: 0
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13,
            score: 0
        }
    ];

    this.remainingCards = [];
    for(var i = 0; i < 52; i++){
        this.remainingCards.push(i);
    }

    this.cardLackCount = cardsInfo.map(function(){
        return 0;
    });

    this.simulator = new Simulator();
};

McBrain.prototype = Object.create(Brain.prototype);

McBrain.prototype.removeRemainingCard = function(id){
    removeFromUnorderedArray(this.remainingCards, id);
    this.playersInfo.forEach(function(p){
        removeFromUnorderedArray(p.hasCard, id);
    });
};

McBrain.prototype.markLackCard = function(c, player){
    if(!player.lackCard[c]){
        player.lackCard[c] = true;
        this.cardLackCount[c]++;
    }
};

McBrain.prototype.watch = function(info){
    if(info.type === "in"){
        info.cards.forEach(function(c){
            this.removeRemainingCard(c.id);
        }.bind(this));
        [].push.apply(this.playersInfo[info.player.id].hasCard, info.cards.map(function(c){
            return c.id;
        }));
        this.user.row.cards.forEach(function(c){
            this.removeRemainingCard(c.id);
            this.samplePlayers[this.user.id].push(c.id);
        }.bind(this));
    }else{
        this.playersInfo[info.player.id].numCards--;
        this.removeRemainingCard(info.card.id);
        var markLackCard = this.markLackCard.bind(this),
            lackCardPlayer = this.playersInfo[info.player.id];
        if(game.board.desk.cards.length){
            var curSuit = game.board.desk.cards[0].suit;
            if(curSuit !== info.card.suit){
                this.remainingCards.forEach(function(c){
                    if(cardsInfo[c].suit === curSuit){
                        markLackCard(c, lackCardPlayer);
                    }
                });
            }
        }
    }
};

McBrain.prototype.decide = function(board){
    var vc = this.user.getValidCards();

    var r;

    if(vc.length === 1){
        r = vc[0];
    }else{

        var samples = 0,
            pids = game.board.desk.players.map(function(p){ return p.id; }),
            cids = game.board.desk.cards.map(function(p){ return p.id; }),
            endTime = Date.now() + 1000;
        var scores = vc.map(function(c){
            return 0;
        });
        var i;
        this.preGenSample();
        while(true){
            this.genSample();
            if(Date.now() >= endTime) break;
            samples++;
            for(i = 0; i < vc.length; i++){
                scores[i] += this.simulator.run(pids, cids, game.isHeartBroken(), this.samplePlayers, vc[i].id, this.user.id);
            }
            // alert(samples);
        }
        if(!window.isDebug) console.log("Generate", samples);

        var minScore = 1/0, bestC;
        for(i = 0; i < scores.length; i++){
            if(minScore > scores[i]){
                minScore = scores[i];
                bestC = i;
            }
        }
        r = vc[bestC];

        // console.log(minScore, bestC, scores, vc);
    }

    removeFromUnorderedArray(this.samplePlayers[this.user.id], r.id);

    return r.ind;
};

McBrain.prototype.preGenSample = function(){
    var cardLackCount = this.cardLackCount;
    this.remainingCards.sort(function(a, b){
        return cardLackCount[b] - cardLackCount[a];
    });
};

McBrain.prototype.genSample = function(){
    var id = this.user.id,
        sample = this.samplePlayers,
        playersInfo = this.playersInfo;

    var tryT = 1000000, ind;
    while(tryT--){
        sample.forEach(function(p, ind){
            if(ind !== id){
                p.length = 0;
            }
            p.id = ind;
        });
        this.playersInfo.forEach(function(p, ind){
            [].push.apply(sample[ind], p.hasCard);
        });
        var toAdd = sample.filter(function(s, ind){
            return s.length < playersInfo[ind].numCards;
        });
        ind = 0;
        var sum = 0;
        var summ = 0;
        toAdd.forEach(function(to){
            sum += to.length;
            summ += playersInfo[to.id].numCards;
        });
        while(ind < this.remainingCards.length){
            var c = this.remainingCards[ind];
            var allPossible = toAdd.length;
            var aid = 0;
            while(aid < allPossible){
                if(this.playersInfo[toAdd[aid].id].lackCard[c]){
                    allPossible--;
                    var tmp = toAdd[allPossible];
                    toAdd[allPossible] = toAdd[aid];
                    toAdd[aid] = tmp;
                }else{
                    aid++;
                }
            }
            if(allPossible === 0){
                break;
            }
            var pToAdd = Math.floor(Math.random() * allPossible);
            toAdd[pToAdd].push(c);
            ind++;
            if(toAdd[pToAdd].length === playersInfo[toAdd[pToAdd].id].numCards){
                removeFromUnorderedArray(toAdd, toAdd[pToAdd]);
                if(toAdd.length === 0){
                    break;
                }
            }
        }
        if(ind === this.remainingCards.length){
            break;
        }
    }
    if(tryT === -1){
        console.log(this.remainingCards, this.playersInfo);
        alert("fail to gen sample");
    }
    if(sample.some(function(s, ind){
        return s.length !== playersInfo[ind].numCards;
    })){
        console.log(this.remainingCards.length, sample, playersInfo, tryT);
        throw "eh";
    }
};"use strict";

var PomDPSimulator = function(id){
    this.observationBuffer = [];
    this.playerId = id;
    this.tmpVc = [];
};

PomDPSimulator.prototype._playCard = function(card) {
    var playerCard = (this.curPlayer + 1) * 100 + card;

    var board = this.state.board;
    this.state.board.push(playerCard);
    this.observationBuffer.push(playerCard);

    removeFromUnorderedArray(this.state.players[this.curPlayer], card);

    var boardScore = 0,
        curSuit,
        maxPlayer,
        maxNum = 0;

    if(this.state.board.length === 4){
        curSuit = cardsInfo[board[0] % 100].suit;
        for(var i = 0; i < 4; i++){
            var player = ((board[i] / 100) | 0) - 1,
                c = cardsInfo[board[i] % 100];
            if(c.suit === 1){
                boardScore += 1;
            } else if (c.num === 11 && c.suit === 0){
                boardScore += 13;
            }
            if(c.suit === curSuit && c.num > maxNum) {
                maxNum = c.num;
                maxPlayer = player;
            }
        }
        this.state.scores[maxPlayer] += boardScore;
        this.curPlayer = maxPlayer;
        this.state.board.length = 0;
    } else {
        this.curPlayer = (this.curPlayer + 1) % 4;
    }
};

PomDPSimulator.prototype._getValidCards = function(cards){
    var vc = this.tmpVc;
    this.tmpVc.length = 0;
    if(this.state.board.length === 0){
        if(cards.length === 13) {
            this.tmpVc.push(26);
        }else if(this.state.heartBroken){
            [].push.apply(this.tmpVc, cards);
        } else {
            cards.forEach(function(c){
                if(cardsInfo[c].suit !== 1){
                    vc.push(c);
                }
            });
        }
    } else {
        var suit = cardsInfo[this.state.board[0] % 100].suit;
        cards.forEach(function(c){
            if(cardsInfo[c].suit === suit){
                vc.push(c);
            }
        });
    }
    if(!vc.length){
        [].push.apply(vc, cards);
    }

    return this.tmpVc;
};

PomDPSimulator.prototype._decide = function(player) {
    var cards = this.state.players[player];
    if(!cards.length) return null;
    var vc = this._getValidCards(cards),
        len = vc.length,
        suit = -1, maxNum = -1,
        board = this.state.board;

    if(board.length){
        suit = cardsInfo[board[0] % 100].suit;
        maxNum = board.reduce(function(prev, curc){
            var cur = cardsInfo[curc % 100];
            if(cur.suit === suit && cur.num > prev){
                return cur.num;
            }else{
                return prev;
            }
        }, 0);
        return vc.reduce(function(prevc, curc){
            var cur = cardsInfo[curc],
                prev = cardsInfo[prevc];
            if(prev.suit === cur.suit){
                if(cur.suit === suit){
                    if(cur.num < maxNum){
                        if(prev.num > maxNum || prev.num < cur.num) return curc;
                        else return prevc;
                    }else if(cur.num > maxNum && prev.num > maxNum && board.length === 3){
                        if(cur.num > prev.num) return curc;
                        else return prevc;
                    }else if(cur.num < prev.num){
                        return curc;
                    }else{
                        return prevc;
                    }
                }else{
                    if(cur.num > prev.num) return curc;
                    else return prevc;
                }
            }else{
                if(cur.suit === 0 && cur.num === 11) return curc;
                if(prev.suit === 0 && prev.num === 11) return prevc;
                if(cur.suit === 1) return curc;
                if(prev.suit === 1) return prevc;
                if(cur.num > prev.num) return curc;
                return prevc;
            }
        });
    }else{
        return vc.reduce(function(prev, cur){
            if(cardsInfo[prev].num > cardsInfo[cur].num) return cur;
            else return prev;
        });
    }
};

PomDPSimulator.prototype.step = function(s, a){
    var players = s.players,
        heartBroken = s.heartBroken,
        board = s.board,
        scores = s.scores,
        oriScore = s.scores[this.playerId];
    this.state = s;
    this.curPlayer = this.playerId;

    this._playCard(a);

    while(this.curPlayer !== this.playerId){
        var toPlay = this._decide(this.curPlayer);
        if(toPlay === null) break;
        this._playCard(toPlay);
    }
    var moonShooter = -1, outputScore = oriScore - this.state.scores[this.playerId];
    this.state.scores.forEach(function(s, ind){
        if(s === 26) {
            moonShooter = ind;
        }
    });
    if(moonShooter !== -1){
        if (!window.isDebug) console.log(this.state.scores);
        if(moonShooter === this.playerId){
            outputScore = oriScore + 26;
        } else {
            outputScore = oriScore - 26;
        }
    }
    var result = {
        state: s,
        observation: this.observationBuffer.concat([]),
        score: outputScore
    };

    this.observationBuffer.length = 0;

    return result;
};

PomDPSimulator.prototype.run = function(s){
    var players = s.players,
        heartBroken = s.heartBroken,
        board = s.board,
        oriScore = s.scores[this.playerId];
    this.state = s;
    this.curPlayer = this.playerId;
    
    while(1){
        var toPlay = this._decide(this.curPlayer);
        if(toPlay === null) break;
        this._playCard(toPlay);
    }
    var moonShooter = -1, outputScore = oriScore - this.state.scores[this.playerId];
    this.state.scores.forEach(function(s, ind){
        if(s === 26) moonShooter = ind;
    });
    if(moonShooter !== -1){
        if(moonShooter === this.playerId){
            outputScore = oriScore + 26;
        } else {
            outputScore = oriScore - 26;
        }
    }

    this.observationBuffer.length = 0;

    return outputScore;
};
"use strict";

var PomDPBrain = function(user, c){
    this.c = c || 10;
    this.user = user;
    this.ind = user.id;
    this.simulator = new PomDPSimulator(user.id);
    var remainingCards = [];
    for(var i = 0; i < 52; i++){
        remainingCards.push(i);
    }
    this.root = {
        count: 0,
        value: 0,
        observations: {},
        info: {
            playersInfo: [
                {
                    hasCards: [],
                    lackCard: {},
                    numCards: 13,
                    score: 0
                },
                {
                    hasCards: [],
                    lackCard: {},
                    numCards: 13,
                    score: 0
                },
                {
                    hasCards: [],
                    lackCard: {},
                    numCards: 13,
                    score: 0
                },
                {
                    hasCards: [],
                    lackCard: {},
                    numCards: 13,
                    score: 0
                }
            ],
            remainingCards: remainingCards,
            curBoard: [],
            heartBroken: false,
            cardLackCount: remainingCards.map(function(){ return 0; })
        }
    };
    this.observationBuffer = [];
};

PomDPBrain.prototype = Object.create(Brain.prototype);

PomDPBrain.prototype.search = function(){
    // var times = 500;
    var endTime = Date.now() + 1000;
    var times = 0;
    while(Date.now() < endTime){
        var state = this.genSample(this.root);
        this.simulate(state, this.root, 0);
        times++;
    }
    if(!window.isDebug) console.log("Simulate", times);
    var actions = Object.keys(this.root.actions).map(function(a) { return parseInt(a, 10); }),
        gameactions = this.user.getValidCards().map(function(v){ return v.id; });

    if(!window.isDebug) console.log(actions, this.user.getValidCards());

    actions.forEach(function(a){
        if(gameactions.indexOf(a) === -1) throw "mismatch " + a;
        removeFromUnorderedArray(gameactions, a);
    });
    if(gameactions.length) throw "mismatch " + gameactions.join(" ");

    var best = -1/0,
        bestAction = 0;
    for(var a in this.root.actions){
        if(this.root.actions[a].value > best){
            best = this.root.actions[a].value;
            bestAction = a;
        }
    }
    if(!window.isDebug) console.log(this.root);
    this.root = this.root.actions[bestAction];
    return bestAction;
};

PomDPBrain.prototype.rollout = function(s, h, depth){
    // h.count++;
    var val = this.simulator.run(s);
    // h.value = ((h.count - 1) * h.value + val) / h.count;
    return val;
};

PomDPBrain.prototype.simulate = function(s, h, depth){
    if(h.terminate) return 0;
    if(!h.actions){
        var as = h.actions = {};
        this.getAllActions(h).forEach(function(a){
            if(a == "undefined" || (!a && a !== 0)) throw a;
            as[a] = this.initAction(h, a);
        }.bind(this));
        return this.rollout(s, h, depth);
    }
    var best,
        bestScore = -1/0;
    for(var a in h.actions){
        var score = this.getScore(h.actions[a]);
        if(score > bestScore){
            bestScore = score;
            best = a;
        }
    }
    if(!best){
        if(window.isDebug) console.log(JSON.stringify(h, null, "    "));
        else console.log(h);
        throw "eh";
    }

    var simulateResult = this.simulator.step(s, parseInt(best, 10));

    var ha = h.actions[best],
        ohash = simulateResult.observation.join("");
    if(!(ohash in ha.observations)) {
        ha.observations[ohash] = this.initObservation(ha, simulateResult.observation);
    }

    var r = simulateResult.score + this.simulate(simulateResult.state, ha.observations[ohash], depth + 1);
    h.count++;
    ha.count++;
    ha.value = (ha.value * (ha.count - 1) + r) / ha.count;
    return r;
};

PomDPBrain.prototype.getScore = function(action){
    if(!action.count) return 1/0;
    return action.value + this.c * Math.sqrt(Math.log(action.parent.count) / action.count);
};

PomDPBrain.prototype.getAllActions = function(history){
    var info = history.info;
    if(info.curBoard.length){
        var suit = cardsInfo[info.curBoard[0] % 100].suit;
        var r = info.playersInfo[this.ind].hasCards.filter(function(c){
            return cardsInfo[c].suit === suit;
        });
        if(!r.length){
            return [].concat(info.playersInfo[this.ind].hasCards);
        } else {
            return r;
        }
    } else if (info.playersInfo[this.ind].hasCards.length === 13) {
        return [26];
    }else if (info.heartBroken) {
        return [].concat(info.playersInfo[this.ind].hasCards);
    } else {
        var possible = info.playersInfo[this.ind].hasCards.filter(function(c){
            return cardsInfo[c].suit !== 1;
        });
        if(possible.length) return possible;
        else return [].concat(info.playersInfo[this.ind].hasCards);
    }
};

PomDPBrain.prototype.initObservation = function(history, observation){
    var pinfo = history.info;
    var curBoard = [].concat(pinfo.curBoard),
        heartBroken = pinfo.heartBroken,
        playersInfo = pinfo.playersInfo.map(function(info){
            return {
                hasCards: [].concat(info.hasCards),
                lackCard: Object.create(info.lackCard),
                numCards: info.numCards,
                score: info.score
            };
        }),
        remainingCards = [].concat(pinfo.remainingCards),
        cardLackCount = [].concat(pinfo.cardLackCount);
    var info = {
        curBoard: curBoard,
        heartBroken: heartBroken,
        playersInfo: playersInfo,
        hash: observation.join(""),
        cardLackCount: cardLackCount,
        remainingCards: remainingCards
    };
    observation.forEach(function(ob){
        var pid = ((ob / 100) | 0) - 1;
        playersInfo[pid].numCards--;
        this.removeRemainingCard(ob % 100, info);
        heartBroken = heartBroken || (cardsInfo[ob % 100].suit === 1);
        var curSuit;
        if(curBoard.length){
            curSuit = cardsInfo[curBoard[0] % 100].suit;
            if(curSuit){
                if(curSuit !== cardsInfo[ob % 100].suit){
                    var lackCardPlayer = playersInfo[pid];
                    remainingCards.forEach(function(c){
                        if(cardsInfo[c].suit === curSuit){
                            lackCardPlayer.lackCard[c] = true;
                            cardLackCount[c]++;
                        }
                    });
                }
            }
        }
        curBoard.push(ob);
        if(curBoard.length === 4){
            var maxNum = -1, maxPlayer = 0, boardScore = 0;
            for(var i = 0; i < 4; i++){
                var bcard = cardsInfo[curBoard[i] % 100];
                if(bcard.suit === curSuit && bcard.num > maxNum){
                    maxPlayer = ((curBoard[i] / 100) | 0) - 1;
                    maxNum = bcard.num;
                }
                if(bcard.suit === 1) boardScore++;
                else if(bcard.suit === 0 && bcard.num === 11) boardScore += 13;
            }
            playersInfo[maxPlayer].score += boardScore;
            curBoard.length = 0;
        }
    }.bind(this));
    info.heartBroken = heartBroken;
    remainingCards.sort(function(a, b){
        return cardLackCount[b] - cardLackCount[a];
    });

    var terminate = !playersInfo.some(function(p){
        return p.numCards > 0;
    });

    return {
        info: info,
        count: 0,
        value: 0,
        terminate: terminate
    };
};

PomDPBrain.prototype.initAction = function(history, action){
    var info = history.info;
    var curBoard = [].concat(info.curBoard),
        heartBroken = info.heartBroken,
        playersInfo = info.playersInfo.map(function(info){
            return {
                hasCards: [].concat(info.hasCards),
                lackCard: Object.create(info.lackCard),
                numCards: info.numCards,
                score: info.score
            };
        }),
        remainingCards = [].concat(info.remainingCards),
        cardLackCount = [].concat(info.cardLackCount);
    return {
        value: 0,
        count: 0,
        parent: history,
        action: action,
        observations: {},
        info : {
            curBoard: curBoard,
            heartBroken: heartBroken,
            playersInfo: playersInfo,
            cardLackCount: cardLackCount,
            remainingCards: remainingCards
        }
    };
};

PomDPBrain.prototype.removeRemainingCard = function(id, info){
    removeFromUnorderedArray(info.remainingCards, id);
    info.playersInfo.forEach(function(p, ind){
        removeFromUnorderedArray(p.hasCards, id);
    });
};

PomDPBrain.prototype.watch = function(info){
    if(info.type === "in"){
        info.cards.forEach(function(c){
            this.removeRemainingCard(c.id, this.root.info);
        }.bind(this));
        [].push.apply(this.root.info.playersInfo[info.player.id].hasCards, info.cards.map(function(c){
            return c.id;
        }));
        this.user.row.cards.forEach(function(c){
            this.removeRemainingCard(c.id, this.root.info);
            this.root.info.playersInfo[this.ind].hasCards.push(c.id);
        }.bind(this));
    }else{
        this.observationBuffer.push(info.card.id + (info.player.id + 1) * 100);
    }
};

PomDPBrain.prototype.decide = function(board){
    if(this.observationBuffer.join("") in this.root){
        this.root = this.root[this.observationBuffer.join("")];
    } else {
        this.root = this.initObservation(this.root, this.observationBuffer);
    }
    this.observationBuffer = [];

    var action = parseInt(this.search(this.root), 10);

    var vc = this.user.getValidCards();

    for(var i = 0; i < vc.length; i++){
        if(vc[i].id === action){
            return vc[i].ind;
        }
    }
    if(!window.isDebug) console.log(vc, action);
    throw "failed to find card, something must be of wrongness";
};

PomDPBrain.prototype.genSample = function(node){
    var id = this.ind,
        sample = [[], [], [], []],
        playersInfo = node.info.playersInfo,
        remainingCards = node.info.remainingCards;

    var tryT = 1000, ind;
    while(tryT--){
        sample.forEach(function(p, ind){
            p.length = 0;
            p.id = ind;
        });
        playersInfo.forEach(function(p, ind){
            [].push.apply(sample[ind], p.hasCards);
        });
        var toAdd = sample.filter(function(s, ind){
            return s.length < playersInfo[ind].numCards;
        });
        ind = 0;
        var sum = 0;
        var summ = 0;
        toAdd.forEach(function(to){
            sum += to.length;
            summ += playersInfo[to.id].numCards;
        });
        while(ind < remainingCards.length){
            var c = remainingCards[ind];
            var allPossible = toAdd.length;
            var aid = 0;
            while(aid < allPossible){
                if(playersInfo[toAdd[aid].id].lackCard[c]){
                    allPossible--;
                    var tmp = toAdd[allPossible];
                    toAdd[allPossible] = toAdd[aid];
                    toAdd[aid] = tmp;
                }else{
                    aid++;
                }
            }
            if(allPossible === 0){
                break;
            }
            var pToAdd = Math.floor(Math.random() * allPossible);
            toAdd[pToAdd].push(c);
            ind++;
            if(toAdd[pToAdd].length === playersInfo[toAdd[pToAdd].id].numCards){
                removeFromUnorderedArray(toAdd, toAdd[pToAdd]);
                if(toAdd.length === 0){
                    break;
                }
            }
        }
        if(ind === remainingCards.length){
            break;
        }
    }
    if(tryT === -1){
        alert("fail to gen sample");
    }
    if(sample.some(function(s, ind){
        return s.length !== playersInfo[ind].numCards;
    })){
        throw "eh";
    }
    if(tryT < 900) console.log("Try", tryT);
    return {
        players: sample,
        scores: node.info.playersInfo.map(function(info){ return info.score; }),
        board: node.info.curBoard.concat([]),
        heartBroken: node.info.heartBroken
    };
};
var Player = function(id){
    this.row = new Row(id);
    this.row.playedBy = this;
    this.waste = new Waste(id);
    this.waste.playedBy = this;
    this.board = game.interface.playerBoards[id];
    this.id = id;
    this._score = 0;
    this._name = '';
    this._oldScore = 0;
    Object.defineProperty(this, 'score', {
        get: function(){
            return this._score;
        },
        set: function(v){
            if(!window.isDebug){
                if(v > this._score){
                    var b = this.board.scoretext.classList;
                    b.add('highlight');
                    setTimeout(function(){
                        b.remove('highlight');
                    },100);
                }
                if(game.getRounds() > 0){
                    this.board.scoretext.innerHTML = this._oldScore + '+' + v;
                }else{
                    this.board.scoretext.innerHTML = v;
                }
            }
            this._score = v;
        }
    });
    Object.defineProperty(this, 'name', {
        get: function(){
            return this._name;
        },
        set: function(v){
            this._name = v;
            if(!window.isDebug){
                this.board.nametext.innerHTML = v;
            }
        }
    });
    Object.defineProperty(this, 'oldScore', {
        get: function(){
            return this._oldScore;
        },
        set: function(v){
            this._oldScore = v;
            if(!window.isDebug){
                this.board.finaltext.innerHTML = v;
            }
        }
    });
};

Player.prototype.initForNewRound = function(){
    this.score = 0;
    this.row.cards = [];
    this.waste.cards = [];

    // if(this.id % 2 === 1) this.brain = new McBrain(this);
    //if(this.id === 0) this.brain = new McBrain(this);
    if(this.id === 1) this.brain = new PomDPBrain(this);
    // else if(this.id === 2) this.brain = new randomBrain(this);
    else this.brain = new McBrain(this);
};

Player.prototype.next = function(delay){
    game.nextPlayer(this.id);
    if(delay){
        setTimeout(function(){
            game.proceed();
        }, window.isDebug ? 0 : delay);
    }else{
        game.proceed();
    }
};

Player.prototype.watch = function(){};

Player.prototype.myTurn = function(){};

Player.prototype.out = function(outCards){
    var self = this;
    outCards.forEach(function(c){
        self.row.out(self.row.cards.indexOf(c));
    });
};

Player.prototype.takeIn = function(inCards){
    var self = this;
    inCards.forEach(function(c){
        self.row.addCard(c);
    });
};

Player.prototype.getValidCards = function(cards, _game){
    cards = cards || this.row.cards;
    var game = _game || window.game;
    if(game.board.isEmpty()){
        if(game.isHeartBroken()){
            return cards;
        }else if(cards.length === 13){
            return [game.board.cards[26]];
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
            return c.suit === game.board.desk.cards[0].suit;
        });
        if(vcards.length === 0){
            return vcards.concat(cards);
        }else{
            return vcards;
        }
    }
};

Player.prototype.transfer = function(cards){
    return game.transfer(this, cards);
};

var Human = function(id){
    Player.call(this, id);
    this.row.flipped = false;
};

Human.prototype = Object.create(Player.prototype);

Human.prototype.takeIn = function(cards){
    Player.prototype.takeIn.call(this,cards);
    this.row.curShifted = cards;
};

Human.prototype.next = function(){
    this.row.cards.forEach(function(c){
        [].forEach.call($('.movable'), function(e){
            e.classList.remove('movable');
        });
    });
    Player.prototype.next.call(this);
};

Human.prototype.myTurn = function(){
    if(game.getStatus() === 'start'){
        game.setStatus('passing');
        game.proceed();
    }else if(game.getStatus() === 'confirming'){
        game.interface.button.innerHTML = 'Confirm';
        game.interface.button.classList.add('show');
    }else{
        var cs = this.getValidCards();
        cs.forEach(function(c){
            c.display.classList.add('movable');
        });
        if(cs[0].id === 26){
            game.interface.showMessage('Please start with 2 of Clubs.');
        }
    }
};

Human.prototype.prepareTransfer = function(){
    game.showPassingMsg();
    this.row.cards.forEach(function(c){
        c.display.classList.add('movable');
    });
};

var Ai = function(id){
    Player.call(this, id);
};

Ai.prototype = Object.create(Player.prototype);

Ai.prototype.prepareTransfer = function(){
    var select = [], cards = [];
    while(select.length < 3){
        var s = Math.floor(Math.random() * this.row.cards.length);
        if(select.indexOf(s) === -1){
            select.push(s);
        }
    }
    for(var i = 0; i < 3; i++){
        cards.push(this.row.cards[select[i]]);
    }
    this.myTurn = function(){
        this.transfer(cards);
        delete this.myTurn;
    };
};

Ai.prototype.transfer = function(cards){
    var to = Player.prototype.transfer.call(this,cards);
    this.brain.watch({
        type: "in",
        player: game.players[to],
        cards: cards
    });
};

Ai.prototype.watch = function(info){
    this.brain.watch(info);
};

Ai.prototype.myTurn = function(){
    var ind = this.brain.decide(game.board.desk.cards);
    var card = this.row.cards[ind];
    this.row.hideOut(ind);
    game.informCardOut(this, card);
    this.next(500);
};

var PlayerBoard = function(id){
    this.id = id;
    if(!window.isDebug){
        this.display = document.createElement('div');
        this.display.className = 'info-board';
        this.nametext = document.createElement('div');
        this.nametext.className = 'player-name';
        this.scoretext = document.createElement('div');
        this.scoretext.className = 'player-score';
        this.scoretext.innerHTML = 0;
        this.finaltext = document.createElement('div');
        this.finaltext.className = 'final-score';
        this.finaltext.innerHTML = 0;

        this.display.appendChild(this.nametext);
        this.display.appendChild(this.scoretext);
        this.display.appendChild(this.finaltext);
    }
};

PlayerBoard.prototype.showFinal = function(){
    if(window.isDebug) return;
    this.display.style.marginLeft = '-55px';
    this.finaltext.classList.add('show');
};

PlayerBoard.prototype.hideFinal = function(){
    if(window.isDebug) return;
    this.display.style.marginLeft = '';
    this.finaltext.classList.remove('show');
};(function(){
    var game = window.game = {};

    var status = 'prepare',
        heartBroken = false,
        currentPlay = 0,
        players = [],
        rounds = -1,
        directions = ['left', 'right', 'opposite'],
        transferred = 0;

    game.players = players;

    var interface = game.interface = {
        arrow: window.isDebug ? null : document.createElement('div'),
        button: window.isDebug ? null : document.createElement('button'),
        message: window.isDebug ? null : document.createElement('div'),
        showMessage: function(msg){
            if(window.isDebug) {
                console.log(msg);
                return;
            }
            this.message.innerHTML = msg;
            this.message.style.display = 'block';
        },
        hideMessage: function(){
            if(window.isDebug) {
                return;
            }
            this.message.style.display = '';
        },
        playerBoards: [],
        endMessage: window.isDebug ? null : document.createElement('div')
    };

    var board = game.board = {
        cards: [],
        isEmpty: function(){
            return this.desk.cards.length === 0;
        },
        desk: {
            cards: [],
            players: [],
            getPosFor: function(ind){
                var pos = {
                    x: 0,
                    y: layout.cardHeight / 2 + layout.cardWidth / 2,
                    z: ind + 52
                };
                pos.rotation = this.cards[ind].pos.rotation;
                return pos;
            },
            addCard: function(card, applying){
                card.ind = this.cards.length;
                this.cards.push(card);
                if(!applying){
                    this.players.push(card.parent.playedBy);
                }
                card.parent = this;
                card.flip(false);
            },
            adjustPos: function(){
                this.cards.forEach(function(c){
                    c.adjustPos();
                });
            },
            score: function(){
                var max = 0;
                for(var i = 1; i < 4; i++){
                    if( this.cards[i].suit === this.cards[max].suit && (this.cards[i].num > this.cards[max].num)){
                        max = i;
                    }
                }
                var p = this.players[max],
                    self = this;
                var nextTime = 600,
                    time = 800;
                if(window.isDebug){
                    nextTime = 0;
                    time = 0;
                }
                setTimeout(function(){
                    currentPlay = p.id;
                    p.waste.addCards(self.cards);
                    self.players = [];
                    self.cards = [];
                    if(players[0].row.cards.length === 0){
                        setTimeout(function(){
                            end();
                        },nextTime);
                    }else{
                        setTimeout(function(){
                            proceed();
                        },nextTime);
                    }
                }, time);
            }
        }
    };

    var layout = game.layout = {
        width: 500,
        height: 500,
        cardSep: 30,
        cardHeight: 130,
        cardWidth: 85,
        rowMargin: 10,
        boardHeight: 55,
        boardWidth: 250,
        adjust: function(){
            if(window.isDebug) return;
            var region = $('#game-region')[0];
            this.width = region.offsetWidth;
            this.height = region.offsetHeight;
            players.forEach(function(r){
                r.row.adjustPos();
                r.waste.adjustPos();
            });
            board.desk.adjustPos();
        }
    };

    var proceed = game.proceed = function(){
        ({
            'prepare': function(){
                tester.informNewGame();
                if(!window.isDebug){
                    [].forEach.call($('.movable'), function(c){
                        c.classList.remove('movable');
                    });
                    interface.hideMessage();
                    interface.button.classList.remove('show');
                }
                rounds++;
                players.forEach(function(p){
                    p.initForNewRound();
                });
                board.desk.cards.length = 0;
                board.desk.players.length = 0;
                board.cards.forEach(function(c){
                    c.parent = null;
                    c.flip(true);
                });
                heartBroken = false;
                layout.adjust();
                function move(){
                    if(curI === board.cards.length){
                        players.forEach(function(v){v.row.sort();});
                        setTimeout(function(){
                            status = 'start';
                            proceed();
                        }, window.isDebug ? 0 : 300);
                        return;
                    }
                    players[curI % 4].row.addCard(board.cards[carddeck[curI]]);
                    players[curI % 4].row.adjustPos();
                    if(curI%4 === 0){
                        var pc = board.cards[carddeck[curI]];
                    }
                    curI++;
                    setTimeout(move, window.isDebug ? 0 : 10);
                }
                curI = 0;
                var carddeck=[];
                var i;
                for(i=0;i<52;i++) {
                    carddeck.push(i);
                }

                for(i = 0; i < 52; i++){
                    var ran=Math.floor(Math.random()*(52-i));
                    var tmp = carddeck[ran];
                    carddeck[ran]=carddeck[51-i];
                    carddeck[51 - i]=tmp;
                }
                if(!window.isDebug){
                    for(i = 51; i >= 0; i--){
                        var c = board.cards[carddeck[i]].display.style;
                        c.zIndex = 200 - i * 3;
                        c[vendorPrefix + 'Transform'] = 'translate3d(-' + (52-i)/4+'px,-' + (52-i)/4 + 'px, -' + i +'px) rotateY(180deg)';
                    }
                }
                setTimeout(function(){move();}, window.isDebug ? 0 : 300);
            },
            'start': function(){
                players.forEach(function(p){
                    p.prepareTransfer();
                });
                transferred = 0;
                if(window.isDebug){
                    status = 'passing';
                    currentPlay = 0;
                    proceed();
                }
            },
            'passing': function(){
                if(transferred === 4){
                    players.forEach(function(r){
                        r.row.sort();
                    });
                    if(window.isDebug){
                        status = "playing";
                        currentPlay = board.cards[26].parent.playedBy.id;
                        setTimeout(proceed, 0);
                    }else{
                        status = 'confirming';
                        players[0].myTurn();
                    }
                }else{
                    players[currentPlay].myTurn();
                }
            },
            'confirming': function(){
                if(!window.isDebug){
                    interface.button.classList.add('show');
                }
                players[0].row.curShifted = [];
                players[0].row.adjustPos();
                currentPlay = board.cards[26].parent.playedBy.id;
                setTimeout(function(){
                    status = 'playing';
                    proceed();
                }, window.isDebug ? 0 : 100);
            },
            'playing': function(){
                if(!window.isDebug){
                    interface.button.classList.remove('show');
                }
                if(board.desk.cards.length === 4){
                    board.desk.score();
                }else if(players[0].row.curShifted.length === 1){
                    interface.hideMessage();
                    var card = players[0].row.curShifted[0];
                    players[0].row.out(card.ind, true);
                    game.informCardOut(players[0], card);
                    players[0].next();
                }else{
                    players[currentPlay].myTurn();
                }
            },
            'allEnd': function(){
                if(!window.isDebug){
                    interface.playerboards.foreach(function(p){
                            p.display.style[vendorprefix + 'transform'] = "";
                    });
                   interface.endMessage.classList.remove('show');
                }
                players.forEach(function(p){
                    p.score = p.oldScore = 0;
                });
                rounds = -1;
                if(!window.isDebug){
                    interface.playerBoards.forEach(function(p){
                        p.hideFinal();
                        p.display.classList.remove('table');
                    });
                }
                newGame();
            },
            'end': function(){
                if(!window.isDebug){
                    interface.playerBoards.forEach(function(p){
                        p.hideFinal();
                        p.display.classList.remove('table');
                    });
                }
                newRound();
            }
        })[status]();
    };

    game.informCardOut = function(player, card){
        tester.log("place", player, card);
        players.forEach(function(p){
            p.watch({
                type: "out",
                player: player,
                card: card
            });
        });
    };

    game.init = function(){
        var frag;
        if(!window.isDebug){
            frag = document.createDocumentFragment();
        }
        var i;
        for(i=0;i<52;i++){
            var c = new Card(i);
            board.cards.push(c);
            if(!window.isDebug){
                frag.appendChild(c.display);
            }
        }
        for(i=0;i<4;i++){
            var b = new PlayerBoard(i);
            interface.playerBoards.push(b);
            if(!window.isDebug){
                frag.appendChild(b.display);
            }
        }
        if(!window.isDebug){
            interface.playerBoards[0].display.classList.add('human');
        }
        game.players = players = [
            window.isDebug ? new Ai(0) : new Human(0),
            new Ai(1),
            new Ai(2),
            new Ai(3)
        ];
        players.forEach(function(p, ind){
            p.name = game.storage.names[ind];
        });

        if(!window.isDebug){
            interface.arrow.innerHTML = "&larr;";
            interface.arrow.id = 'pass-arrow';
            interface.arrow.onmouseup = function(){
                interface.hideMessage();
                status = 'passing';
                currentPlay = 0;
                players[0].transfer(players[0].row.curShifted);
                this.classList.remove('show');
            };

            interface.button.id = 'play-button';
            interface.button.onmouseup = function(){
                proceed();
                this.classList.remove('show');
            };

            interface.message.id = 'game-message';

            interface.endMessage.id = 'end-message';

            frag.appendChild(game.interface.arrow);
            frag.appendChild(game.interface.button);
            frag.appendChild(game.interface.message);
            frag.appendChild(game.interface.endMessage);

            $('#game-region')[0].appendChild(frag);
        }
    };

    var end = game.end = function(){
        if(players[0].score === 26){
            game.storage.totalSTM += 1;
        }
        if(players.some(function(p){
            return p.score === 26;
        })){
            players.forEach(function(p){
                if(p.score !== 26){
                    p.score = 26;
                }else{
                    p.score = 0;
                }
            });
        }
        tester.recordScore(players.map(function(p){
            return p.score;
        }));
        players.forEach(function(p){
            p.oldScore += p.score;
        });
        game.storage.totalScore += players[0].score;
        game.storage.roundsPlayed += 1;
        status = 'end';
        var rank = players.map(function(c){
            return c;
        });
        rank.sort(function(a,b){
            return a.oldScore - b.oldScore;
        });
        rank.forEach(function(r,ind){
            r.board.rank = ind;
        });
        layout.adjust();
        setTimeout(function(){
            if(!window.isDebug){
                interface.playerBoards.forEach(function(p){
                    p.showFinal();
                });
            }
            if(!window.isDebug){
                if(players.some(function(p){
                    return p.oldScore > 100;
                })){
                    if(players[0].board.rank === 0){
                        if(!window.isDebug){
                            interface.endMessage.innerHTML = 'You Won!';
                            interface.endMessage.style.color = 'white';
                            interface.endMessage.classList.add('show');
                        }
                        game.storage.totalVictory += 1;
                    }else{
                        if(!window.isDebug){
                            interface.endmessage.innerhtml = 'you lost!';
                            interface.endmessage.style.color = 'grey';
                            interface.endMessage.classList.add('show');
                        }
                    }
                    status = 'allEnd';
                    game.storage.timesPlay += 1;
                    if(!window.isDebug){
                        interface.playerBoards.forEach(function(p){
                            p.display.style[vendorPrefix + 'Transform'] =
                            'translate3d(0, -' + ((layout.boardHeight + 10) * 2 + 40) + 'px, 0)';
                        });
                    }
                }
            }
            if(!window.isDebug){
                interface.button.innerHTML = 'Continue';
                interface.button.classList.add('show');
            }else{
                setTimeout(proceed, 0);
            }
        }, window.isDebug ? 0 : 600);
    };

    var newRound = function(){
        status = 'prepare';
        proceed();
    };
    
    var newGame = game.newGame = function(){
        players.forEach(function(p){
            p.oldScore = 0;
        });
        rounds = 0;
        status = 'prepare';
        proceed();
    };
    
    game.load = function(){
        // game.state.apply();
        // players.forEach(function(p){
        //     p.score = p.waste.cards.reduce(function(p, c){
        //         if(c.suit === 1){
        //             return p + 1;
        //         }else if(c.suit === 0 && c.num === 11){
        //             return p + 13;
        //         }else{
        //             return p;
        //         }
        //     }, 0);
        // });
        // layout.adjust();
        // proceed();
    };

    game.getStatus = function(){
        return status;
    };

    game.setStatus = function(val){
        status = val;
    };

    game.getRounds = function(){
        return rounds;
    };

    game.nextPlayer = function(id){
        currentPlay = (id + 1) % 4;
    };

    game.isHeartBroken = function(){
        return heartBroken;
    };

    game.transfer = function(player, cards){
        tester.log("transfer", player, cards);
        transferred++;
        player.out(cards);
        var adds = [1, 3, 2];
        players[(player.id + adds[rounds % 3]) % 4].takeIn(cards);
        player.next();
        return (player.id + adds[rounds % 3]) % 4;
    };

    game.showPassingMsg = function(){
        if(!window.isDebug){
            interface.showMessage("Pass three cards to the " + directions[rounds % 3]);
            [function(){
                interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(0)';
            },function(){
                interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(180deg)';
            },function(){
                interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(90deg)';
            }][rounds % 3]();
        }
    };

    game.informHeartBroken = function(){
        heartBroken = true;
    };

    window.onresize = function(){
        layout.adjust();
    };
})();if(window.isDebug){
	localStorage = {};
}

window.game.state = {
	apply: function(){
		var arrangement = game.storage.last;
		game.players.forEach(function(p,ind){
			arrangement[ind].row.forEach(function(c){
				p.row.addCard(game.board.cards[c[0]]);
			});
			arrangement[ind].waste.forEach(function(c){
				p.waste.addCard(game.board.cards[c[0]]);
			});
			p.oldScore = arrangement[ind].oldScore;
		});
		arrangement.desk.cards.forEach(function(c){
			game.board.cards[c[0]].pos = {
				rotation: c[1]
			};
			game.board.desk.addCard(game.board.cards[c[0]], true);
		});
		arrangement.desk.players.forEach(function(c,ind){
			game.board.desk.players[ind] = game.players[c];
		});
		['status','heartBroken','currentPlay','rounds'].forEach(function(c){
			game[c] = arrangement[c];
		});
	},
	save: function(){
		var arrangement = {};
		function cardsToId(c){
			return [c.id, c.pos.rotation];
		}
		game.players.forEach(function(p,ind){
			arrangement[ind] = {
				row: p.row.cards.map(cardsToId),
				waste: p.waste.cards.map(cardsToId),
				oldScore: p.oldScore
			};
		});
		arrangement['desk'] = {
			cards: game.board.desk.cards.map(cardsToId),
			players: game.board.desk.players.map(function(p){
				return p.id;
			})
		};
		['status','heartBroken','currentPlay','rounds'].forEach(function(c){
			arrangement[c] = game[c];
		});
		if(arrangement.status === 'passing'){
			arrangement.status = 'start';
		}
		game.storage.last = arrangement;
	}
};

window.game.storage = {};

var storeSetup = {
	names:  '["Jack", "Octavian", "Antony", "Lepidus"]',
	totalScore: 0,
	totalVictory: 0,
	roundsPlayed: 0,
	timesPlayed: 0,
	totalSTM: 0,
	last: 'false'
};

if(window.isDebug){
	window.game.storage = storeSetup;
}else{
	(function(obj, storages){
		function addStorage(obj, name, def){
			if(localStorage['yyjhao.hearts.' + name] === null){
				localStorage['yyjhao.hearts.' + name] = def;
			}
			(function(obj, name){
				var str = localStorage['yyjhao.hearts.' + name];
				obj['_' + name] = str ? JSON.parse(str) : str;
				Object.defineProperty(obj, name,{
					get: function(){
						return this['_'+name];
					},
					set: function(n){
						localStorage['yyjhao.hearts.' + name] = JSON.stringify(n);
						this['_'+name] = n;
					}
				})
			})(obj, name);
		}
		for(name in storages){
			addStorage(obj,name,storages[name]);
		}
	})(window.game.storage, storeSetup);
}var game = window.game,
    tester = window.tester;

game.init();
game.newGame();
