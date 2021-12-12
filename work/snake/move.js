function moveSnake(){
	//set direction
	if ((keystate[larrow]) && snake.direction != right) snake.direction = left;
	else if ((keystate[rarrow]) && snake.direction != left) snake.direction = right;
	else if ((keystate[uarrow]) && snake.direction != down) snake.direction = up;
	else if ((keystate[darrow]) && snake.direction != up) snake.direction = down;

	//set movmement
	if (snake.direction == left) nx--;
	else if (snake.direction == up) ny--;
	else if (snake.direction == right) nx++;
	else if (snake.direction == down) ny++;

	//go through walls
	if (nx < grid.width-COLS) nx = COLS-1;
	else if (nx > COLS-1) nx = grid.width-COLS;
	else if (ny < grid.height-ROWS) ny = ROWS-1;
	else if (ny > ROWS-1) ny = grid.height-ROWS;
}