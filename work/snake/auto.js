var turn = false;
var timer = 0;

function moveSnake() {
	var nodirection = false;
	var max = 10;

	snakespeed = 1; //speed up snake for snakebot
	sx = snake[0].head.x;
	sy = snake[0].head.y;
	sd = snake[0].direction;
	fx = fruit[0].x;
	fy = fruit[0].y;

	if (timer > 0) timer--;

	outer:
	for (var i = max; i >= 1; i--) {
		if (atLevel() && ((canGo(towards(), sx, sy, i)  && getsFruit(towards(), sx, sy)) || (canGo(away(), sx, sy, i)  && getsFruit(away(), sx, sy))))  {
			if (canGo(towards(), sx, sy, i)) sd = towards();
			else sd = away();
			turn = false;
			break outer;
		}  else if (headingTowards() && canGo(sd, sx, sy, i) && getsFruit(sd, sx, sy)) {
			turn = false;
			break outer;
		} else if (headingAway() && canGo(nextDir(), sx, sy, i) && getsFruit(nextDir(), sx, sy)) {
			sd = nextDir();
			turn = true;
			break outer;
		} else if (headingTowards() && canGo(nextDir(), sx, sy, i) && getsFruit(nextDir(), sx, sy) && turn) {
			sd = nextDir();
			turn = false;
			break outer;
		} else {
			var p = 0; //Math.round(Math.random()*3);
			for (var j = p; j <= p+3; j++) {
				if (canGo(j%4, sx, sy, i)) {
					sd = j%4;
					turn = false;
					break outer;
				}
				if (i == 1 && j == p+3) nodirection = true;
			}
		}
	}

	if (nodirection) {
		console.log('dying');
		sd = getBestDir();
		turn = false;
	}

	clearGrid();

	snake[0].direction = sd;
	snake[0].head.x = newPosition(SNAKE, snake[0].direction, sx, sy).x;
	snake[0].head.y = newPosition(SNAKE, snake[0].direction, sx, sy).y;
	
	if (at(FRUIT, snake[0].s_body[0].x, snake[0].s_body[0].y)) timer += snake_length;
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

function canGo(dir, x, y, min) {
	can = getsTail(dir, x, y, 1, min);
	clearGrid();

	return can;
}

function getsFruit(dir, x, y) {
	getfruit = fruitpath(dir, x, y);
	clearGrid();

	return getfruit;
}

function fruitpath(dir, x, y) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;
	
	if (x > COLS - 1) x = 0;
	else if (x < 0)  x = COLS-1;
	else if (y > ROWS - 1) y = 0;
	else if (y < 0) y = ROWS-1;

	if (at(FRUIT, x, y)) return true;

	if (gameOver(x, y) || at(MARKED, x, y)) return false;

	grid.set(MARKED, x, y);

	return fruitpath(left, x, y) || fruitpath(right, x, y) || fruitpath(up, x, y) || fruitpath(down, x, y);
}

function getsTail(dir, x, y, count, min) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;
	
	if (x > COLS - 1) x = 0;
	else if (x < 0)  x = COLS-1;
	else if (y > ROWS - 1) y = 0;
	else if (y < 0) y = ROWS-1;

	if (x == snake[0].s_body.at(-1).x && y == snake[0].s_body.at(-1).y && count > min) return true;

	if (gameOver(x, y) || at(MARKED, x, y)) return false;

	grid.set(MARKED, x, y);

	return getsTail(left, x, y, count+1, min) || getsTail(right, x, y, count+1, min) || getsTail(up, x, y, count+1, min) || getsTail(down, x, y, count+1, min);
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

function away() {
	return (towards()+2)%4
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
