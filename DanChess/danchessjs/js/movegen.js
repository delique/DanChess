function InitMvvLva()
{
    let Attacker;
    let Victim;

    for (Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker)
    {
        for (Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim)
        {
            MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
        }
    }
}