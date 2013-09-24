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
    var endTime = Date.now() + 1000 * 1;
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