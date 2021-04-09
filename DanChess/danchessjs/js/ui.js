function NewGame(fenStr) 
{
    ParseFen(fenStr);
    PrintBoard();
    SetInitialBoardPieces();
    CheckAndSet();
}