# Hearts with HTML5

You can try the game at http://hearts.yjyao.com/

# AI

The `Ai.js` class can use various `Brains` to make decision.

* `Brain.js`: Base class for all brains
* `AsyncBrain.js`: A wrapper to call the more time-consuming brains via web-worker
* `SimpleBrain.js`: Simple greedy heuristics
* `McBrain.js`: One-step look-ahead with sample generation and deterministic rollouts based on the assumption that all players use the simple greedy strategy
* `PomDPBrain.js`: assuming all other players to be playing using the greedy strategy, the game can then be formulated as a [POMDP](http://en.wikipedia.org/wiki/Partially_observable_Markov_decision_process) and can thus be solved with the [POMCP Algorithm](http://machinelearning.wustl.edu/mlpapers/paper_files/NIPS2010_0740.pdf).

# TODO

1. Port `McBrain` and `PomDPBrain` to `C++`, which can be compiled to `asm.js` for better performance
