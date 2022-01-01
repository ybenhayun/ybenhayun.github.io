function moveSnake(){
	if ((keystate[larrow]) && snake[0].direction != right) snake[0].direction = left;
	else if ((keystate[rarrow]) && snake[0].direction != left) snake[0].direction = right;
	else if ((keystate[uarrow]) && snake[0].direction != down) snake[0].direction = up;
	else if ((keystate[darrow]) && snake[0].direction != up) snake[0].direction = down;

	snake[0].head.x = newPosition(SNAKE, snake[0].direction, snake[0].head.x, snake[0].head.y).x;
	snake[0].head.y = newPosition(SNAKE, snake[0].direction, snake[0].head.x, snake[0].head.y).y;
}