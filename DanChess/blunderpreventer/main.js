const readline = require('readline');
const { Chess } = require('chess.js');
const { spawn } = require('child_process');

// Path to the Stockfish executable
const stockfishPath = './stockfish/stockfish-windows-x86-64-avx2.exe'; // Ensure this path is correct
const stockfish = spawn(stockfishPath); // Spawn the Stockfish process

const chess = new Chess(); // Initialize the chess game

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("Welcome to the Chess Move Tracker!");
console.log("Enter moves in standard algebraic notation (e.g., e4, Nf3).");
console.log("Type 'exit' to quit the program.\n");

stockfish.stdout.setMaxListeners(200); // Set the limit to 20 for this specific EventEmitter

stockfish.stdin.write('uci\n'); // Send the UCI command to initialize Stockfish

// Set the number of threads for Stockfish
const numThreads = 8; // Adjust this to the number of CPU cores you want to use
stockfish.stdin.write(`setoption name Threads value ${numThreads}\n`);

stockfish.stdin.write('setoption name Hash value 512\n'); // Set hash size to 512 MB

stockfish.stdin.write('isready\n');

// get the user to input the fen string
const getFen = () => {
    return new Promise((resolve) => {
        rl.question('Enter the FEN string: ', (fen) => {
            resolve(fen);
        });
    });
};

const evaluateMoves = async (fen, moves) => {
    const evaluations = [];

    for (const move of moves) {
        const chessInstance = new Chess(fen); // Create a new Chess instance with the FEN
        chessInstance.move(move.san); // Make the move on the board

        const newFen = chessInstance.fen(); // Get the FEN after the move

        // Send the position to Stockfish
        stockfish.stdin.write(`position fen ${newFen}\n`);
        stockfish.stdin.write('go depth 18\n'); // Adjust depth as needed

        // Wait for Stockfish to return the evaluation
        const output = await new Promise((resolve) => {
            let dataBuffer = '';
            const onData = (data) => {
                dataBuffer += data.toString();
                if (dataBuffer.includes('bestmove')) {
                    stockfish.stdout.off('data', onData); // Stop listening once 'bestmove' is received
                    resolve(dataBuffer);
                }
            };
            stockfish.stdout.on('data', onData);
        });

        // Extract the evaluation from Stockfish's output
        const mateMatch = output.match(/score mate (-?\d+)/); // Check for mate score
        const cpMatch = output.match(/score cp (-?\d+)/); // Check for centipawn score

        let score;
        let mate = null;
        if (mateMatch) {
            // Handle mate score
            const mateIn = parseInt(mateMatch[1], 10);
            mate = mateIn > 0 ? `M${mateIn}` : `M${-mateIn}`;
            score = mateIn > 0 ? 10000 - mateIn : -10000 - mateIn; // Use large positive/negative values for mate
        } else if (cpMatch) {
            // Handle centipawn score
            score = parseInt(cpMatch[1], 10);

            // Adjust the score based on the side to move
            if (chessInstance.turn() === 'b') {
                score = -score; // Reverse the score if it's Black's turn
            }
        } else {
            // Default to 0 if no score is found
            score = 0;
        }

        evaluations.push({ move: move.san, score, mate, fen: newFen });
    }

    return evaluations;
};

// Classify moves based on evaluation scores
const classifyMoves = (evaluations, isBlackTurn) => {
    // Determine the best score based on the side to move
    const bestScore = isBlackTurn
        ? Math.min(...evaluations.map((e) => e.score))
        : Math.max(...evaluations.map((e) => e.score));

    return evaluations.map(({ move, score, mate }) => {
        const diff = isBlackTurn ? score - bestScore : bestScore - score; // Adjust diff for Black
        let classification = 'Best';

        if (mate) {
            classification = 'Mate'; // Special classification for mate moves
        } else if (diff > 50 && diff <= 100) classification = 'Excellent';
        else if (diff > 100 && diff <= 300) classification = 'Good';
        else if (diff > 300 && diff <= 500) classification = 'Inaccuracy';
        else if (diff > 500 && diff <= 800) classification = 'Mistake';
        else if (diff > 800) classification = 'Blunder';

        return { move, score, mate, classification };
    });
};

// Main logic
getFen().then(async (fen) => {
    chess.load(fen); // Load the FEN string into the chess game
    console.log(`FEN string loaded: ${fen}\n`);
    console.log(`Current position:\n${chess.ascii()}\n`);

    // Get a list of possible moves for the current position
    const moves = chess.moves({ verbose: true });
    const moves_san = moves.map((move) => move.san); // Convert moves to SAN format
    console.log(`Possible moves: ${moves_san.join(', ')}`);

    // Evaluate and classify moves
    const evaluations = await evaluateMoves(fen, moves);
    const isBlackTurn = chess.turn() === 'b'; // Determine if it's Black's turn
    let classifiedMoves = classifyMoves(evaluations, isBlackTurn);

    // Sort the moves from worst to best based on score
    classifiedMoves = classifiedMoves.sort((a, b) => a.score - b.score);

    console.log('\nMove evaluations (sorted from worst to best):');
    classifiedMoves.forEach(({ move, score, mate, classification }) => {
        const scoreDisplay = mate || score; // Display mate (e.g., M1) if available, otherwise score
        console.log(`${move}: ${classification} (Score: ${scoreDisplay})`);
    });

    rl.close();
});

