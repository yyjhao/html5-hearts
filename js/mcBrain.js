var cardsInfo = [];

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

var Simulator = function(){
    this.curCards = [[], [], [], []];
    this.curPlayers = [];
    this.curBoard = [];
    this.heartBroken = false;
    this.curP = 0;

    this.score = 0;

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

    this.score = 0;
    this._play(myID, cardToPlay);
    this._rollout();

    return this.score;
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

    if(this.curPlayers[maxCard] === this.curP){
        this.score += score;
    }

    this.nextFirst = this.curPlayers[maxCard];
    this.curBoard.length = 0;
    this.curPlayers.length = 0;
};

Simulator.prototype._othersDecide = function(cards){
    var vc = this._getValidCards(cards),
    // return vc[Math.floor(vc.length * Math.random())];
    // var vc = this.user.getValidCards(),
        len = vc.length,
        suit = -1, maxNum = -1,
        board = this.curBoard;

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
            numCards: 13
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13
        },
        {
            hasCard: [],
            lackCard: {},
            numCards: 13
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

function removeFromUnorderedArray(arr, item){
    if(!arr.length) return;
    var ind = arr.indexOf(item);
    if(ind === -1) return;
    arr[ind] = arr[arr.length - 1];
    arr.pop();
}

McBrain.prototype.removeRemainingCard = function(id){
    removeFromUnorderedArray(this.remainingCards, id);
    this.playersInfo.forEach(function(p){
        removeFromUnorderedArray(p.hasCard, id);
    });
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
        if(game.board.desk.cards.length){
            var curSuit = game.board.desk.cards[0].suit;
            if(curSuit !== info.card.suit){
                var lackCardPlayer = this.playersInfo[info.player.id],
                    cardLackCount = this.cardLackCount;
                this.remainingCards.forEach(function(c){
                    if(cardsInfo[c].suit === curSuit){
                        lackCardPlayer.lackCard[c] = true;
                        cardLackCount[c]++;
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

        var samples = 500,
            pids = game.board.desk.players.map(function(p){ return p.id; }),
            cids = game.board.desk.cards.map(function(p){ return p.id; });
        var scores = vc.map(function(c){
            return 0;
        });
        var i;
        this.preGenSample();
        while(samples--){
            this.genSample();
            for(i = 0; i < vc.length; i++){
                scores[i] += this.simulator.run(pids, cids, game.isHeartBroken(), this.samplePlayers, vc[i].id, this.user.id);
            }
            // alert(samples);
        }

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

    var tryT = 1000, ind;
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
        alert("fail to gen sample");
    }
    if(sample.some(function(s, ind){
        return s.length !== playersInfo[ind].numCards;
    })){
        console.log(this.remainingCards.length, sample, playersInfo, tryT);
        throw "eh";
    }
};