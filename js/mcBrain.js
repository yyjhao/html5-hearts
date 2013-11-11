define([ "Simulator", "Brain", "prematureOptimization"],
function( Simulator ,  Brain,   op){
    "use strict";

    var cardsInfo = op.cardsInfo;
    var removeFromUnorderedArray = op.removeFromUnorderedArray;

    var McBrain = function(user){
        Brain.call(this, user);

        this.samplePlayers = [[], [], [], []];
        this.tmpSample = [[], [], [], []];

        this.heartBroken = false;

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
        }else{
            this.playersInfo[info.player.id].numCards--;
            this.removeRemainingCard(info.card.id);
            if(info.card.suit === 1) this.heartBroken = true;
            var markLackCard = this.markLackCard.bind(this),
                lackCardPlayer = this.playersInfo[info.player.id];
            if(info.curSuit !== info.card.suit){
                this.remainingCards.forEach(function(c){
                    if(cardsInfo[c].suit === info.curSuit){
                        markLackCard(c, lackCardPlayer);
                    }
                });
            }
        }
    };

    McBrain.prototype.decide = function(vc, boardCards, boardPlayers, pscores){
        if(!this.knowSelf){
            this.user.row.cards.forEach(function(c){
                this.removeRemainingCard(c.id);
                this.samplePlayers[this.user.id].push(c.id);
            }.bind(this));
            this.knowSelf = true;
        }
        var r;

        if(vc.length === 1){
            r = vc[0];
        }else{

            var samples = 0,
                pids = boardPlayers.map(function(p){ return p.id; }),
                cids = boardCards.map(function(p){ return p.id; }),
                endTime = Date.now() + 1000 * 1;
            var scores = vc.map(function(c){
                return 0;
            });
            var i;
            this.preGenSample();
            while(Date.now() < endTime){
                samples++;
                this.genSample();
                for(i = 0; i < vc.length; i++){
                    scores[i] += this.simulator.run(
                        pids,
                        cids,
                        this.heartBroken,
                        this.samplePlayers,
                        vc[i].id,
                        this.user.id,
                        [].concat(pscores));
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

        return $.Deferred().resolve(r.ind);
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
    };

    return McBrain;
});