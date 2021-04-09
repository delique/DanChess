// VARIABLES

let PIECES= { EMPTY:0, wP:1, wN:2, wB:3, wR:4, wQ:5, wK:6,
              bP:7, bN:8, bB:9, bR:10, bQ:11, bK:12 };

let FILES = 
{   
    FILE_A:0, 
    FILE_B:1, 
    FILE_C:2, 
    FILE_D:3,
    FILE_E:4,
    FILE_F:5,
    FILE_G:6,
    FILE_H:7,
    FILE_NONE:8
};

let RANKS =
{
    RANK_1:0,
    RANK_2:1,
    RANK_3:2,
    RANK_4:3,
    RANK_5:4,
    RANK_6:5,
    RANK_7:6,
    RANK_8:7,
}

let SQUARES =
{
    A1:21, B1:22, C1:23, D1:24, E1:25, F1:26, G1:27, H1:28,
    A8:91, B8:92, C8:93, D8:94, E8:95, F8:96, G8:97, H8:98,
    NO_SQ:99, OFFBOARD:100
}

let BRD_SQ_NUM = 120;

let FilesBrd = new Array(BRD_SQ_NUM);
let RanksBrd = new Array(BRD_SQ_NUM);

let PieceKeys = new Array(14 * 120);
let SideKey;
let CastleKeys = new Array(16);

let Sq120ToSq64 = new Array(BRD_SQ_NUM);
let Sq64ToSq120 = new Array(64);

let MAXGAMEMOVES = 2048;

let COLOURS = { WHITE:0, BLACK:1, BOTH:2 };

let NOMOVE = 0;

let MvvLvaValue = [0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600];
let MvvLvaScores = new Array(14 * 14);

let START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

// FUNCTIONS

function FR2SQ(f, r)
{
    return ((21 + f) + (r * 10));
}

function RAND_32()
{
    return (Math.floor((Math.random() * 255) + 1) << 23) | (Math.floor((Math.random() * 255) + 1) << 16)
         | (Math.floor((Math.random() * 255) + 1) << 8) | Math.floor((Math.random() * 255) + 1);
}

function SQ120(sq64)
{
    return Sq64ToSq120[sq64];
}