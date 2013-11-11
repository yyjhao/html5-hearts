define(["ui", "Human", "Ai", "board", "config", "jquery", "rules"],
function(ui,   Human,   Ai,   board,   config,   $,        rules){
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

    var informCardOut = function(player, card){
        if(card.suit === 1){
            heartBroken = true;
        }
        players.forEach(function(p){
            p.watch({
                type: "out",
                player: player,
                card: card
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
                p.oldScore = 0;
            });
            rounds = 0;
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
                'playing': 300,
                'endRound': 900
            };
            var wait = waitTime[status] || 0;
            setTimeout(this.proceed.bind(this), wait);
        },
        proceed: function(){
            ({
                'prepare': function(){
                    ui.hideMessage();
                    ui.hideButton();
                    rounds = 0;
                    players.forEach(function(p){
                        p.initForNewRound();
                    });
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
                    ui.showPassingScreen(rounds % 3);
                    $.when.apply($, players.map(function(p){
                        return p.prepareTransfer();
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
                    var self = this;
                    ui.showConfirmScreen().done(function(){
                        players[0].doneTransfer();
                        self.next();
                    });
                },
                'playing': function(){
                    players[currentPlay].decide(
                        rules.getValidCards(players[currentPlay].row.cards,
                                            board.desk.cards[0] ? board.cards[0].suit : -1,
                                            heartBroken))
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
                        p.score = p.oldScore = 0;
                    });
                    rounds = -1;
                    ui.showWinner();
                },
                'end': function(){
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
                    ui.addScore();
                    ui.showRank().done(this.next.bind(this));
                }
            })[status].bind(this)();
        }
    };
});