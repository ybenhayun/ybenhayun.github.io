var turn = false;

function moveSnake() {
	a = emptycells.length;
	snakespeed = 1; //speed up snake for snakebot
	sx = snake[0].last.x;
	sy = snake[0].last.y;
	sd = snake[0].direction;
	fx = fruit[0].x;
	fy = fruit[0].y;


	if (atLevel() && canGo(towards(), sx, sy) && leavesMost(towards())) {
		sd = towards();
		turn = false;
	}  else if (headingTowards() && canGo(sd, sx, sy) && !turn && leavesMost(sd)) {
		turn = false;
	} else if (headingAway() && canGo(nextDir(), sx, sy) && leavesMost(nextDir())) {
		sd = nextDir();
		turn = true;mostOptions
	} else if (headingTowards() && canGo(nextDir(), sx, sy) && turn && leavesMost(nextDir())) {
		sd = nextDir();
		turn = false;
	} else {
		sd = getBestDir();
		turn = false;
	}

	clearGrid();

	snake[0].direction = sd;
	snake[0].last.x = newPosition(SNAKE, snake[0].direction, sx, sy).x;
	snake[0].last.y = newPosition(SNAKE, snake[0].direction, sx, sy).y;
}

function leavesMost(dir) {
	var cells = mostOptions(dir, sx, sy);
	clearGrid();

	if (cells > .80*emptycells.length) return true;

	else {
		return false;
	}
}

function getBestDir() {
	var l = mostOptions(left, sx, sy);
	clearGrid();
	var r = mostOptions(right, sx, sy);
	clearGrid();
	var u = mostOptions(up, sx, sy);
	clearGrid();
	var dw = mostOptions(down, sx, sy);
	clearGrid();

	var max = Math.max(l, r, u ,dw);

	if (max == l) return left;
	if (max == r) return right;
	if (max == u) return up;
	if (max == dw) return down;
}

function longestPath(dir, x, y) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;

	if (x > COLS - 1) x = 0;
	else if (x < 0) x = COLS-1;
	else if (y > ROWS - 1) y = 0;
	else if (y < 0) y = ROWS-1;

	var l = 1 + toThe(left, x, y);
	clearGrid();
	var r = 1 + toThe(right, x, y);
	clearGrid();
	var u = 1 + toThe(up, x, y);
	clearGrid();
	var dw = 1 + toThe(down, x, y);
	clearGrid();
	
	return Math.max(l, r, u, dw);
}

function toThe(dir, x, y) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;

	if (x > COLS - 1) x = 0;
	else if (x < 0) x = COLS-1;
	else if (y > ROWS - 1) y = 0;
	else if (y < 0) y = ROWS-1;

	if (gameOver(x, y) || at(MARKED, x, y)) return 0;
	if (at(EMPTY, x, y) || at(FRUIT, x, y)) grid.set(MARKED, x, y);

	var l = 1 + toThe(left, x, y);
	var r = 1 + toThe(right, x, y);
	var u = 1 + toThe(up, x, y);
	var dw = 1 + toThe(down, x, y);
	
	return Math.max(l, r, u, dw);
}


function mostOptions(dir, x, y) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;

	if (x > COLS - 1) x = 0;
	else if (x < 0) x = COLS-1;
	else if (y > ROWS - 1) y = 0;
	else if (y < 0) y = ROWS-1;

	if (gameOver(x, y) || at(MARKED, x, y)) return 0;
	if (at(EMPTY, x, y) || at(FRUIT, x, y)) grid.set(MARKED, x, y);

	return 1 + mostOptions(left, x, y) + mostOptions(right, x, y) + mostOptions(up, x, y) + mostOptions(down, x, y);
}

function canGo(dir, x, y) {
	can = notBoxedIn(dir, x, y);
	clearGrid();

	return can;
}

function notBoxedIn(dir, x, y){
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;
	

	if (x > COLS - 1) return !gameOver(0, y);
	else if (x < 0)  return !gameOver(COLS-1, y);
	else if (y > ROWS - 1) return !gameOver(x, 0);
	else if (y < 0)  return !gameOver(x, ROWS-1);
	

	if (gameOver(x, y) || at(MARKED, x, y)) return false;
	if (at(WALL, x, y) || (at(FRUIT, x, y) && (x != fruit[0].x || y != fruit[0].y))) return true;

	if (!at(BOMB, x, y) && !at(SNAKE, x, y) && !at(HEAD, x, y) && !at(FRUIT, x, y)) grid.set(MARKED, x, y);

	return (notBoxedIn(left, x, y) || notBoxedIn(right, x, y) || notBoxedIn(up, x, y) || notBoxedIn(down, x, y))
}

function atLevel() {
	return (fx == sx || fy == sy);
}

function headingAway() {
	return (fx > sx && sd == left) || (fx < sx && sd == right) || (fy > sy && sd == up) || (fy < sy && sd == down);
}

function headingTowards() {
	return (fx > sx && sd == right) || (fx < sx && sd == left) || (fy > sy && sd == down) || (fy < sy && sd == up);
}

function towards() {
	if (fx > sx) return right;
	if (fx < sx) return left;
	if (fy > sy) return down;
	if (fy < sy) return up;
}

function nextDir() {
	if (sd == left || sd == right) {
		if (fy > sy) return down;
		return up;
	}

	if (sd == up || sd == down) {
		if (fx > sx) return right;
		return left;
	}
}

function clearGrid (){
	for (var i = 0; i < COLS; i++) {
		for (var j = 0; j < COLS; j++) {
			if (at(MARKED, i, j)) grid.set(EMPTY, i, j);
		}
	}

	grid.set(FRUIT, fx, fy);
}
