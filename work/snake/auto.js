var turn = false;

function moveSnake() {
	var nodirection = false;
	if (emptycells.length < ROWS*2) max = emptycells.length;
	else max = 10;
	min = 2;

	snakespeed = 1; //speed up snake for snakebot
	sx = snake[0].head.x;
	sy = snake[0].head.y;
	sd = snake[0].direction;
	fx = fruit[0].x;
	fy = fruit[0].y;

	outer:
	for (var i = max; i >= min; i--) {
		if (atLevel() && ((canGo(towards(), sx, sy, i)  && getsFruit(towards(), sx, sy)) || (canGo(away(), sx, sy, i)  && getsFruit(away(), sx, sy))))  {
			if (canGo(towards(), sx, sy, i) && getsFruit(towards(), sx, sy)) sd = towards();
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

function bombsNearby(x, y, time) {
	var spaces = 0;

	for (var i = frames+1; i <= frames+1+time; i++) {
		if (frog && (i+2)%5 == 0 && i%100 > 30 && i%100 < 60) spaces++; 
		else if ((i+2)%20 == 0) spaces++;
	}

	var clonebombs = JSON.parse(JSON.stringify(bombs));

	for (var i = 0; i < clonebombs.length; i++) {
		for (var j = 0; j < spaces; j++) {
			if (clonebombs[i].direction == left) {
				clonebombs[i].x--;
			} else if (clonebombs[i].direction == right) { 
				clonebombs[i].x++;
			} else if (clonebombs[i].direction == up) { 
				clonebombs[i].y--;
			} else { 
				clonebombs[i].y++;
			} 

			if (clonebombs[i].x > wall(right)) clonebombs[i].x = wall(left);
			else if (clonebombs[i].x < wall(left))  clonebombs[i].x = wall(right);
			else if (clonebombs[i].y > wall(down)) clonebombs[i].y = wall(up);
			else if (clonebombs[i].y < wall(up)) clonebombs[i].y = wall(down);
		}

		if (x == clonebombs[i].x && y == clonebombs[i].y) return true;
	}

	return false;
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
	if (beammeup) {
		beammeup = false;
		loop:
		for (var i = wall(left); i <= wall(right); i++) {
			for (var j = wall(up); j <= wall(down); j++) {
				if (at(FRUIT, i, j)) {
					x = i, y = j;
					break loop;
				}
			}
		}
	}

	else if (dir == left) x = x-1; 
	else if (dir == right) x = x+1;
	else if (dir == up) y = y-1;
	else if (dir == down) y = y+1;
	
	if (x > wall(right)) x = wall(left);
	else if (x < wall(left))  x = wall(right);
	else if (y > wall(down)) y = wall(up);
	else if (y < wall(up)) y = wall(down);

	if (movebombs && count <= ROWS) {
		if (bombsNearby(x, y, count)) return false;
	}

	if (x == snake[0].body.at(-1).x && y == snake[0].body.at(-1).y && count >= min) return true;
	if (gameOver(x, y) || at(MARKED, x, y)) return false;

	if (at(FRUIT, x, y) && portal) beammeup = true;

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