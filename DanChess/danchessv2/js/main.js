// Making new game from chess.js
let game = new Chess();

// Making the config for a new game
let config = {
    draggable: true,
    position: 'start',
    orientation: 'white',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onMouseoutSquare: onMouseoutSquare,
    onMouseoverSquare: onMouseoverSquare,
    onSnapEnd: onSnapEnd
};

// Making the board from chessboard.js
let board = Chessboard('myBoard', config);

// global constants
let stack_size = 100;
let undo_stack = [];
let d = 3;
let globalSum = 0;

// html stuffs
let $board = $('#myBoard');
let $status = $('#status');
let squareClass = 'square-55d63';
let squareToHighlight = null;
let colorToHighlight = null;
let whiteSquareGrey = '#a9a9a9';
let blackSquareGrey = '#696969';

checkStatus('white');



// function update the status message to indicate a win or draw etc
function checkStatus(color)
{
    if (game.in_checkmate())
    {
        $('#status').html(`<b>Checkmate!</b> Oops, <b>${color}</b> lost.`);
    }
    else if (game.insufficient_material())
    {
        $('#status').html(`It's a <b>draw!</b> (Insufficient Material)`);
    }
    else if (game.in_threefold_repetition())
    {
        $('#status').html(`It's a <b>draw!</b> (Threefold Repetition)`);
    }
    else if (game.in_stalemate())
    {
        $('#status').html(`It's a <b>draw!</b> (Stalemate)`);
    }
    else if (game.in_draw())
    {
        $('#status').html(`It's a <b>draw!</b> (50-move Rule)`);
    }
    else if (game.in_check())
    {
        $('#status').html(`Oops, <b>${color}</b> is in <b>check!</b>`);
        return false;
    }
    else
    {
        $('#status').html(`<b>${color}'s</b> turn to move`);
        return false;
    }
    return true;
}

// Updates the advantage indicating the current score of the game as well
function updateAdvantage()
{
    if (globalSum > 0)
    {
        $('#advantageColor').text('Black');
        $('#advantageNumber').text(globalSum);
    }
    else if (globalSum < 0)
    {
        $('#advantageColor').text('White');
        $('#advantageNumber').text(-globalSum);
    }
    else
    {
        $('#advantageColor').text('Neither side');
        $('#advantageNumber').text(globalSum);
    }
}

function checkOpenings()
{
    
}

// get best move
function getBestMove(color, currSum)
{
    let [bestMove, bestMoveValue] = minimax(d, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true, currSum, color);

    return [bestMove, bestMoveValue];
}

// function to make the best move
function makeBestMove(color)
{
    let move;

    if (color === 'b')
    {
        move = getBestMove(color, globalSum)[0];
    }
    else
    {
        move = getBestMove(color, -globalSum)[0];
    }
    

    globalSum = evaluateMove(move, globalSum, 'b');
    updateAdvantage();

    game.move(move);
    board.position(game.fen());

    if (color === 'b')
    {
        checkStatus('black');

        $board.find('.' + squareClass).removeClass('highlight-black');
        $board.find('.square-' + move.from).addClass('highlight-black');
        $board.find('.square-' + move.to).addClass('highlight-black');
    }
    else
    {   
        checkStatus('white');

        $board.find('.' + squareClass).removeClass('highlight-white');
        $board.find('.square-' + move.from).addClass('highlight-white');
        $board.find('.square-' + move.to).addClass('highlight-white');
    }
}

// function to allow a move to be undone
function undo()
{
    var move = game.undo();
    undo_stack.push(move);

    if (undo_stack.length > stack_size)
    {
        undo_stack.shift();
    }

    board.position(game.fen());
}
// activate undo function on the button click
$('#undoBtn').on('click', function() {
    if (game.history().length >= 2)
    {
        $board.find('.' + squareClass).removeClass('highlight-white');
        $board.find('.' + squareClass).removeClass('highlight-black');

        undo();
        window.setTimeout(function() {
            undo();
        }, 250);
    }
    else
    {
        alert("Nothing to undo.");
    }
});

// load the fen from the input box to the board
$('#loadFEN').on('click', function(){
    reset();
    let loadingfen = document.getElementById("game FEN").value;
    game.load(loadingfen);
    board.position(game.fen());
    window.setTimeout(function(){
        makeBestMove('b');
    }, 250);
});

// reset the game to the starting position
function reset()
{
    game.reset();
    globalSum = 0;
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.' + squareClass).removeClass('highlight-black');
    board.position(game.fen());
    $('#advantageColor').text('Neither side');
    $('#advantageNumber').text(globalSum);
}

$('#flipBoard').on('click', function(){
    let tempcol = 'b';
    
    if(board.orientation === 'white')
    {
        board.orientation = 'black';
        tempcol = 'w';
    }
    else if (board.orientation === 'black')
    {
        board.orientation = 'white';
        tempcol = 'b';
    }

    reset();
    
    window.setTimeout(function(){
        makeBestMove(tempcol);
    }, 250);
});

// removes the grey squares that indicate the available moves of a piece
function removeGreySquares()
{
    $('#myBoard .square-55d63').css('background', '');
}

// make the square indicated grey, used to indicate available moves of a piece
function greySquare(square)
{
    var $square = $('#myBoard .square-' + square);

    var background = whiteSquareGrey;

    if ($square.hasClass('black-3c85d'))
    {
        background = blackSquareGrey;
    }

    $square.css('background', background);
}

// function that is called when a piece is picked up
function onDragStart(source, piece, position, orientation)
{
    // Do not allow pieces to be picked up if game is over
    if (game.game_over())
    {
        return false;
    }

    // Only allow white pieces to be picked up
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

// function that is called when a piece is placed
function onDrop(source, target)
{
    removeGreySquares();

    // See if the move is legal
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' // always promote to queen
    });

    // illegal move
    if (move === null)
    {
        return 'snapback';
    }

    // update global sum with moves score
    globalSum = evaluateMove(move, globalSum, 'b');
    updateAdvantage();

    // highlight whites move
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.square-' + move.from).addClass('highlight-white');
    $board.find('.square-' + move.to).addClass('highlight-white');
    
    // kick of the engine to find the best move for black
    if(!checkStatus('black'))
    {
        window.setTimeout(function() {
            makeBestMove('b');
        }, 250);
    }

    checkStatus('white');
}

// function to handle the highlighting of possible moves
function onMouseoverSquare(square, piece)
{
    var moves = game.moves({
        square: square,
        verbose: true
    });

    if (moves.length === 0)
    {
        return;
    }

    greySquare(square);

    for (var i = 0; i < moves.length; i++)
    {
        greySquare(moves[i].to);
    }
}

// function to handle the removal of the grey squares when the mouse is no longer over a pieces square
function onMouseoutSquare(square, piece)
{
    removeGreySquares();
}

// function to handle returning a piece upon an attempted invalid move
function onSnapEnd()
{
    board.position(game.fen());
}