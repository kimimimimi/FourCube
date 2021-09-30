const black = 1, white = -1, empty = 0, wall = 2, end = 0;

const bord_full = 64;
const teban = bord_full+1;
const black_num = bord_full+2;
const white_num = bord_full + 3;

function colorString(color) {
    if (color === 1) {
        return 'black';
    } else {
        return 'white';
    }
}


// オセロ盤の表示
const boardShow = document.createElement('table');
document.getElementById('board').appendChild(boardShow);
let di = 0
for (let i = 0; i < 19; i++) {
    const boardLine = document.createElement('tr');
    boardShow.appendChild(boardLine);
    if (i%5!=4){
    for (let j = 0; j < 4; j++) {
        const boardCell = document.createElement('td');
        boardLine.appendChild(boardCell);
        boardCell.addEventListener('click', makeMove);
        boardCell.setAttribute('id', 4 * di + j );
    }
    di=di+1
    }
    else{
    for (let j = 0; j < 4; j++) {
        //const boardCell = document.createElement('td');
        const boardCell = document.createElement('td');
        boardCell.className = 'wall';
        boardLine.appendChild(boardCell);
　　　　　
    }}
}

// 初期盤面の作成
let board = [];
for (let i = 0; i < bord_full; i++) {
    board.push(empty);
}
board.push(0);
board.push(black);
board.push(0);
board.push(0);

const directions = [-10, -9, -8, -1, 1, 8, 9, 10];

// 手番の色を取得
function getColor(newBoard) {
    return newBoard[teban];
}

// 相手番
function changeColor(newBoard) {
    newBoard[teban] = opponent(newBoard[teban]);
}

function addStone(newBoard, color) {
    if (color === black) {
        newBoard[black_num]++;
    } else {
        newBoard[white_num]++;
    }
}

function flipStone(newBoard, color) {
    if (color === black) {
        newBoard[black_num]++;
        newBoard[white_num]--;
    } else {
        newBoard[white_num]++;
        newBoard[black_num]--;
    }
}

// 表示を含めて石を返す
function flip(idx) {
    const color = getColor(board);
    if (board[idx] === empty) {
        addStone(board, color);
    } else {
        flipStone(board, color);
    }
    board[idx] = color;
    document.getElementById(idx).setAttribute('class', colorString(color));
}

// 相手の色
function opponent(color) {
    if (color === black) {
        return white;
    } else {
        return black;
    }
}

// 打てる場所をリストアップ
function listMovable(newBoard) {
    let movable = [];
    const color = getColor(newBoard);
    for (let i = 0; i <= bord_full; i++) {
        if (newBoard[i] !== empty) {
            continue;
        }
        movable.push(i);
    }
    return movable;
}

// 打てる場所があるか
function existsMovable(newBoard) {
    const color = getColor(newBoard);
    for (let i = 0; i <= bord_full; i++) {
        if (newBoard[i] !== empty) {
            continue;
        }
        return true;
    }
    return false;
}

// クリック時の動作
function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (!human(getColor(board)) || board[idx] !== empty) return;
    move(idx);
}

// 着手
function move(idx) {
    const color = getColor(board);
    if (board[idx] !== empty) return;
    
    let movable = true;
    /*
    for (let i = 0; i < 8; i++) {
        const d = directions[i];
        let next = idx + d;
        while (board[next] === opponent(color)) {
            next += d;
        }
        if (board[next] === color) {
            next -= d;
            while (board[next] === opponent(color)) {
                flip(next);
                movable = true;
                next -= d;
            }
        }
    }*/
    
    if (movable) {
        flip(idx);
        document.getElementById('countBlack').textContent = board[black_num];
        document.getElementById('countWhite').textContent = board[93];
        changeColor(board);
        const color = getColor(board);
        if (existsMovable(board)) {
            document.getElementById('turn').textContent = colorString(color);
        } else {
            changeColor(board);
            if (existsMovable(board)) {
                alert(colorString(color) + ' pass');
            } else {
                board[91] = end;
                document.getElementById('turn').textContent = '終局';
                alert('終局');
            }
        }
        if (getColor(board) !== end && !human(getColor(board))) {
            let countEmpty = 0;
            for (const state of board) {
                if (state === empty) {
                    countEmpty++;
                }
            }
            if (countEmpty <= endgameDepth) {
                setTimeout(() => move(moveByAI(countEmpty)), 0);
            } else {
                setTimeout(() => move(moveByAI(defaultDepth)), 0);
            }
        }
    }
}

function afterMove(oldBoard, idx) {
    let newBoard = oldBoard.slice(), movable = false, color = getColor(oldBoard);
    for (let i = 0; i < 8; i++) {
        const d = directions[i];
        let next = idx + d;
        if (newBoard[next] !== opponent(color)) {
            continue;
        }
        next += d;
        while (newBoard[next] === opponent(color)) {
            next += d;
        }
        if (newBoard[next] === color) {
            movable = true;
            next -= d;
            while (newBoard[next] === opponent(color)) {
                newBoard[next] = color;
                flipStone(newBoard, color);
                next -= d;
            }
        }
    }
    if (movable) {
        newBoard[idx] = color;
        addStone(newBoard, color);
        changeColor(newBoard);
        if (!existsMovable(newBoard)) {
            changeColor(newBoard);
            if (!existsMovable(newBoard)) {
                newBoard[91] = end;
            }
        }
    }
    return newBoard;
}

