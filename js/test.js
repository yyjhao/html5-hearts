(function(){
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
})();