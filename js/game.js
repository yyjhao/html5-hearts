(function(){
    var game = window.game = {};

    var status = 'prepare',
        heartBroken = false,
        currentPlay = 0,
        players = [],
        rounds = -1,
        directions = ['left', 'right', 'opposite'];

    game.players = players;

    var interface = game.interface = {
        arrow: document.createElement('div'),
        button: document.createElement('button'),
        message: document.createElement('div'),
        showMessage: function(msg){
            this.message.innerHTML = msg;
            this.message.style.display = 'block';
        },
        hideMessage: function(){
            this.message.style.display = '';
        },
        playerBoards: [],
        endMessage: document.createElement('div')
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
                setTimeout(function(){
                    currentPlay = p.id;
                    p.waste.addCards(self.cards);
                    self.players = [];
                    self.cards = [];
                    if(players[0].row.cards.length === 0){
                        setTimeout(function(){
                            end();
                        },600);
                    }else{
                        setTimeout(function(){
                            proceed();
                        },600);
                    }
                }, 800);
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
                [].forEach.call($('.movable'), function(c){
                    c.classList.remove('movable');
                })
                interface.hideMessage();
                interface.button.classList.remove('show');
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
                        }, 300);
                        return;
                    }
                    players[curI % 4].row.addCard(board.cards[carddeck[curI]]);
                    players[curI % 4].row.adjustPos();
                    if(curI%4 === 0){
                        var pc = board.cards[carddeck[curI]];
                    }
                    curI++;
                    setTimeout(move, 70);
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
                for(i = 51; i >= 0; i--){
                    var c = board.cards[carddeck[i]].display.style;
                    c.zIndex = 200 - i * 3;
                    c[vendorPrefix + 'Transform'] = 'translate3d(-' + (52-i)/4+'px,-' + (52-i)/4 + 'px, -' + i +'px) rotateY(180deg)';
                }
                setTimeout(function(){move();}, 300);
            },
            'start': function(){
                players.forEach(function(p){
                    p.prepareTransfer();
                });
            },
            'passing': function(){
                if(currentPlay === 0){
                    status = 'confirming';
                    players[0].myTurn();
                    players.forEach(function(r){
                        r.row.sort();
                    });
                }else{
                    players[currentPlay].myTurn();
                }
            },
            'confirming': function(){
                interface.button.classList.add('show');
                players[0].row.curShifted = [];
                players[0].row.adjustPos();
                currentPlay = board.cards[26].parent.playedBy.id;
                setTimeout(function(){
                    status = 'playing';
                    proceed();
                }, 100);
            },
            'playing': function(){
                interface.button.classList.remove('show');
                if(board.desk.cards.length === 4){
                    players.forEach(function(p){
                        p.watch();
                    });
                    board.desk.score();
                }else if(players[0].row.curShifted.length === 1){
                    interface.hideMessage();
                    players[0].row.out(players[0].row.curShifted[0].ind, true);
                    players[0].next();
                }else{
                    players[currentPlay].myTurn();
                }
            },
            'allEnd': function(){
                interface.playerBoards.forEach(function(p){
                    p.display.style[vendorPrefix + 'Transform'] = "";
                });
                interface.endMessage.classList.remove('show');
                players.forEach(function(p){
                    p.score = p.oldScore = 0;
                });
                rounds = -1;
                interface.playerBoards.forEach(function(p){
                    p.hideFinal();
                    p.display.classList.remove('table');
                });
                newGame();
            },
            'end': function(){
                interface.playerBoards.forEach(function(p){
                    p.hideFinal();
                    p.display.classList.remove('table');
                });
                newRound();
            }
        })[status]();
    };

    game.init = function(){
        var frag = document.createDocumentFragment();
        var i;
        for(i=0;i<52;i++){
            var c = new Card(i);
            board.cards.push(c);
            frag.appendChild(c.display);
        }
        for(i=0;i<4;i++){
            var b = new PlayerBoard(i);
            interface.playerBoards.push(b);
            frag.appendChild(b.display);
        }
        interface.playerBoards[0].display.classList.add('human');
        game.players = players = [
            new Human(0),
            new Ai(1),
            new Ai(2),
            new Ai(3)
        ];
        players.forEach(function(p, ind){
            p.name = game.storage.names[ind];
        });

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
            interface.playerBoards.forEach(function(p){
                p.showFinal();
            });
            if(players.some(function(p){
                return p.oldScore > 100;
            })){
                if(players[0].board.rank === 0){
                    interface.endMessage.innerHTML = 'You Won!';
                    interface.endMessage.style.color = 'white';
                    interface.endMessage.classList.add('show');
                    game.storage.totalVictory += 1;
                }else{
                    interface.endMessage.innerHTML = 'You Lost!';
                    interface.endMessage.style.color = 'grey';
                    interface.endMessage.classList.add('show');
                }
                status = 'allEnd';
                game.storage.timesPlay += 1;
                interface.playerBoards.forEach(function(p){
                    p.display.style[vendorPrefix + 'Transform'] =
                    'translate3d(0, -' + ((layout.boardHeight + 10) * 2 + 40) + 'px, 0)';
                });
            }
            interface.button.innerHTML = 'Continue';
            interface.button.classList.add('show');
        }, 600);
    };

    var newRound = function(){
        status = 'prepare';
        proceed();
    };
    
    game.newGame = function(){
        players.forEach(function(p){
            p.oldScore = 0;
        });
        rounds = 0;
        status = 'prepare';
        proceed();
    };
    
    game.load = function(){
        game.state.apply();
        players.forEach(function(p){
            p.score = p.waste.cards.reduce(function(p, c){
                if(c.suit === 1){
                    return p + 1;
                }else if(c.suit === 0 && c.num === 11){
                    return p + 13;
                }else{
                    return p;
                }
            }, 0);
        });
        layout.adjust();
        proceed();
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
        player.out(cards);
        var adds = [1, 3, 2];
        players[(player.id + adds[rounds % 3]) % 4].takeIn(cards);
        player.next();
        return (player.id + adds[rounds % 3]) % 4;
    };

    game.showPassingMsg = function(){
        interface.showMessage("Pass three cards to the " + directions[rounds % 3]);
        [function(){
            interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(0)';
        },function(){
            interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(180deg)';
        },function(){
            interface.arrow.style[vendorPrefix + 'Transform'] = 'rotate(90deg)';
        }][rounds % 3]();
    };

    game.informHeartBroken = function(){
        heartBroken = true;
    };

    window.onresize = function(){
        layout.adjust();
    };
})();