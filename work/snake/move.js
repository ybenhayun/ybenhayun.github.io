function moveSnake(){
	if ((keystate[larrow]||keystate[a]) && snake.direction != right){
		snake.direction = left;
	} else if ((keystate[rarrow]||keystate[d]) && snake.direction != left){
		snake.direction = right;
	} else if ((keystate[uarrow]||keystate[w]) && snake.direction != down){ 
		snake.direction = up;
	} else if ((keystate[darrow]||keystate[s]) && snake.direction != up) {
		snake.direction = down;
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

	if (frames%5 == 0){
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