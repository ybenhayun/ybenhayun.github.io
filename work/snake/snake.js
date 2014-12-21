var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;
var a = 65, d = 68, s = 83, w = 87, p = 80;
var canvas, ctx, keystate, frames, score, timer, taken, board;
var gametype, gamecounter = 0, growth_rate;
var hx, hy, fx, fy, reset, bomb_reset;

grid = {
	width: null, 
	height: null,
	_grid: null, 

	init: function(d, c, r) {
		this.width = c;
		this.height = r;
		this._grid = [];

		for (var x=0; x < c; x++) {
			this._grid.push([]);
			for (var y=0; y < r; y++) {
				this._grid[x].push(d);
			}
		}
	},

	set: function(val, x, y) {
		this._grid[x][y] = val;
	},

	get: function(x, y) {
		return this._grid[x][y];
	}
}

snake = {
	direction: null,
	last: null,		
	_queue: null,	

	init: function(d, x, y) {
		this.direction = d;
		this._queue = [];
		this.insert(x, y);
	},

	insert: function(x, y) {
		// unshift prepends an element to an array
		this._queue.unshift({x:x, y:y});
		this.last = this._queue[0];
	},
	remove: function() {
		return this._queue.pop();
	}
};

function set(value) {
	var empty = [];
	var i = 0;
	if (gametype == "walled") i++;
	for (var x=grid.width-COLS+i; x < COLS-i; x++) {
		for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
			if (grid.get(x, y) == EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	grid.set(value, randpos.x, randpos.y);
	fx = randpos.x;
	fy = randpos.y;
	timer = 500;
}

function main() {
	//localStorage.clear() //resets high scores
	canvas = document.getElementById("grid");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);
	ctx.font = "12px Helvetica";

	frames = 0;
	keystate = {};
	document.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete keystate[evt.keyCode];
	});
	init();
	loop();
}

function init() {
	score = 0;
	taken = 0;
	growth_rate = 2;
	COLS = 26, ROWS = 26;
	if (localStorage.getItem(gametype) == null) 
		localStorage.setItem(gametype, 0);
	grid.init(EMPTY, COLS, ROWS);

	var sp = {x:0, y:Math.floor(COLS/2)};
	snake.init(right, sp.x, sp.y);
	for (var i = 0; i < 3; i++){
		grid.set(SNAKE, sp.x, sp.y);
		snake.insert(sp.x, sp.y);	
	}
	snake_length = 4;
	gamecounter++;
	reset = false;
	bomb_reset = false;
	set(FRUIT);
}

function loop() {
	update();
	draw();
	
	globalID = window.requestAnimationFrame(loop, canvas);
}

