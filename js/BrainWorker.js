importScripts("lib/require.js");

require(["McBrain", "PomDPBrain"],
function(McBrain,    PomDPBrain){
    var brains = {
        McBrain: McBrain,
        PomDPBrain: PomDPBrain
    };

    postMessage({
        type: "loaded"
    });

    self.addEventListener('message', function(e){
        switch(e.data.type){
            case 'decide':
                var params = e.data.params;
                postMessage({
                    type: "decision",
                    result: brain.decide(params.validCards, params.boardCards, params.boardPlayers, params.scores)
                });
                break;
            case 'watch':
                brain.watch(e.data.params);
                break;
            case 'ini':
                brain = new brains[e.data.brain](e.data.userId, e.data.options);
                postMessage({
                    type: "ini-ed"
                });
                break;
            case 'confirm':
                brain.confirmCards(e.data.cards);
                postMessage({
                    type: "confirmed"
                });
                break;
        }
    });
});