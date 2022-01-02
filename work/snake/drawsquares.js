function draw() {
	resetBoard();
	tw = canvas.width/grid.width;
	th = canvas.height/grid.height;

	ctx.fillStyle = "#ededed";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var x = 0; x < grid.width; x++) {
		for (var y = 0; y < grid.height; y++) {
            
            if (at(WALL, x, y)) ctx.fillStyle = "#2b2b2b";
            if (at(EMPTY, x, y)) ctx.fillStyle = "white";
            if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
            if (at(BOMB, x, y)) ctx.fillStyle = (flash && flashTime(x, y)) ? ("white") : ((redbombs) ? ("red") : ("black"));
            if (at(SNAKE, x, y)) ctx.fillStyle = (at(HEAD, x, y)) ? ("red") : ("orange"); 
            if (at(MISSILE, x, y)) ctx.fillStyle = "orange";
            if (at(CLONE, x, y)) ctx.fillStyle = (at(CLONEHEAD, x, y)) ? ("black") : ("gray");
            
			if (at(WALL, x, y)) ctx.fillRect(x*tw, y*th, tw, th);
			else if ((!at(SNAKE, x, y) && !at(CLONE, x, y)) || at(HEAD, x, y) || at(CLONEHEAD, x, y)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
			else if (at(SNAKE, x, y) || at(CLONE, x, y)) drawSnakes(x , y, 0+at(CLONE, x, y)); //if at(clone) return true, itll draw a clone, otherwise a snake            
		}
	}
}

function flashTime(x, y) {
    return bombs[bombs.findIndex(b => b.x === x && b.y === y)].life%100 > 50 && bombs[bombs.findIndex(b => b.x === x && b.y === y)].life%100 < 99;
}

function drawSnakes(x, y, i) {
	var index = snake[i].body.findIndex(cell => cell.x === x && cell.y === y)
	var sx = snake[i].body[index].x, sy = snake[i].body[index].y;
	var nx = snake[i].body[index-1].x, ny = snake[i].body[index-1].y;

	if (sx == nx) {
		if ((sy - ny == 1) || (ny - sy > 1)) ctx.fillRect(x*tw+1, y*th-1, tw-2, th);
		else if ((ny - sy == 1) || (sy - ny > 1)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th);
	} else if (sy == ny) {
		if ((sx - nx == 1) || (nx - sx > 1)) ctx.fillRect(x*tw-1, y*th+1, tw, th-2);
		else if ((nx - sx == 1) || (sx - nx > 1)) ctx.fillRect(x*tw+1, y*th+1, tw, th-2);
	} else ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
} 