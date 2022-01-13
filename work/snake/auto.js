const PATH = 10;

function moveSnake() {
	snakespeed = 1; //speed up snake for snakebot
	sx = snake[0].head.x;
	sy = snake[0].head.y;
	sd = snake[0].direction;
	fx = fruit[0].x;
	fy = fruit[0].y;

	var l = canGo(next(sx, left), sy, true);
	var r = canGo(next(sx, right), sy, true);
	var u = canGo(sx, next(sy, up), true);
	var dw = canGo(sx, next(sy, down), true);
	
	arry = [l, r, u, dw];

	if (arry.filter(Number).length > 0) {
		if (emptycells.length >= ROWS*COLS*.10) var spaces = Math.min.apply(Math, arry.filter(Number));
		else var spaces = Math.max.apply(Math, arry.filter(Number));

		if (spaces == l) sd = left;
		else if (spaces == r) sd = right;
		else if (spaces == u) sd = up;
		else if (spaces == dw) sd = down;
	} else {
		var l = canGo(next(sx, left), sy, false);
		var r = canGo(next(sx, right), sy, false);
		var u = canGo(sx, next(sy, up), false);
		var dw = canGo(sx, next(sy, down), false);

		arry = [l, r, u, dw];
		var spaces = Math.max.apply(Math, arry.filter(Number));

		if (spaces == l) sd = left;
		else if (spaces == r) sd = right;
		else if (spaces == u) sd = up;
		else if (spaces == dw) sd = down;
		else {
			console.log('dying');
			sd = getBestDir();
		}
	}

	snake[0].direction = sd;
	snake[0].head.x = newPosition(SNAKE, snake[0].direction, sx, sy).x;
	snake[0].head.y = newPosition(SNAKE, snake[0].direction, sx, sy).y;
}

function getBestDir() {
	var newgrid = new Array(grid.width);

	for (var i = 0; i < newgrid.length; i++) {
  		newgrid[i] = new Array(grid.height);
	}

	var l = longestPath(next(sx, left), sy, newgrid, 1);
	var r = longestPath(next(sx, right), sy, newgrid, 1);
	var u = longestPath(sx, next(sy, up), newgrid, 1);
	var dw = longestPath(sx, next(sy, down), newgrid, 1);

	var max = Math.max(l, r, u ,dw);

	if (max == l) return left;
	if (max == r) return right;
	if (max == u) return up;
	if (max == dw) return down;
}

function longestPath(x, y, board) {
	if (gameOver(x, y)) return 0;

	let newgrid = JSON.parse(JSON.stringify(board));
	newgrid[x][y] = MARKED;

	var stack = [{x:x, y:y}];
    var path = [];
    var longPath = [];

    while (stack.length) {
        var curr = stack.pop();
		newgrid[curr.x][curr.y] = MARKED;

        if (curr !== path[path.length - 1]) path.push(curr);

		var neighbors = exploreLocation(curr);
		var i = 0;

		if (neighbors.length) {
			for (neighbor of neighbors) {
				if(newgrid[neighbor.x][neighbor.y]  != MARKED) {
    				stack.push(neighbor);
  				} else i++;
			}
		} 
		if (i == neighbors.length) {
			if (path.length > longPath.length) {
                longPath.length = [];
                for (var i = 0; i < path.length; i++) {
                    longPath.push(path[i]);
                }
            }
            path.pop();
            if (path.length) stack.push(path[path.length - 1]);
		}
    }

    return longPath.length;
}

function next(p, dir) {
	if (dir == right) {
		p++;
		if (p > wall(right)) return wall(left);
	} else if (dir == left) {
		p--;
		if (p < wall(left)) return wall(right);
	} else if (dir == down) {
		p++;
		if (p > wall(down)) return wall(up);
	} else if (dir == up) { 
		p--;
		if (p < wall(up)) return wall(down);
	}

	return p;
}

