define(["prematureOptimization"],
function(op){
    "use strict";

    var removeFromUnorderedArray = op.removeFromUnorderedArray;
    var cardsInfo = op.cardsInfo;

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

    return PomDPSimulator;
});