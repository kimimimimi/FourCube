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


// 盤の表示
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
    console.log(idx,11122)
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
    for (let i = 0; i < bord_full; i++) {
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

function check_1d(board, color,d1,d2,d3,ret) {
    for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
    let is_ok=true;
    let temp=[]
    for(let k = 0; k < 4; k++){
        let pos = i*d1+j*d2+k*d3
        temp.push(pos)
    }
    ret.push(temp)
    }
    }
}

function check_2d(board, color,d1,d2,d3,check) {
    for(let i = 0; i < 4; i++){
    for(let r of [1,-1]){
    let is_ok=true;
    let ret=[]
    for(let k = 0; k < 4; k++){
        j= k
        if (r==-1){j=3-k}
        let pos = i*d1+j*d2+k*d3
        ret.push(pos)
    }
    check.push(ret)
    }
    }
}

function check_3d(board, color,d1,d2,d3,check) {
    for(let rj of [1,-1]){
    for(let rk of [1,-1]){
    let is_ok=true;
    let ret=[]
    for(let i = 0; i < 4; i++){
        j= i
        if (rj==-1){j=3-i}
        k = i
        if (rk==-1){k=3-i}
        let pos = i*d1+j*d2+k*d3
        ret.push(pos)
    }
    check.push(ret)
    }
    }
}

function make_check_list(){
    color=0
    const ret = []
    check_1d(board,color,16,4,1, ret)
    check_1d(board,color,4,1,16, ret)
    check_1d(board,color,1,16,4, ret)
    check_2d(board,color,16,4,1, ret)
    check_2d(board,color,4,1,16, ret)
    check_2d(board,color,1,16,4, ret)
    check_3d(board,color,1,16,4, ret)
    console.log(ret.length)
    return ret
}

const check_list = make_check_list()
//console.log(check_list)

//どちらかが四つ揃っているか。
function check_is_end(board, color) {
    for (let line of check_list){
        let is_ok=true;
        for (let idx of line){
            if (board[idx] != color){
                is_ok=false
                break
            }
        }
        if (is_ok){return line;}
    }
    return [];
}

// クリック時の動作
function makeMove() {
    const idx = Number(this.getAttribute('id'));
    if (!human(getColor(board)) || board[idx] !== empty) return;
    move(idx);
    
    const ret = check_is_end(board, black);
    if (ret.length==4){
        console.log(ret);
        after_end(ret,board);
    }
}

function after_end(ret,board){
    //操作不能にする
    for (let idx = 0; idx < bord_full; idx++)
    {
        if (board[idx] == empty){
            board[idx] = wall
        }
    }
    //揃ったところの色を変える
    for (const idx of ret)
    {
        document.getElementById(idx)
            .style.backgroundColor = 
            "#ffff00";
    }
    //アラートで勝利宣言をする。
    if (board[ret[0]]==black){
        alert('o Win')
    }else{
        alert('x Win')
    }
    //draw用にendをset
    board[teban] = end

}

// 着手
function move(idx) {
    const color = getColor(board);
    if (board[idx] !== empty) return;
    
    let movable = true;
    
    
    if (movable) {
        flip(idx);
        
        document.getElementById('countBlack').textContent = board[black_num];
        document.getElementById('countWhite').textContent = board[white_num];
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
        ret_w = check_is_end(board, white);
        if (ret_w.length==4){
            console.log(ret_w);
            after_end(ret_w, board);
        }
        let countEmpty = 0;
        for (const state of board) {
            if (state === empty) {countEmpty++;}
        }

        if(countEmpty == 1 && getColor(board) !== end){
            alert('Draw')
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
    const method=2
    //乱数の値を返す。
    if (method==0){
        min = Math.ceil(0);
        max = Math.floor(10000);
        ret = Math.floor(Math.random() * (max - min) + min);
        return ret
    }
    if (method==1){
        return 0;
    }
    
    var wa = check_is_end(newBoard, white)
    if(wa.length==4){return -800;}
    var ba = check_is_end(newBoard, black)
    if(ba.length==4){return -800;}
    return 0;
}

function moveByAI(depth) {
    let movable = listMovable(board);
    
    const color = getColor(board);
    let newBoards = {}, evals = {};
    for (const idx of movable) {
        var bwaaa = board.slice();
        bwaaa[idx] = white;
        var bbaaa = board.slice();
        bbaaa[idx] = black;
        evals[idx] = Math.max(evalBoard(bwaaa),evalBoard(bbaaa));
    }
    movable.sort(function (a, b) {
        return evals[b] - evals[a];
    })
    for (const idx of movable) {
        return idx
    }
    return res;
}

/*

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
}*/

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
