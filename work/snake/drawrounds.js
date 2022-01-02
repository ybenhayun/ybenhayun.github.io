function draw() {
	resetBoard();
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height)


	ctx.beginPath();
	for(var x = 0; x < canvas.width; x += tw) {
		ctx.moveTo(x, 0);
		ctx.lineTo(x, canvas.height);
	}
	for(var y = 0; y < canvas.height; y += th) {
		ctx.moveTo(0, y);
		ctx.lineTo(canvas.width, y);
	}
	ctx.strokeStyle = "#ededed";
	ctx.stroke();

	for (var x = 0; x < grid.width; x++) {
		for (var y = 0; y < grid.height; y++) {
			if (at(WALL, x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (at(EMPTY, x, y)) ctx.fillStyle = "white";
			else if (at(HEAD, x, y)) ctx.fillStyle = "red";
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
			else if (at(BOMB, x, y)) { 
				var index = bombs.findIndex(cell => cell.x === x && cell.y === y);
				if (flash && bombs[index].life%100 > 50 && bombs[index].life%100 < 99) ctx.fillStyle = "white";
				else if (redbombs) ctx.fillStyle = "red";
				else ctx.fillStyle = "black";
			} else if (at(SNAKE, x, y) || at(MISSILE, x, y)) ctx.fillStyle = "orange";
			else if (clone) {
				if (at(CLONEHEAD, x, y)) ctx.fillStyle = "black";
				else if (at(CLONE, x, y)) ctx.fillStyle = "gray";
			}

			if (at(WALL, x, y)) ctx.fillRect(x*tw, y*th, tw, th);
			else if ((!at(SNAKE, x, y) && !at(CLONE, x, y))) {
                ctx.beginPath();
                ctx.arc((1+2*x)*tw/2, (1+2*y)*th/2, tw/2-1, 0, 2 * Math.PI);
                ctx.fill();            
            }
			else if (at(SNAKE, x, y) && !at(HEAD, x, y)) drawSnakes(x , y, tw, th, 0);
			else if (at(CLONE, x, y) && !at(HEAD, x, y)) drawSnakes(x, y, th, tw, 1);
		}
	}

	ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc((1+2*snake[0].head.x)*tw/2, (1+2*snake[0].head.y)*th/2, tw/2-1, 0, 2 * Math.PI);
    ctx.fill();
}

function drawSnakes(x, y, tw, th, i) {
    var index = snake[i].body.findIndex(cell => cell.x === x && cell.y === y)
	var sx = snake[i].body[index].x, sy = snake[i].body[index].y;		//current body cell
	var nx = snake[i].body[index-1].x, ny = snake[i].body[index-1].y;  //body cell closer to head

	ctx.beginPath();
	ctx.arc((1+2*x)*tw/2, (1+2*y)*th/2, tw/2-1, 0, 2 * Math.PI);
	ctx.fill();
	
	if (sx == nx) {
		if ((sy - ny == 1) || (ny - sy > 1)) ctx.fillRect(x*tw+1, y*th, tw-2, th/2);       //head up
		else if ((ny - sy == 1) || (sy - ny > 1)) ctx.fillRect(x*tw+1, y*th+th/2, tw-2, th/2);  //head down
	} else if (sy == ny) {
		if ((sx - nx == 1) || (nx - sx > 1)) ctx.fillRect(x*tw, y*th+1, tw/2, th-2);       //head on left
		else if ((nx - sx == 1) || (sx - nx > 1)) ctx.fillRect(x*tw+th/2, y*th+1, tw/2, th-2);  //head on right
	} 

	if (sx == snake[i].tail.x && sy == snake[i].tail.y) return;
	else var bx = snake[i].body[index+1].x, by = snake[i].body[index+1].y

	if (sx == bx) {
		if ((sy - by == 1) || (by - sy > 1)) ctx.fillRect(x*tw+1, y*th, tw-2, th/2);       //tail up
		else if ((by - sy == 1) || (sy - by > 1)) ctx.fillRect(x*tw+1, y*th+th/2, tw-2, th/2);  //tail down
	} else if (sy == by) {
		if ((sx - bx == 1) || (bx - sx > 1)) ctx.fillRect(x*tw, y*th+1, tw/2, th-2);       //tail on left
		else if ((bx - sx == 1) || (sx - bx > 1)) ctx.fillRect(x*tw+th/2, y*th+1, tw/2, th-2);  //tail on right
	} 
}