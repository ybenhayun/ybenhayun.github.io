var turn = false;

function moveSnake() {
	snakespeed = 1; //speed up snake for snakebot
	var x = snake[0].last.x;
	var y = snake[0].last.y;
	var d = snake[0].direction;
	var fx = fruit[0].x;
	var fy = fruit[0].y

	//one variable is already equal
	if (fx == x && fy < y && canGo(up, x, y)) {
		turn = false;
		d = up;
	} else if (fx == x && fy > y && canGo(down, x, y)) {
		turn = false;
		d = down;
	} else if (fy == y && fx < x && canGo(left, x, y)) {
		turn = false;
		d = left;
	} else if (fy == y && fx > x && canGo(right, x, y)) {
		turn = false;
		d = right;
	} 
	
	//if snake is already heading towards the fruit
	else if (!turn && fx > x && d == right && canGo(right, x, y)) {
		d = right;
	} else if (!turn && fx < x && d == left && canGo(left, x, y)) {
		d = left;
	} else if (!turn && fy > y && d == down && canGo(down, x, y)) {
		d = down;
	} else if (!turn && fy < y && d == up && canGo(up, x, y)) {
		d = up;
	}

	//if snake is heading away from the fruit
	else if (((fx < x && d == right) || (fx > x && d == left)) && (fy > y && canGo(down, x, y))) {
		d = down;
		turn = true;
	} else if (((fx < x && d == right) || (fx > x && d == left)) && (fy < y && canGo(up, x, y))) {
		d = up;
		turn = true;
	}

	else if (((fy < y && d == down) || (fy > y && d == up)) && (fx > x && canGo(right, x, y))) {
		d = right;
		turn = true;
	} else if (((fy < y && d == down) || (fy > y && d == up)) && (fx < x && canGo(left, x, y))) {
		d = left;
		turn = true;
	}

	//if snake just turned
	else if (turn && d == up && fx < x && canGo(left, x, y)) {
		turn = false;
		d = left;
	} else if (turn && d == up && fx > x && canGo(right, x, y)) {
		turn = false;
		d = right;
	} else if (turn && d == down && fx < x && canGo(left, x, y)) {
		turn = false;
		d = left;
	} else if (turn && d == down && fx > x && canGo(right, x, y)) {
		turn = false;
		d = right;
	} 

	else if (turn && d == left && fy < y && canGo(up, x, y)) {
		turn = false;
		d = up;
	} else if (turn && d == left && fy > y && canGo(down, x, y)) {
		turn = false;
		d = down;
	} else if (turn && d == right && fy < y && canGo(up, x, y)) {
		turn = false;
		d = up;
	} else if (turn && d == right && fy > y && canGo(down, x, y)) {
		turn = false;
		d = down;
	} 

	//if snake can just turn to fruit normally
	else if (fx > x && canGo(right, x, y)) {
		d = right;
		turn = false;
	} else if (fx < x && canGo(left, x, y)) {
		d = left;
		turn = false; 
	} else if (fy > y && canGo(down, x, y)) {
		d = down;
		turn = false;
	} else if (fy < y && canGo(up, x, y)) {
		d = up;
		turn = false;
	}

	/*//dont go through walls at first
	else if (canGo(right, x, y) && x != COLS-1) {
		d = right;
		turn = false;
	} else if (canGo(left, x, y) && x != 0) {
		d = left;
		turn = false;
	} else if (canGo(down, x, y) && y != ROWS-1) {
		d = down;
		turn = false;
	} else if (canGo(up, x, y) && y != 0) {
		d = up;
		turn = false;
	}*/

	/*//if snake should go through wall
	else if (fx > x && canGo(left, x, y)) {
		d = left;
		turn = false;
	} else if (fx < x && canGo(right, x, y)) {
		d = right;
		turn = false; 
	} else if (fy > y && canGo(up, x, y)) {
		d = up;
		turn = false;
	} else if (fy < y && canGo(down, x, y)) {
		d = down;
		turn = false;
	}*/

	//if none of the good options are viable
	else if (canGo(left, x, y) && x != 0) { 
		turn = false;
		d = left;
	} else if (canGo(right, x, y) && x != COLS-1) { 
		turn = false;
		d = right;
	} else if (canGo(up, x, y) && y != 0) {
		turn = false;
		d = up;
	} else if (canGo(down, x, y) && y != ROWS-1) {
		turn = false;
		d = down;
	}

	//you can go through walls now
	else if (canGo(left, x, y)) { 
		turn = false;
		d = left;
	} else if (canGo(right, x, y)) { 
		turn = false;
		d = right;
	} else if (canGo(up, x, y)) {
		turn = false;
		d = up;
	} else if (canGo(down, x, y)) {
		turn = false;
		d = down;
	}

	//if death is invetible
	else {
		console.log("left: " + getBestDir(left, x, y));
		console.log("right: " + getBestDir(right, x, y));
		console.log("up: " + getBestDir(up, x, y));
		console.log("down: " + getBestDir(down, x, y));

		if (!gameOver((COLS+x-1)%COLS, y)) { 
			turn = false;
			d = left;
		} else if (!gameOver((x+1)%COLS, y)) { 
			turn = false;
			d = right;
		} else if (!gameOver(x, (ROWS+y-1)%ROWS)) { 
			turn = false;
			d = up;
		} else if (!gameOver(x, (y+1)%ROWS)) { 
			turn = false;
			d = down;
		} 
	}

	for (var i = 0; i < COLS; i++) {
		for (var j = 0; j < COLS; j++) {
			if (at(MARKED, i, j)) grid.set(EMPTY, i, j);
		}
	}

	snake[0].direction = d;
	snake[0].last.x = newPosition(SNAKE, snake[0].direction, x, y).x;
	snake[0].last.y = newPosition(SNAKE, snake[0].direction, x, y).y;
}

