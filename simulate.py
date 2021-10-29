import itertools
import random
import collections
import time

white=-1
black=1
empty=0
board_size=64
int_to_name={-1:'White',0:'Empty',1:'Black'}

def _check_1d(d1,d2,d3,ret):
	for i in range(4):
		for j in range(4):
			temp=[]
			for k in range(4):
				pos=i*d1+j*d2+k*d3
				temp.append(pos)
			ret.append(temp)
			
def _check_2d(d1,d2,d3,ret):
	for i in range(4):
		for r in [-1,1]:
			temp=[]
			for k in range(4):
				j=k if r==1 else 3-k
				pos=i*d1+j*d2+k*d3
				temp.append(pos)
			ret.append(temp)
			
def _check_3d(d1,d2,d3,ret):
	for ri in [-1,1]:
		for rj in [-1,1]:
			temp=[]
			for k in range(4):
				i = k if ri == 1 else 3-k
				j = k if rj == 1 else 3-k
				pos=i*d1+j*d2+k*d3
				temp.append(pos)
			ret.append(temp)

def make_check_list():
	ret = []
	_check_1d(16,4,1, ret)
	_check_1d(4,1,16, ret)
	_check_1d(1,16,4, ret)
	_check_2d(16,4,1, ret)
	_check_2d(4,1,16, ret)
	_check_2d(1,16,4, ret)			
	_check_3d(1,16,4, ret)
	return ret

check_list=make_check_list()

def is_end(board):
	for l in check_list:
		ls = [board[i] for i in l]
		if sum(ls) == white * 4:
			return white
		elif sum(ls) == black * 4:
			return black
	return empty

def manual(board):
	while True:
		i = int(input())
		if i < 0 or 64 <= i:
			continue
		if board[i]!= empty:
			continue
		return i

def rand(board):
	while True:
		i = random.randrange(64)
		if i < 0 or 64 <= i:
			continue
		if board[i]!= empty:
			continue
		return i
		
		
def est_board(board, color):
	ret=0
	kkk=[0, 1, 10, 100, 1000]
	for l in check_list:
		ncc=0
		nrc=0
		for i in l:
			c = board[i]
			if c == empty:
				pass
			elif c == color:
				ncc += 1
			else:
				nrc += 1
		if ncc == 0:
			ret -= kkk[nrc]
		elif nrc == 0:
			ret += kkk[ncc]
	return ret + random.random()
	
def heuristic(board, color):
	h_max=None
	h_i=0
	for i in range(board_size):
		if board[i]!=empty:
			continue
		next_b=board[:]
		next_b[i]=color
		v = est_board(next_b, color)
		if h_max is None or h_max < v:
			h_max = v
			h_i = i
	return h_i

def heuristic_mm(board, color,depth=1):
	h_max=None
	h_i=0
	for i in range(board_size):
		if board[i]!=empty:
			continue
		next_b=board[:]
		next_b[i]=color
		v = min_max(next_b, depth, -1, color, -color)
		if h_max is None or h_max < v:
			h_max = v
			h_i = i
	return h_i

def min_max(board, depth, fugou, color, next_color):
	winner = is_end(board)
	if winner == color:
		return 100000
	elif winner == -1*color:
		return -100000
	if depth == 0:
		return est_board(board, color)
	
	h_max=None
	h_i=0
	for i in range(board_size):
		if board[i]!=empty:
			continue
		#next_b=board[:]
		board[i]=next_color
		v = min_max(board, depth-1, fugou*-1, color, next_color*-1)
		board[i]=0
		if h_max is None or fugou*h_max < fugou*v:
			h_max = v
			h_i = i
	return h_max

def playout(board, color):
	n_empty=sum([1 for c in board if c==empty])
	cc=color
	pos_list=[]
	while n_empty>0:
		c,i = check_clitical(board, cc)
		if c:
			ret=i
		else:
			ret = random.choice([i for i,c in enumerate(board) if c== empty])
		board[ret] = cc
		if cc==color:
			pos_list.append(ret)
		if is_end(board):
			return cc, pos_list
		cc*=-1
		n_empty-=1
	
	return empty, pos_list
	
def mcts2(board,color, *, time_limit=2):
	st=time.time()
	score=[[0,1] for c in board]
	
	n_try=0
	while time.time() - st < time_limit:
		n_try+=1
		winner, pos_list=playout(board[:],color)
		add = 0
		if winner == empty:
			add=0.5
		elif winner == color:
			add=1
		for p in pos_list:
			score[p][1]+=1
			score[p][0]+=add
	print(n_try)
	ret = max(range(board_size), key=lambda i : score[i][0]/score[i][1])
	return ret

