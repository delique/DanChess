import os
import chess
import numpy as np
from pandas import read_csv
from keras import callbacks, optimizers
from keras.layers import (LSTM, BatchNormalization, Dense, Dropout, Flatten, TimeDistributed)
from keras.layers.convolutional import Conv2D, MaxPooling2D
from keras.models import Sequential, load_model, model_from_json
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

#####################################################

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

##############################################################

model = Sequential()
model.add(Conv2D(filters=10, kernel_size=1, activation='relu', input_shape=(8,8,12)))
model.add(MaxPooling2D(pool_size=2, strides=None))
model.add(Flatten())
model.add(BatchNormalization())
model.add(Dense(1, activation='sigmoid'))

model.compile(optimizer='Adam', loss='mse')
h5 = 'chess' + '_best_model' + '.h5'
checkpoint = callbacks.ModelCheckpoint(h5, monitor='val_loss', verbose=0, save_best_only=True, mode='auto', period=1)
es = callbacks.EarlyStopping(monitor='val_loss', mode='min', verbose=1, patience=5000)
callback = [checkpoint, es]
json = 'chess' + '_best_model' + '.json'
model_json = model.to_json()
with open(json, "w") as json_file:
    json_file.write(model_json)
print('Training Network....')

test = 1000
X = np.array(X)
X_train = X[test:]
y_train = y[test:]

X_test = X[:test]
y_test = y[:test]

model.fit(X_train, y_train, epochs=10000, verbose=2, validation_data=(X_test, y_test), callbacks=callback)