function getBestDir(dir, x, y) {
	if (dir == left) {
		x = x-1; 
	} else if (dir == right) {
		x = x+1;
	} else if (dir == up) {
		y = y-1;
	} else if (dir == down) {
		y = y+1;
	}

	if (x > COLS - 1) { 
		if (!gameOver(0, y)) return 1;
		else return 0;
	} else if (x < 0) { 
		if (!gameOver(COLS-1, y)) return 1;
		else return 0;
	} else if (y > ROWS - 1) {
		if (!gameOver(x, 0)) return 1;
		else return 0;
	} else if (y < 0) { 
		if (!gameOver(x, ROWS-1)) return 1;
		else return 0;
	}

	if (gameOver(x, y) || at(MARKED, x, y)) {
		return 0;
	}

	if (at(WALL, x, y) || (at(FRUIT, x, y) && (x != fruit[0].x || y != fruit[0].y))) { 
		return 1;
	}

	if (!at(BOMB, x, y) && !at(SNAKE, x, y) && !at(HEAD, x, y) && !at(FRUIT, x, y)) grid.set(MARKED, x, y);

	return 1 + (canGo(left, x, y) + canGo(right, x, y) + canGo(up, x, y) + canGo(down, x, y))
}

function canGo(dir, x, y){
	if (dir == left) {
		x = x-1; 
	} else if (dir == right) {
		x = x+1;
	} else if (dir == up) {
		y = y-1;
	} else if (dir == down) {
		y = y+1;
	}

	if (x > COLS - 1) { 
		return !gameOver(0, y);
	} else if (x < 0) { 
		return !gameOver(COLS-1, y);
	} else if (y > ROWS - 1) {
		return !gameOver(x, 0);
	} else if (y < 0) { 
		return !gameOver(x, ROWS-1);
	}

	if (gameOver(x, y) || at(MARKED, x, y)) {
		return false;
	}

	if (at(WALL, x, y) || (at(FRUIT, x, y) && (x != fruit[0].x || y != fruit[0].y))) { 
		return true;
	}

	if (!at(BOMB, x, y) && !at(SNAKE, x, y) && !at(HEAD, x, y) && !at(FRUIT, x, y)) grid.set(MARKED, x, y);

	return (canGo(left, x, y) || canGo(right, x, y) || canGo(up, x, y) || canGo(down, x, y))
}