function update() {
	frames++;

	if (frames%4 == 0 && gametype == "mover"){
		if (reset == true) { 
			grid.set(SNAKE, fx, fy);
			reset = false;
		} else grid.set(EMPTY, fx, fy);

		if (bomb_reset == true) { 
			grid.set(BOMB, fx, fy);
			bomb_reset = false;
		}
		var fruit_direction = taken;
		
		if (fruit_direction%4 == 0) { 
			fx--;
			if (fx == grid.width-COLS-1) fx = COLS-1;
		}
		else if (fruit_direction%3 == 0) { 
			fy--;
			if (fy == grid.height-ROWS-1) fy = ROWS-1;
		}
		else if (fruit_direction%2 == 0) { 
			fx++;
			if (fx == COLS) fx = grid.width-COLS;
		}
		else { 
			fy++;
			if (fy == ROWS) fy = grid.height-ROWS;
		}



		if (grid.get(fx, fy) == SNAKE) 
			reset = true;
		if (grid.get(fx, fy) == BOMB) bomb_reset = true;
		if (fx == snake._queue[snake_length-1].x && fy == snake._queue[snake_length-1].y)
			reset = false;	
		if (fx == snake._queue[snake_length-2].x && fy == snake._queue[snake_length-2].y)
			reset = false;
		if (atHead(fx, fy)) { collectedFruit(fx, fy); reset = false; }
		grid.set(FRUIT, fx, fy);
	}		

	if (frames%5 == 0){
		var nx = snake.last.x;
		var ny = snake.last.y;

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
			if (grid.get(COLS-1, ny) == SNAKE) return init();
			nx = COLS-1;
		} else if (nx > COLS-1) {
			if (grid.get(grid.width-COLS, ny) == SNAKE) return init();
			nx = grid.width-COLS;
		} else if (ny < grid.height-ROWS) {
			if (grid.get(nx, ROWS-1) == SNAKE) return init();
			ny = ROWS-1;
		} else if (ny > ROWS-1) {
			if (grid.get(nx, grid.height-ROWS) == SNAKE) return init();
			ny = grid.height-ROWS;
		} else if (gameOver(nx, ny)) {
			reset = false;
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

function collectedFruit(x, y){document.getElementById("fruitsound").play();
	score+=timer;
	taken++;

			//uncomment for walled snake
	if (gametype == "walled" && taken%4 == 0){
		for (i = 0; i < ROWS; i++){
			grid.set(WALL, COLS-1, i);
			grid.set(WALL, i, COLS-1);
			grid.set(WALL, (taken/4)-1, ROWS-i-1);
			grid.set(WALL, ROWS-i-1, (taken/4)-1);
		}
		ROWS--;
		COLS--;
	}

	set(FRUIT);
	if (gametype == "infinity") { set(FRUIT); set(FRUIT); }
	/*set(BOMB);
	set(BOMB); */
	var tail = {x:x, y:y};
	for (var i = 0; i < growth_rate; i++){			
		grid.set(SNAKE, tail.x, tail.y);
		snake.insert(tail.x, tail.y);
	} 
	snake_length+=growth_rate;

	if (gametype == "bombs" || gametype == "invisibombs" || gametype == "mover")
		grid.set(BOMB, tail.x, tail.y);//uncomment for bombs

	if (score > localStorage.getItem(gametype))
		localStorage.setItem(gametype, score);
}

function gameOver(x, y){
	if (grid.get(x,y) == SNAKE) return true;
	if (grid.get(x,y) == BOMB) return true;
	return false;
}

function atFruit(x, y){
	return grid.get(x, y) == FRUIT;
}

function atSnake(x, y){
	return grid.get(x, y) == SNAKE;
}

function isEmpty(x, y){
	return grid.get(x, y) == EMPTY;
}

function atBomb(x, y){
	return grid.get(x, y) == BOMB;
}

function atHead(x ,y){
	return (x == hx && y == hy);
}

function atWall(x, y){
	return grid.get(x, y) == WALL;
}
function draw() {
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (isEmpty(x, y)) ctx.fillStyle = "#fff";
			else if (atHead(x, y)) ctx.fillStyle = "#f00";
			else if (atFruit(x, y)) ctx.fillStyle = "#f00";
			else if (atBomb(x, y)) {
				if (gametype == "invisibombs")
					ctx.fillStyle = "#f00";
				else ctx.fillStyle = "#000";
			} 
			else if (atSnake(x, y)) ctx.fillStyle = "#0f0";
			else if (atWall(x ,y)) ctx.fillStyle = "#2b2b2b";

			ctx.fillRect(x*tw, y*th, tw, th);
		}
	}

	if (timer > 0)
		timer--;
	document.getElementById("score").innerHTML = "<span>";
	document.getElementById("score").innerHTML += "<br>Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!</span>";
	document.getElementById("score").innerHTML += "<br><br>HIGH SCORE: " + localStorage.getItem(gametype);
	document.getElementById("score").innerHTML += "<br> CURRENT SCORE: " + score;
	document.getElementById("score").innerHTML += "<br> FRUIT TAKEN: " + taken;
	document.getElementById("score").innerHTML += "<br> FRUIT VALUE: " + timer;
}

function setGame(game){
	gametype = game;
	if (gamecounter == 0) main();
	else init();
}