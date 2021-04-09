// minimax function
function minimax(d, alpha, beta, isMaximizingPlayer, sum, color)
{
    let children = game.ugly_moves({verbose: true});

    // need to implement a sort here to prioritise checking best moves first
    // this only becomes a benefit once transposition table has been added
    // for now just using random
    children.sort(function(a, b){return 0.5 - Math.random()});

    //Returning static evaluation of position
    if (d === 0 || children.length === 0)
    {
        return [null, sum];
    }

    let maxEval = Number.NEGATIVE_INFINITY;
    let minEval = Number.POSITIVE_INFINITY;
    let bestMove;
    let currMove;

    for (let i = 0; i < children.length; i++)
    {
        currMove = children[i];
        let currPrettyMove = game.ugly_move(currMove);
        let newSum = evaluateMove(currPrettyMove, sum, color);
        let [childBestMove, childEval] = minimax(d - 1, alpha, beta, !isMaximizingPlayer, newSum, color);

        game.undo();

        if (isMaximizingPlayer)
        {
            if (childEval > maxEval)
            {
                maxEval = childEval;
                bestMove = currPrettyMove;
            }
            if (childEval > alpha)
            {
                alpha = childEval;
            }
        }
        else 
        {
            if (childEval < minEval)
            {
                minEval = childEval;
                bestMove = currPrettyMove;
            }
            if (childEval < beta)
            {
                beta = childEval;
            }
        }

        if (alpha >= beta)
        {
            break;
        }
    }

    return isMaximizingPlayer ? [bestMove, maxEval] : [bestMove, minEval];
}