def mcts(board,color, *, time_limit=2):
	st=time.time()
	score=[[0 if c!=empty else 1,2] for c in board]
	dd=[i for i,c in enumerate(board) if c == empty]
	start=board_size - len(dd)
	num_board=[0]*64
	for i,c in enumerate(board):
		if c == white:
			num_board[i]=1
	
	n_try=0
	while time.time() - st < time_limit:
		n_try+=1
		dd.sort(key=lambda v:random.random())
		for turn_i, d_index in enumerate(dd, start):
			num_board[d_index]=turn_i
		#print('_____+++++_____')
		#showeboard(num_board,lambda v:v)
		min_win=empty
		min_turn=100
		for l in check_list:
			uu=[num_board[i] for i in l]
			if max(uu) > min_turn:
				continue
			uuu=[v for v in uu if v%2==1]
			if len(uuu)==4:
				min_win=white
				min_turn=max(uu)
			elif len(uuu)==0:
				min_win=black
				min_turn=max(uu)
		if color == min_win:
			score[dd[0]][0]+=10
		elif min_win == empty:
			score[dd[0]][0]+=5
		score[dd[0]][1]+=10
		#print(min_turn,min_win)
		#sc_form=lambda v:'{:.2}'.format(v[0]/v[1])
		#showeboard(score,sc_form)
		#a=1/0
	#print('try:',n_try)
	sc_form=lambda v:'{:.2}'.format(v[0]/v[1])
	#if start<=1:
	showeboard(score,sc_form)
		
	ret = max(range(board_size), key=lambda i : score[i][0]/score[i][1])
	return ret

def check_clitical(board, color):
	for di in range(board_size):
		if board[di]!=empty:
			continue
		board[di]=color
		for l in check_list:
			if sum([1 for i in l if board[i]==color])==4:
				return True, di
		board[di]=empty
	
	#.......
	for di in range(board_size):
		if board[di]!=empty:
			continue
		board[di]=-color
		for l in check_list:
			if sum([1 for i in l if board[i]==-1*color])==4:
				return True, di
		board[di]=empty
	#......
	for di in range(board_size):
		if board[di]!=empty:
			continue
		board[di]=-color
		nn=0
		for l in check_list:
			ss=[board[i] for i in l]
			ss.sort()
			if ss==[-color,-color,-color,empty]:
				nn+=1
			elif ss==[empty,-color,-color,-color]:
				nn+=1
			if nn == 2:
				return True, di
		board[di]=empty
		
	return False,None
			

def white_method(board):
	#return rand(board)
	c,i = check_clitical(board, white)
	if c:
		return i
	#return rand(board)
	#return mcts(board, white, time_limit=4)
	return heuristic_mm(board, white,depth=1)

def black_method(board):
	c,i = check_clitical(board, black)
	if c:
		return i
	#return rand(board)
	return mcts2(board, black, time_limit=2)
	#return heuristic_mm(board, black,depth=1)

def test():
	board=[empty]*65
	board[-1]=black
	ppp=[]
	for turn in range(64):
		if turn%2==0:
			pos = black_method(board[:])
			board[pos] = black
			print('pos black', pos)
			ppp.append(pos+10)
		else:
			pos = white_method(board[:])
			board[pos] = white
			ppp.append(pos+10)
			print('pos white', pos)
		
		#showeboard(board,lambda v:v+1)
		#print('+++++++++')
		winner = is_end(board)
		#print('ww',winner)
		if winner != empty:
			#print('winner is ', int_to_name[winner])
			return winner, ''.join([str(p) for p in ppp])
	else:
		#print('drow')
		return 0, ''.join([str(p) for p in ppp])
		
def showeboard(board, ff):
	print('+++++++++++++')
	for i in range(16):
		print([ff(v) for v in board[i*4:i*4+4]])
		if i%4==3 and i!=15:
			print('____')
		

def show(ll):
	b=[0]*board_size
	c=black
	for ca, cb in zip(ll[0::2], ll[1::2]):
		b[int(ca)*10+int(cb)-10] = c
		c*=-1
	d={white:'W',empty:'_',black:'B'}
	bc=[d[v] for v in b]
	for i in range(0,board_size,4):
		print(bc[i:i+4])
		if i % 16 == 12:
			print('')

counter=collections.Counter()
for i in range(1):
	#print(i)
	w,h = test()
	print(w, h)
	counter[w]+=1
	show(h)

for k in counter:
	print(int_to_name[k] , counter[k])
