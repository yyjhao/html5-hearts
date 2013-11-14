define(["ui", "Human", "Ai", "board", "config", "jquery", "rules", "RandomBrain", "AsyncBrain", "SimpleBrain", "PomDPBrain"],
function(ui,   Human,   Ai,   board,   config,   $,        rules,   RandomBrain,   AsyncBrain,   SimpleBrain,   PomDPBrain){
    "use strict";

    var rounds = 0;
    var players = [
        new Human(0, config.names[0]),
        new Ai(1, config.names[1]),
        new Ai(2, config.names[2]),
        new Ai(3, config.names[3])
    ];

    var status = "prepare",
        currentPlay = 0,
        played = 0;

    var heartBroken = false;

    var nextTimer = 0;

    var waitDefer = function(time){
        var d = $.Deferred();
        setTimeout(function(){
            d.resolve();
        }, time);
        return d;
    };

    var initBrains = function(){
        // players[0].brain = new AsyncBrain(players[0], "PomDPBrain");

        if(players[1].brain){
            players[1].brain.terminate();
            players[2].brain.terminate();
            players[3].brain.terminate();
        }

        for(var i = 1; i < 4; i++){
            if(config.levels[i] == 1){
                players[i].brain = new SimpleBrain(players[i]);
            } else if(config.levels[i] == 2){
                players[i].brain = new AsyncBrain(players[i], "McBrain");
            } else if(config.levels[i] == 3){
                players[i].brain = new AsyncBrain(players[i], "PomDPBrain");
            } else if(config.levels[i] == 4){
                players[i].brain = new AsyncBrain(players[i], "PomDPBrain", {time: 2000});
            }
        }

        return $.when(players[1].brain.init(),
                      players[2].brain.init(),
                      players[3].brain.init());
    };

    var informCardOut = function(player, card){
        if(card.suit === 1){
            heartBroken = true;
        }
        players.forEach(function(p){
            p.watch({
                type: "out",
                player: player,
                card: card,
                curSuit: board.desk.cards[0].suit
            });
        });
    };

    var adds = [1, 3, 2];
    var getPlayerForTransfer = function(id){
        return (id + adds[rounds % 3]) % 4;
    };

    return {
        adjustLayout: function(){
            players.forEach(function(r){
                r.adjustPos();
            });
            board.desk.adjustPos();
        },
        newGame: function(){
            clearTimeout(nextTimer);
            ui.hideWin();
            players.forEach(function(p, i){
                p.clearScore();
                p.setActive(false);
                p.setName(config.names[i])
            });
            rounds = 0;
            ui.clearEvents();
            status = 'prepare';
            this.proceed();
        },
        next: function(){
            console.log(status, "next");
            if (status == 'confirming'){
                currentPlay = board.cards[26].parent.playedBy.id;
                played = 0;
            } else if (status == 'playing'){
                currentPlay = (currentPlay + 1) % 4;
                played++;
            }
            if(played == 4){
                status = 'endRound';
                played = 0;
            } else if (status == 'endRound' && players[0].row.cards.length === 0){
                status = 'end';
            } else {
                status = ({
                    'prepare': 'distribute',
                    'distribute': 'start',
                    'start': 'passing',
                    'passing': 'confirming',
                    'confirming': 'playing',
                    'playing': 'playing',
                    'endRound': 'playing',
                    'end': 'prepare'
                })[status];
            }
            var waitTime = {
                'playing': 100,
                'endRound': 900,
                'distribute': 300,
                'end': 900
            };
            var wait = waitTime[status] || 0;
            nextTimer = setTimeout(this.proceed.bind(this), wait);
        },
        proceed: function(){
            ({
                'prepare': function(){
                    ui.hideMessage();
                    ui.hideButton();
                    players.forEach(function(p){
                        p.initForNewRound();
                    });
                    board.init();
                    heartBroken = false;
                    board.shuffleDeck();
                    initBrains().done(this.next.bind(this));
                },
                'distribute': function(){
                    var self = this;
                    board.distribute(players).done(function(){
                        players.forEach(function(p){
                            p.row.sort();
                        });
                        self.next();
                    });
                },
                'start': function(){
                    rounds++;
                    $.when.apply($, players.map(function(p){
                        return p.prepareTransfer(rounds % 3);
                    })).done(this.next.bind(this));
                },
                'passing': function(){
                    for(var i = 0; i < 4; i++){
                        players[i].transferTo(players[getPlayerForTransfer(i)]);
                    }
                    this.next();
                },
                'confirming': function(){
                    players.forEach(function(r){
                        r.row.sort();
                    });
                    $.when.apply($, players.map(function(p){
                        return p.confirmTransfer();
                    })).done(this.next.bind(this));
                },
                'playing': function(){
                    players[currentPlay].setActive(true);
                    $.when(players[currentPlay].decide(
                        rules.getValidCards(players[currentPlay].row.cards,
                                            board.desk.cards[0] ? board.desk.cards[0].suit : -1,
                                            heartBroken),
                        board.desk.cards,
                        board.desk.players,
                        players.map(function(p){
                            return p.getScore();
                        })), waitDefer(200))
                    .done(function(card){
                        players[currentPlay].setActive(false);
                        card.parent.out(card);
                        board.desk.addCard(card, players[currentPlay]);
                        card.adjustPos();
                        informCardOut(players[currentPlay], card);
                        this.next();
                    }.bind(this));
                },
                'endRound': function(){
                    var info = board.desk.score();
                    currentPlay = info[0].id;
                    info[0].waste.addCards(info[1]);
                    this.next();
                },
                'end': function(){
                    if(players.some(function(p){
                        return p.getScore() === 26;
                    })){
                        players.forEach(function(p){
                            if(p.getScore() !== 26){
                                p.setScore(26);
                            }else{
                                p.setScore(0);
                            }
                        });
                    }
                    players.forEach(function(p){
                        p.finalizeScore();
                    });
                    var rank = players.map(function(c){
                        return c;
                    });
                    rank.sort(function(a,b){
                        return a._oldScore - b._oldScore;
                    });
                    rank.forEach(function(r,ind){
                        r.display.rank = ind;
                    });
                    players.forEach(function(p){
                        p.adjustPos();
                    });
                    if(players.some(function(p){
                        return p._oldScore >= 100;
                    })){
                        players.forEach(function(p){
                            p.display.moveUp = true;
                            p.display.adjustPos();
                        });
                        ui.showWin(players[0] === rank[0]);
                        ui.showButton("Restart");
                        ui.buttonClickOnce(this.newGame.bind(this));
                    } else {
                        ui.showButton("Continue");
                        ui.buttonClickOnce(this.next.bind(this));
                    }
                }
            })[status].bind(this)();
        }
    };
});