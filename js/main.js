require.config({
    baseUrl: 'js',
    paths: {
        jquery: 'lib/jquery-2.0.3.min'
    }
});

require(["game", "jquery", "domBinding", "layout"],
function(game,    $,        domBinding,   layout){
    "use strict";

    domBinding.fragmentToDom($('#game-region')[0]);

    layout.region = $('#game-region')[0];

    layout.adjust();

    $(window).resize(function(){
        layout.adjust();
        game.adjustLayout();
    });

    $('#newgame-but').on("click", function(){
        if(confirm("This will end the current game. Are you sure?")){
            game.newGame();
        }
    });
    $('#control-region>button').on("click", function(){
        $('#control-region')[0].hidden = true;
    });
    $('#settings-but').on("click", function(){
        var nums = ['one', 'two', 'three', 'four'];
        $('#settings-dialog')[0].hidden = false;
        config.names.forEach(function(n,ind){
            $('.player-set-name.' + nums[ind])[0].innerHTML = n;
        });
        $('#control-region')[0].hidden = false;
    });
    game.newGame();
});