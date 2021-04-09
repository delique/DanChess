#include "chess.h"
#include "data.h"

void Analyze() {
  int i, v, move, back_number, readstat = 1;
  TREE *const tree = block[0];

  int save_swindle_mode = swindle_mode;

  swindle_mode = 0;
  ponder_move = 0;
  analyze_mode = 1;
  if (!xboard)
    display_options |= 1 + 2 + 4;
  printf("Analyze Mode: type \"exit\" to terminate.\n");

  while (FOREVER) {
    do {
      last_pv.pathd = 0;
      last_pv.pathl = 0;
      input_status = 0;
      pondering = 1;
      tree->status[1] = tree->status[0];
      Iterate(game_wtm, think, 0);
      pondering = 0;
      if (book_move)
        moves_out_of_book = 0;
      if (!xboard) {
        if (game_wtm)
          printf("analyze.White(%d): ", move_number);
        else
          printf("analyze.Black(%d): ", move_number);
        fflush(stdout);
      }

      if (!input_status)
        do {
          readstat = Read(1, buffer);
          if (readstat < 0)
            break;
          nargs = ReadParse(buffer, args, " \t;");
          Print(32, "%s\n", buffer);
          if (strstr(args[0], "timeleft") && !xboard) {
            if (game_wtm)
              printf("analyze.White(%d): ", move_number);
            else
              printf("analyze.Black(%d): ", move_number);
            fflush(stdout);
          }
        } while (strstr(args[0], "timeleft"));
      else
        nargs = ReadParse(buffer, args, " \t;");
      if (readstat < 0)
        break;
      move = 0;
      if (!strcmp(args[0], "exit"))
        break;

      if (OptionMatch("back", args[0])) {
        if (nargs > 1)
          back_number = atoi(args[1]);
        else
          back_number = 1;
        for (i = 0; i < back_number; i++) {
          game_wtm = Flip(game_wtm);
          if (Flip(game_wtm))
            move_number--;
        }
        if (move_number == 0) {
          move_number = 1;
          game_wtm = 1;
        }
        sprintf(buffer, "reset %d", move_number);
        Option(tree);
        display = tree->position;
      } else if (Option(tree)) {
        display = tree->position;
      }

      else if ((move = InputMove(tree, 0, game_wtm, 1, 0, buffer))) {
        char *outmove = OutputMove(tree, 0, game_wtm, move);

        if (history_file) {
          fseek(history_file, ((move_number - 1) * 2 + 1 - game_wtm) * 10,
              SEEK_SET);
          fprintf(history_file, "%9s\n", outmove);
        }
        if (game_wtm)
          Print(32, "White(%d): ", move_number);
        else
          Print(32, "Black(%d): ", move_number);
        Print(32, "%s\n", outmove);
        if (speech) {
          char announce[64];

          strcpy(announce, "./speak ");
          strcat(announce, outmove);
          strcat(announce, " &");
          v = system(announce);
          if (v != 0)
            perror("Analyze() system() error: ");
        }
        MakeMoveRoot(tree, game_wtm, move);
        display = tree->position;
        last_mate_score = 0;
        if (log_file)
          DisplayChessBoard(log_file, tree->position);
      }

      else {
        pondering = 0;
        if (Option(tree) == 0)
          printf("illegal move: %s\n", buffer);
        pondering = 1;
        display = tree->position;
      }
    } while (!move);
    if (readstat < 0 || !strcmp(args[0], "exit"))
      break;
    game_wtm = Flip(game_wtm);
    if (game_wtm)
      move_number++;
  }
  analyze_mode = 0;
  printf("analyze complete.\n");
  pondering = 0;
  swindle_mode = save_swindle_mode;
}