function exploreLocation(location) {
	let x = location.x;
	let y = location.y;
	let allNeighbors = [];

	outer:
	if (portal && at(FRUIT, x, y)) {
		for (var i = wall(left); i < wall(right); i++) {
			for (var j = wall(up); j < wall(down); j++) {
				if (at(FRUIT, i, j) && (i != x || j != y)) {
					x = i;
					y = j;
					break outer;
				}
			}
		}
	}

	if (!gameOver(x, next(y, up))) allNeighbors.push({ x: x, y: next(y, up) });
	if (!gameOver(x, next(y, down))) allNeighbors.push({ x: x, y: next(y, down) });
	if (!gameOver(next(x, left), y)) allNeighbors.push({ x: next(x, left), y: y });
	if (!gameOver(next(x, right), y)) allNeighbors.push({ x: next(x, right), y: y });
	
	return allNeighbors;
}
	
function canGo(x, y, getfruit) {
	if (gameOver(x, y)) return false;

	var dist = 1;
	var start = {x:x, y:y};
	var newgrid = new Array(grid.width);

	for (var i = 0; i < newgrid.length; i++) {
		newgrid[i] = new Array(grid.height);
		for (var j = 0; j < newgrid[i].length; j++) {
			newgrid[i][j] = [{value:null, parent:null}];
		}
	}

	if (getfruit) {
		dist = toAndFrom(start, "fruit", newgrid);
		if (dist == 0) return false;
	}

	var to_tail = toAndFrom(start, "tail", newgrid);

	if (to_tail) {
		if (getfruit) return dist;
		return to_tail;
	}
	return false;
}


function toAndFrom(start, end, board) {
	var space = 1;

	var queue = [];
	queue.push(start);
		
	while (queue.length) {
		var current = queue.shift();
		board[current.x][current.y].value = MARKED;

		if ((at(FRUIT, current.x, current.y) && end == "fruit") ||
			(((current.x == next(snake[0].body.at(-1).x, left) && current.y == snake[0].body.at(-1).y) || (current.x == next(snake[0].body.at(-1).x, right) && current.y == snake[0].body.at(-1).y) 
			|| (current.x == snake[0].body.at(-1).x && current.y == next(snake[0].body.at(-1).y, up)) || (current.x == snake[0].body.at(-1).x && current.y == next(snake[0].body.at(-1).y, down))) && end == "tail"))  {
				
			for (var i = 0; i < board.length; i++) {
			  	for (var j = 0; j < board[i].length; j++) {
				  	if (board[i][j].value != PATH) board[i][j].value = null;
			 	}
			}

			var nx = current.x;
			var ny = current.y;
			while (nx != start.x || ny != start.y) {
				board[nx][ny].value = PATH;
				space++;
				var p = board[nx][ny].parent;
				nx = p.x;
				ny = p.y;
			} 
			board[nx][ny].value = PATH;

			start.x = current.x;
			start.y = current.y;

			return space;
		}

		var neighbors = exploreLocation(current);

		for(neighbor of neighbors) {
  			if(board[neighbor.x][neighbor.y].value == null) {
    			if (queue.findIndex(item => item.x === neighbor.x && item.y === neighbor.y) == -1) { 
					queue.push(neighbor);
					board[neighbor.x][neighbor.y].parent = current;
				}
  			} 
		}
	}

	return false;
}

function bombsNearby(x, y, time) {
	var spaces = 0;

	for (var i = frames+1; i <= frames+1+time; i++) {
		if (frog && (i+2)%5 == 0 && i%100 > 30 && i%100 < 60) spaces++; 
		else if ((i+2)%20 == 0) spaces++;
	}

	var clonebombs = JSON.parse(JSON.stringify(bombs));

	for (var i = 0; i < clonebombs.length; i++) {
		for (var j = 0; j < spaces; j++) {
			if (clonebombs[i].direction == left) {
				clonebombs[i].x--;
			} else if (clonebombs[i].direction == right) { 
				clonebombs[i].x++;
			} else if (clonebombs[i].direction == up) { 
				clonebombs[i].y--;
			} else { 
				clonebombs[i].y++;
			} 

			if (clonebombs[i].x > wall(right)) clonebombs[i].x = wall(left);
			else if (clonebombs[i].x < wall(left))  clonebombs[i].x = wall(right);
			else if (clonebombs[i].y > wall(down)) clonebombs[i].y = wall(up);
			else if (clonebombs[i].y < wall(up)) clonebombs[i].y = wall(down);
		}

		if (x == clonebombs[i].x && y == clonebombs[i].y) return true;
	}

	return false;
}