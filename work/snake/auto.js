var turn = false;
var timer = 0;

function moveSnake() {
	var nodirection = false;
	if (emptycells.length < ROWS*2) max = emptycells.length;
	else max = 10;
	min = 3;

	snakespeed = 1; //speed up snake for snakebot
	sx = snake[0].head.x;
	sy = snake[0].head.y;
	sd = snake[0].direction;
	fx = fruit[0].x;
	fy = fruit[0].y;

	if (timer > 0) timer--;
	outer:
	for (var i = max; i >= min; i--) {
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
		} 
		
		/* //possible alternate bot code?
		if (fy < sy) {
			if (Math.abs(fy - sy) < ROWS/2 && canGo(up, sx, sy, i) && getsFruit(up, sx, sy)) {
				sd = up;
				break outer;
			} else if (canGo(down, sx, sy, i) && getsFruit(down, sx, sy)) { 
				sd = down;
				break outer;
			}
		} 
		
		else if (fy > sy) {
			if (Math.abs(fy - sy) < ROWS/2 && canGo(down, sx, sy, i) && getsFruit(down, sx, sy)) { 
				sd = down;
				break outer;
			} else if (canGo(up, sx, sy, i) && getsFruit(up, sx, sy)) { 
				sd = up;
				break outer;
			}
		} 
		
		if (fx < sx) {
			if (Math.abs(fx - sx) < COLS/2 && canGo(left, sx, sy, i) && getsFruit(left, sx, sy)) {
				sd = left;
				break outer;
			} else if (canGo(right, sx, sy, i) && getsFruit(right, sx, sy)){
				sd = right;
				break outer;
			}
		} 
		
		else if (fx > sx) { 
			if (Math.abs(fx - sx) < COLS/2 && canGo(right, sx, sy, i) && getsFruit(right, sx, sy)){ 
				sd = right;
				break outer;
			} else if (canGo(left, sx, sy, i) && getsFruit(left, sx, sy)) { 
				sd = left
				break outer;
			}
		}*/ 


		var p = Math.round(Math.random()*3);
		for (var j = p; j <= p+3; j++) {
			if (canGo(j%4, sx, sy, i)) {
				sd = j%4;
				turn = false;
				break outer;
			}
			if (i == min && j == p+3) nodirection = true;
		}
	}

	if (nodirection) {
		console.log('dying');
		sd = getBestDir();
		turn = false;
	}

	resetBoard();

	snake[0].direction = sd;
	snake[0].head.x = newPosition(SNAKE, snake[0].direction, sx, sy).x;
	snake[0].head.y = newPosition(SNAKE, snake[0].direction, sx, sy).y;
	
	if (at(FRUIT, snake[0].body[0].x, snake[0].body[0].y)) timer += snake_length;
}

function getBestDir() {
	var l = mostOptions(left, sx, sy, 1);
	resetBoard();
	var r = mostOptions(right, sx, sy, 1);
	resetBoard();
	var u = mostOptions(up, sx, sy, 1);
	resetBoard();
	var dw = mostOptions(down, sx, sy, 1);
	resetBoard();

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

	if (x > wall(right)) x = wall(left);
	else if (x < wall(left)) x = wall(right);
	else if (y > wall(down)) y = wall(up);
	else if (y < wall(up)) y = wall(down);

	if (gameOver(x, y) || at(MARKED, x, y)) return 0;
	grid.set(MARKED, x, y);

	return 1 + mostOptions(left, x, y) + mostOptions(right, x, y) + mostOptions(up, x, y) + mostOptions(down, x, y);
}

function canGo(dir, x, y, min) {
	can = getsTail(dir, x, y, 0, min);
	resetBoard();

	return can;
}

function getsFruit(dir, x, y) {
	getfruit = fruitpath(dir, x, y);
	resetBoard();

	return getfruit;
}

function fruitpath(dir, x, y) {
	if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;
	
	if (x > wall(right)) x = wall(left);
	else if (x < wall(left))  x = wall(right);
	else if (y > wall(down)) y = wall(up);
	else if (y < wall(up)) y = wall(down);

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
	
	if (x > wall(right)) x = wall(left);
	else if (x < wall(left))  x = wall(right);
	else if (y > wall(down)) y = wall(up);
	else if (y < wall(up)) y = wall(down);

	if (x == snake[0].body.at(-1).x && y == snake[0].body.at(-1).y && count >= min) return true;

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
/*
function resetBoard() {
	resetBoard();
}*/
