let GameBoard = {};

GameBoard.pieces = newArray(BRD_SQ_NUM);
GameBoard.side = COLOURS.WHITE;
GameBoard.fiftyMove = 0;
GameBoard.hisPly = 0;
GameBoard.history = [];
GameBoard.ply = 0;
GameBoard.enPas = 0;
GameBoard.castlePerm = 0;
GameBoard.material = new Array(2);
GameBoard.pceNum = new Array(13);
GameBoard.pList = new Array(14 * 10);
GameBoard.posKey = 0;
GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);
GameBoard.PvTable = [];
GameBoard.PvArray = new Array(MAXDEPTH);
GameBoard.searchHistory = new Array( 14 * BRD_SQ_NUM);
GameBoard.searchKillers = new Array(3 * MAXDEPTH);

function ResetBoard()
{
    let i;

    for (i = 0; i < BRD_SQ_NUM; ++i)
    {
        GameBoard.pieces[index] = SQUARES.OFFBOARD;
    }

    for (i = 0; i < 64; ++i)
    {
        GameBoard.pieces[SQ120(index)] = PIECES.EMPTY;
    }

    GameBoard.side = COLOURS.BOTH;
    GameBoard.enPas = SQUARES.NO_SQ;
    GameBoard.fiftyMove = 0;
    GameBoard.ply = 0;
    GameBoard.hisPly = 0;
    GameBoard.castlePerm = 0;
    GameBoard.posKey = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

function ParseFen(fen)
{
    ResetBoard();

    let rank = RANKS.RANK_8;
    let file = FILES.FILE_A;
    let piece = 0;
    let count = 0;
    let i = 0;
    let sq120 = 0;
    let fenCnt = 0;

    
}