function moveSnake(){
	//set direction
	if ((keystate[larrow]) && snake[0].direction != right) snake[0].direction = left;
	else if ((keystate[rarrow]) && snake[0].direction != left) snake[0].direction = right;
	else if ((keystate[uarrow]) && snake[0].direction != down) snake[0].direction = up;
	else if ((keystate[darrow]) && snake[0].direction != up) snake[0].direction = down;

	snake[0].last.x = newPosition(CLONE, snake[0].direction, snake[0].last.x, snake[0].last.y).x
	snake[0].last.y = newPosition(CLONE, snake[0].direction, snake[0].last.x, snake[0].last.y).y
}