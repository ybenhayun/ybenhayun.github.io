function moveSnake(){
	if (fruit.x < nx && canGo(nx-1, ny)) snake.direction = left;
	else if (fruit.x > nx && canGo(nx+1, ny)) snake.direction = right;
	else if (fruit.y < ny && canGo(nx, ny-1)) snake.direction = up;
	else if (fruit.y > ny && canGo(nx, ny+1)) snake.direction = down;

	else if (canGo(nx-1, ny)) snake.direction = left;
	else if (canGo(nx+1, ny)) snake.direction = right;
	else if (canGo(nx, ny-1)) snake.direction = up;
	else if (canGo(nx, ny+1)) snake.direction = down;
	else console.log("help");
	

	for (var x = 0; x < COLS; x++) {
		for (var y = 0; y < COLS; y++) {
			if (isMarked(x, y)) grid.set(EMPTY, x, y);
		}
	}

	if (snake.direction == left) nx--;
	else if (snake.direction == up) ny--;
	else if (snake.direction == right) nx++;
	else if (snake.direction == down) ny++;


	if (nx < grid.width-COLS){
			nx = COLS-1;
	} else if (nx > COLS-1) {
			nx = grid.width-COLS;
	} else if (ny < grid.height-ROWS) {
			ny = ROWS-1;
	} else if (ny > ROWS-1) {
			ny = grid.height-ROWS;
	}
}

function update() {
	frames++;

	if ((frames%4 == 0 && gametype == "mover")||((gametype == "disoriented" || gametype == "nogod") && frames%8 ==0)){
		moveFruit();
	}		

	if (frames%20 == 0 && (gametype == "dodge" || gametype=="disoriented" || gametype == "nogod"))
		moveBombs();

	if (frames%5 == 0 && (gametype == "missiles" || gametype == "nogod")) 
		moveMissiles();

	if (frames%1 == 0){
		nx = snake.last.x;
		ny = snake.last.y;

		moveSnake();
		
		if (gameOver(nx, ny)) {
			reset = false;
			window.alert("sorry");
			return init();
		}

		hx = nx;
		hy = ny;

		if (atFruit(nx, ny)) {
			collectedFruit(nx, ny);
		} else {
			var tail = snake.remove();
			if (grid.get(tail.x, tail.y) != BOMB && grid.get(tail.x, tail.y) != WALL && gametype != "infinity")
				grid.set(EMPTY, tail.x, tail.y);  //remove for infinite snake
			tail.x = nx;
			tail.y = ny;
			grid.set(SNAKE, tail.x, tail.y);
			snake.insert(tail.x, tail.y);
		}
	}
}

function canGo(x, y){
	if (x > COLS-1) {
		if (gameOver(0, y) || isMarked(0, y)) return false;
		else return true;
	} else if (x < 0) {
		if (gameOver(COLS-1, y) || isMarked(COLS-1, y)) return false;
		else return true;
	} else if (y > ROWS-1) {
		if (gameOver(x, 0) || isMarked(x, 0)) return false;
		else return true;
	} else if (y < 0) {
		if (gameOver(x, ROWS-1) || isMarked(x, ROWS-1)) return false;
		else return true;
	}

	if (gameOver(x, y) || isMarked(x, y)) {
		return false;
	}

	if (x == COLS-1 || x == 0 || y == 0 || y == ROWS-1) { 
		if (x == COLS-1 && snake.direction == right) {
			if (gameOver(0, y) || isMarked(0, y)) return false;
			else return true;
		} else if (x == 0 && snake.direction == left) {
			if (gameOver(COLS-1, y) || isMarked(COLS-1, y)) return false;
			else return true;
		} else if (y == ROWS-1 && snake.direction == down) {
			if (gameOver(x, 0) || isMarked(x, 0)) return false;
			else return true;
		} else if (y == 0 && snake.direction == up) {
			if (gameOver(x, ROWS-1) || isMarked(x, ROWS-1)) return false;
			else return true;
		}
	}

	if (isEmpty(x, y)) grid.set(MARKED, x, y);

	return canGo(x-1, y) || canGo(x+1, y) || canGo(x, y-1) || canGo(x, y+1);
}

function isMarked(x, y) {
	return grid.get(x, y) == MARKED;
}
