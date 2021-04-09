$(function () {
    init();
    NewGame(START_FEN);
});

function init()
{
    InitFilesRanksBrd();
    InitHashKeys();
    InitSq120To64();
	InitBoardVars();
	InitMvvLva();
	InitBoardSquares();
}

function InitFilesRanksBrd()
{
    let i;
    let file = FILES.FILE_A;
    let rank = RANKS.RANK_1;
    let sq = SQUARES.A1;

    for (i = 0; i < BRD_SQ_NUM; ++i)
    {
        FilesBrd[i] = SQUARES.OFFBOARD;
        RanksBrd[i] = SQUARES.OFFBOARD;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank)
    {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file)
        {
            sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function InitHashKeys()
{
    let i;

    for (i = 0; i < 14 * 120; ++i)
    {
        PieceKeys[i] = RAND_32();
    }

    SideKey = RAND_32();

    for (i = 0; i < 16; ++i)
    {
        CastleKeys[i] = RAND_32();
    }
}

function InitSq120To64() {
    let i = 0;
    let file = FILES.FILE_A;
    let rank = RANKS.RANK_1;
    let sq = SQUARES.A1;
    let sq64 = 0;

    for (i = 0; i < BRD_SQ_NUM; ++i) {
        Sq120ToSq64[index] = 65;
    }

    for (i = 0; i < 64; ++i)
    {
        Sq64ToSq120[index] = 120;
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_8; ++rank)
    {
        for (file = FILES.FILE_A; file <= FILES.FILE_H; ++file)
        {
            sq = FR2SQ(file, rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

function InitBoardVars()
{
    let i;

    for (i = 0; i < MAXGAMEMOVES; ++i)
    {
        GameBoard.history.push({
            move: NOMOVE,
            castlePerm: 0,
            enPas: 0,
            fiftyMove: 0,
            posKey : 0
        });
    }

    for (i = 0; i < PVENTRIES; ++i)
    {
        GameBoard.PvTable.push({
            move: NOMOVE,
            posKey: 0
        });
    }
}

function InitBoardSquares() 
{
    let light = 1;
    let rankName;
    let fileName;
    let divString;
    let rankIter;
    let fileIter;
    let lightString;

    for (rankIter = RANKS.RANK_8; rankIter >= RANKS.RANK_1; rankIter--)
    {
        light ^= 1;
        rankName = "rank" + (rankIter +  1);
        for (fileIter = FILES.FILE_A; fileIter <= FILES.FILE_H; fileIter++)
        {
            fileName = "file" + (fileIter + 1);
            if (light == 0) lightString="Light";
            else lightString="Dark";
            light^=1;
            divString = "<div class=\"Square " + rankName + " " + fileName + " " + lightString + "\"/>";
            $("#myBoard").append(divString);
        }
    }
}