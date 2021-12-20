function moveSnake() {
	snakespeed = 1; //speed up snake for snakebot
	var x = snake[0].last.x;
	var y = snake[0].last.y;
	var olddir = snake[0].direction;
	
	if (fruit[0].x < x && canGo(x-1, y)) {
		snake[0].direction = left;
	}

	else if (fruit[0].x > x && canGo(x+1, y)) {
		snake[0].direction = right;
	}
	
	else if (fruit[0].y < y && canGo(x, y-1)) {
		snake[0].direction = up;
	}
	
	else if (fruit[0].y > y && canGo(x, y+1)) {
		snake[0].direction = down;
	}

	else if (canGo(x-1, y)) snake[0].direction = left;
	else if (canGo(x+1, y)) snake[0].direction = right;
	else if (canGo(x, y-1)) snake[0].direction = up;
	else if (canGo(x, y+1)) snake[0].direction = down;
	else {
		console.log("trying to live");
		/*if (x > COLS - 1) x = 0;
		if (x < 0) x = COLS-1;
		if (y > ROWS - 1) y = 0;
		if (y < 0) y = ROWS - 1;*/

		if (!gameOver((x-1)%COLS, y%ROWS)) snake[0].direction = left;
		else if (!gameOver((x+1)%COLS, y%ROWS)) snake[0].direction = right;
		else if (!gameOver(x%COLS, (y-1)%ROWS)) snake[0].direction = up;
		else if (!gameOver(x%COLS, (y+1)%ROWS)) snake[0].direction = down;
	}
	

	for (var i = 0; i < COLS; i++) {
		for (var j = 0; j < COLS; j++) {
			if (at(MARKED, i, j)) grid.set(EMPTY, i, j);
		}
	}

	snake[0].last.x = newPosition(SNAKE, snake[0].direction, x, y).x;
	snake[0].last.y = newPosition(SNAKE, snake[0].direction, x, y).y;
}

function canGo(x, y){
	if (x > COLS - 1) { 
		return !gameOver(0, y);
	} else if (x < 0) { 
		return !gameOver(COLS-1, y);
	} else if (y > ROWS - 1) {
		return !gameOver(x, 0);
	} else if (y < 0) { 
		return !gameOver(x, ROWS-1);
	}

	if (gameOver(x, y) || at(MARKED, x, y) || at(CLONE, x, y) || at(MISSILE, x, y)) {
		return false;
	}

	if (at(WALL, x, y)) { 
		return true;
	}

	if (at(EMPTY, x, y)) grid.set(MARKED, x, y);

	return (canGo(x-1, y) || canGo(x+1, y) || canGo(x, y-1) || canGo(x, y+1))
}