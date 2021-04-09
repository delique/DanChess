from keras.models import Sequential, load_model, model_from_json
import random
import chess
import os
from pandas import read_csv
import numpy as np
from IPython.display import clear_output
from matplotlib import pyplot as plt

os.chdir('C:\\Users\danie\OneDrive\Desktop\ChessAi')
csv = read_csv('chessData.csv')

chess_dict = {
    'p' : [1,0,0,0,0,0,0,0,0,0,0,0],
    'P' : [0,0,0,0,0,0,1,0,0,0,0,0],
    'n' : [0,1,0,0,0,0,0,0,0,0,0,0],
    'N' : [0,0,0,0,0,0,0,1,0,0,0,0],
    'b' : [0,0,1,0,0,0,0,0,0,0,0,0],
    'B' : [0,0,0,0,0,0,0,0,1,0,0,0],
    'r' : [0,0,0,1,0,0,0,0,0,0,0,0],
    'R' : [0,0,0,0,0,0,0,0,0,1,0,0],
    'q' : [0,0,0,0,1,0,0,0,0,0,0,0],
    'Q' : [0,0,0,0,0,0,0,0,0,0,1,0],
    'k' : [0,0,0,0,0,1,0,0,0,0,0,0],
    'K' : [0,0,0,0,0,0,0,0,0,0,0,1],
    '.' : [0,0,0,0,0,0,0,0,0,0,0,0],
}

def make_matrix(board):
    pgn = board.epd()
    foo = []
    pieces = pgn.split(" ", 1)[0]
    rows = pieces.split("/")
    for row in rows:
        foo2 = []
        for thing in row:
            if thing.isdigit():
                for i in range(0, int(thing)):
                    foo2.append('.')
            else:
                foo2.append(thing)
        foo.append(foo2)
    return foo

def translate(matrix, chess_dict):
    rows = []
    for row in matrix:
        terms = []
        for term in row:
            terms.append(chess_dict[term])
        rows.append(terms)
    return rows

fen = csv['FEN'].values
values = csv['Evaluation'].values
length = 10000

X = []
y = values[:length]
defects = []

for i in range(length):
    board = chess.Board(fen[i])
    matrix = make_matrix(board.copy())
    translated = translate(matrix, chess_dict)
    X.append(translated)

for i in range(length):
    if '#' in y[i]:
        y[i] = float(y[i][-1]) * 1000
y = y.astype('float32')

minimum = min(y)
maximum = max(y)

for i in range(len(y)):
    y[i] = (y[i]-minimum) / (maximum-minimum)

def load_keras_model(dataset, loss, optimizer):
    json_file = open(dataset+'_best_model'+'.json', 'r')
    loaded_model_json = json_file.read()
    json_file.close()
    model = model_from_json(loaded_model_json)
    model.compile(optimizer=optimizer, loss=loss, metrics=None)
    model.load_weights(dataset+'_best_model'+'.h5')
    return model

board = chess.Board()
model = load_keras_model('chess', 'mse', 'Adam')

def calculate_move(depth, board, epochs):
    first_legal_moves = str(board.legal_moves)[38:-2].replace(',','').split()
    scores = [[0]] * len(first_legal_moves)
    for epoch in range(epochs):
        for first_move in range(len(first_legal_moves)):
            play_board = board.copy()
            play_board.push_san(first_legal_moves[first_move])
            for _ in range(depth):
                legal_moves = str(play_board.legal_moves)[38:-2].replace(',','').split()
                try:
                    move = random.choice(legal_moves)
                except:
                    scores[first_move] *= 1000

    matrix = make_matrix(play_board.copy())
    translated = np.array(translate(matrix, chess_dict))
    scores[first_move] += model.predict(translated.reshape(1,8,8,12))*(maximum-minimum)+minimum
    print('Epoch', str(epoch+1)+'/'+str(epochs))
    return first_legal_moves[scores.index(max(scores))]

move = calculate_move(10, chess.Board(), 100)

while True:
    legal_moves = str(board.legal_moves)[38:-2].replace(',','').split()
    print('\n')
    print(board)
    print(str(board.legal_moves)[38:-2].replace(',','').split())
    print('\n')
    move = input('which move do you want to play?')
    board.push_san(move)
    print('\n')
    print(board)
    print('\n')
    matrix = make_matrix(board.copy())
    translated = np.array(translate(matrix, chess_dict))
    print(model.predict(translated.reshape(1,8,8,12)))
    print('\n')
    move = calculate_move(3,board,10)
    board.push_san(move)