// 黒番から見た評価値
function evalBoard(newBoard) {
    min = Math.ceil(0);
    max = Math.floor(10000);
    return Math.floor(Math.random() * (max - min) + min); 
    

    let res = Math.random();
    if (getColor(newBoard) === end) {
        res = newBoard[black_num ] - newBoard[white_num];
        if (res > 0) {
            res = 64 - 2 * newBoard[93];
        } else if (res < 0) {
            res = 2 * newBoard[92] - 64;
        }
        return 1000 * res;
    }
    for (let i = 20; i <= 70; i++) {
        if (Math.abs(newBoard[i]) !== 1 || (i + 1) % 9 < 3) {
            continue;
        }
        let value = 0;
        for (let j = 0; j < 8; j++) {
            const d = directions[j];
            if (newBoard[i + d] === empty) {
                value--;
            }
        }
        res += value * newBoard[i];
    }
    // 隅
    const corner = [10, 17, 73, 80];
    for (let i = 0; i < corner.length; i++) {
        for (let j = i + 1; j < corner.length; j++) {
            const d = (corner[j] - corner[i]) / 7;
            if (i + j === 3) { // Xライン
                if (newBoard[corner[i]] === empty) {
                    res -= 6 * newBoard[corner[i] + d];
                }
                if (newBoard[corner[j]] === empty) {
                    res -= 6 * newBoard[corner[j] - d];
                }
                continue;
            }
            let value = 0;
            for (let k = 2; k < 6; k++) {
                if (newBoard[corner[i] + k * d] === empty) {
                    value -= 2;
                }
            }
            if (newBoard[corner[i]] === empty) {
                res += value * newBoard[corner[i] + d];
            }
            if (newBoard[corner[j]] === empty) {
                res += value * newBoard[corner[j] - d];
            }
            let noEmpty = true, adjust = 0;
            for (let k = 0; k < 8; k++) {
                if (newBoard[corner[i] + k * d] === empty) {
                    noEmpty = false;
                    break;
                }
                adjust += newBoard[corner[i] + k * d];
            }
            const edge = newBoard[corner[i]] + newBoard[corner[j]];
            if (noEmpty) {
                res += adjust;
            } else if (edge > 0) {
                res += 8;
            } else if (edge < 0) {
                res -= 8;
            }
        }
    }
    return res;
}

function moveByAI(depth) {
    let movable = listMovable(board), res, maxScore = -64000;
    const color = getColor(board);
    let newBoards = {}, evals = {};
    for (const idx of movable) {
        return idx
        newBoards[idx] = afterMove(board, idx);
        evals[idx] = search(newBoards[idx], 0, color, -64000, 64000);
    }
    movable.sort(function (a, b) {
        return evals[b] - evals[a];
    })
    let first = true;
    for (const idx of movable) {
        const newBoard = newBoards[idx];
        let eval;
        if (first) {
            eval = search(newBoard, depth - 1, color, -64000, 64000);
            first = false;
        } else {
            eval = search(newBoard, depth - 1, color, maxScore, maxScore + 1);
            if (eval >= maxScore + 1) {
                eval = search(newBoard, depth - 1, color, eval, 64000);
            }
        }
        if (eval > maxScore) {
            res = idx;
            maxScore = eval;
        }
    }
    return res;
}

// 前の着手から見た評価値、α以下もしくはβ以上が確定したら枝刈り
function search(currentBoard, depth, prevColor, alpha, beta) {
    const color = getColor(currentBoard);
    let eval = alpha;
    if (prevColor !== color) {
        eval = -beta;
    }
    if (depth <= 0 || color === end) {
        eval = evalBoard(currentBoard);
        if (prevColor === white) {
            eval *= -1;
        }
        return eval;
    }
    let movable = listMovable(currentBoard);
    if (depth > 3) {
        let evals = {};
        for (const idx of movable) {
            evals[idx] = search(afterMove(currentBoard, idx), 0, color, -64000, 64000);
        }
        movable.sort(function (a, b) {
            return evals[b] - evals[a];
        });
    }
    let first = true;
    for (const idx of movable) {
        const newBoard = afterMove(currentBoard, idx);
        let newAlpha = alpha, newBeta = alpha + 1;
        if (prevColor !== color) {
            newAlpha = -beta;
            newBeta = -beta + 1;
        }
        if (first) {
            newBeta = beta;
            if (prevColor !== color) {
                newBeta = -alpha;
            }
        }
        let newEval = search(newBoard, depth - 1, color, newAlpha, newBeta);
        if (newEval > eval) {
            eval = newEval;
            if (prevColor === color) {
                alpha = eval;
            } else {
                beta = -eval;
            }
            if (alpha >= beta) {
                break;
            }
            if (first) {
                first = false;
                continue;
            }
            if (eval < newBeta) {
                continue;
            }
            newAlpha = alpha;
            newBeta = beta;
            if (prevColor !== color) {
                newAlpha = -beta;
                newBeta = -alpha;
            }
            newEval = search(newBoard, depth - 1, color, newAlpha, newBeta);
            if (newEval > eval) {
                eval = newEval;
                if (prevColor === color) {
                    alpha = eval;
                } else {
                    beta = -eval;
                }
                if (alpha >= beta) {
                    break;
                }
            }
        }
        first = false;
    }
    if (prevColor !== color) {
        eval *= -1;
    }
    return eval;
}

const defaultDepth = 8;
const endgameDepth = 14;

function human(color) {
    if (color === black) {
        return true;
    } else {
        return false;
    }
}

if (getColor(board) !== end && !human(getColor(board))) {
    move(moveByAI(defaultDepth));
}
