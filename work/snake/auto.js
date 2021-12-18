function moveSnake() {
	snakespeed = 1; //speed up snake for snakebot
	
	if (fruit[0].x < snake[0].last.x && canGo(snake[0].last.x-1, snake[0].last.y)) snake.direction = left;
	else if (fruit[0].x > snake[0].last.x && canGo(snake[0].last.x+1, snake[0].last.y)) snake.direction = right;
	else if (fruit[0].y < snake[0].last.y && canGo(snake[0].last.x, snake[0].last.y-1)) snake.direction = up;
	else if (fruit[0].y > snake[0].last.y && canGo(snake[0].last.x, snake[0].last.y+1)) snake.direction = down;

	else if (canGo(snake[0].last.x-1, snake[0].last.y)) snake.direction = left;
	else if (canGo(snake[0].last.x+1, snake[0].last.y)) snake.direction = right;
	else if (canGo(snake[0].last.x, snake[0].last.y-1)) snake.direction = up;
	else if (canGo(snake[0].last.x, snake[0].last.y+1)) snake.direction = down;
	else console.log("help");
	

	for (var x = 0; x < COLS; x++) {
		for (var y = 0; y < COLS; y++) {
			if (at(MARKED, x, y)) grid.set(EMPTY, x, y);
		}
	}

	if (snake.direction == left) snake[0].last.x--;
	else if (snake.direction == up) snake[0].last.y--;
	else if (snake.direction == right) snake[0].last.x++;
	else if (snake.direction == down) snake[0].last.y++;


	if (snake[0].last.x < grid.width-COLS){
			snake[0].last.x = COLS-1;
	} else if (snake[0].last.x > COLS-1) {
			snake[0].last.x = grid.width-COLS;
	} else if (snake[0].last.y < grid.height-ROWS) {
			snake[0].last.y = ROWS-1;
	} else if (snake[0].last.y > ROWS-1) {
			snake[0].last.y = grid.height-ROWS;
	}
}

function canGo(x, y){
	if (x > COLS-1) {
		if (gameOver(0, y) || at(MARKED, 0, y)) return false;
		else return true;
	} else if (x < 0) {
		if (gameOver(COLS-1, y) || at(MARKED, COLS-1, y)) return false;
		else return true;
	} else if (y > ROWS-1) {
		if (gameOver(x, 0) || at(MARKED, x, 0)) return false;
		else return true;
	} else if (y < 0) {
		if (gameOver(x, ROWS-1) || at(MARKED, x, ROWS-1)) return false;
		else return true;
	}

	if (gameOver(x, y) || at(MARKED, x, y)) {
		return false;
	}

	if (x == COLS-1 || x == 0 || y == 0 || y == ROWS-1) { 
		if (x == COLS-1 && snake.direction == right) {
			if (gameOver(0, y) || at(MARKED, 0, y)) return false;
			else return true;
		} else if (x == 0 && snake.direction == left) {
			if (gameOver(COLS-1, y) || at(MARKED, COLS-1, y)) return false;
			else return true;
		} else if (y == ROWS-1 && snake.direction == down) {
			if (gameOver(x, 0) || at(MARKED, x, 0)) return false;
			else return true;
		} else if (y == 0 && snake.direction == up) {
			if (gameOver(x, ROWS-1) || at(MARKED, x, ROWS-1)) return false;
			else return true;
		}
	}

	if (at(EMPTY, x, y)) grid.set(MARKED, x, y);

	return canGo(x-1, y) || canGo(x+1, y) || canGo(x, y-1) || canGo(x, y+1);
}