define( ["prematureOptimization"],
function(op){
    "use strict";

    var cardsInfo = op.cardsInfo,
        infoToCardId = op.infoToCardId,
        removeFromUnorderedArray = op.removeFromUnorderedArray;

    var Simulator = function(){
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

    return Simulator;
});