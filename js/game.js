define(["ui", "Human", "Ai", "board", "config", "jquery", "rules", "RandomBrain", "McBrain", "SimpleBrain", "PomDPBrain"],
function(ui,   Human,   Ai,   board,   config,   $,        rules,   RandomBrain,   McBrain,   SimpleBrain,   PomDPBrain){
    "use strict";

    var rounds = 0;
    var players = [
        new Ai(0, config.names[0]),
        new Ai(1, config.names[1]),
        new Ai(2, config.names[2]),
        new Ai(3, config.names[3])
    ];

    var status = "prepare",
        currentPlay = 0,
        played = 0;

    var heartBroken = false;

    var initBrains = function(){
        players[0].brain = new McBrain(players[0]);
        players[1].brain = new McBrain(players[1]);
        players[2].brain = new McBrain(players[2]);
        players[3].brain = new McBrain(players[3]);
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
            players.forEach(function(p){
                p.clearScore();
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
                    'prepare': 'start',
                    'start': 'passing',
                    'passing': 'confirming',
                    'confirming': 'playing',
                    'playing': 'playing',
                    'endRound': 'playing',
                    'end': 'prepare'
                })[status];
            }
            var waitTime = {
                'playing': 10,
                'endRound': 10
            };
            var wait = waitTime[status] || 0;
            setTimeout(this.proceed.bind(this), wait);
        },
        proceed: function(){
            ({
                'prepare': function(){
                    ui.hideMessage();
                    ui.hideButton();
                    players.forEach(function(p){
                        p.initForNewRound();
                    });
                    initBrains();
                    board.init();
                    heartBroken = false;
                    board.shuffleDeck();
                    var self = this;
                    setTimeout(function(){
                        board.distribute(players).done(function(){
                            players.forEach(function(p){
                                p.row.sort();
                            });
                            self.next();
                        });
                    }, 300);
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
                    players[currentPlay].decide(
                        rules.getValidCards(players[currentPlay].row.cards,
                                            board.desk.cards[0] ? board.desk.cards[0].suit : -1,
                                            heartBroken),
                        board.desk.cards,
                        board.desk.players,
                        players.map(function(p){
                            return p.getScore();
                        }))
                    .done(function(card){
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
                'allEnd': function(){
                    ui.showScore();
                    players.forEach(function(p){
                        p.clearScore();
                    });
                    ui.showWinner();
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
                    ui.showButton("Continue");
                    ui.buttonClickOnce(this.next.bind(this));
                }
            })[status].bind(this)();
        }
    };
});