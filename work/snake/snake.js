var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;
var a = 65, d = 68, s = 83, w = 87;
var canvas, ctx, keystate, frames, score, timer, taken, board;
var booleans = [];
var hx, hy;

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
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (grid.get(x, y) == EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	grid.set(value, randpos.x, randpos.y);
	timer = 500;
}

function main() {
	//localStorage.clear() //resets high scores
	canvas = document.createElement("canvas");
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
	snake_length = 1;
	COLS = 26, ROWS = 26;
	if (localStorage.getItem("highscore") == null) 
		localStorage.setItem("highscore", 0);
	grid.init(EMPTY, COLS, ROWS);

	var sp = {x:Math.floor(COLS/2), y:ROWS-1};
	snake.init(up, sp.x, sp.y);
	grid.set(SNAKE, sp.x, sp.y);
	set(FRUIT);
}

function loop() {
	update();
	draw();

	window.requestAnimationFrame(loop, canvas);
}

function update() {
	frames++;

	if ((keystate[larrow]||keystate[a]) && snake.direction != right)
		snake.direction = left;
	if ((keystate[rarrow]||keystate[d]) && snake.direction != left) 
		snake.direction = right;
	if ((keystate[uarrow]||keystate[w]) && snake.direction != down) 
		snake.direction = up;
	if ((keystate[darrow]||keystate[s]) && snake.direction != up) 
		snake.direction = down;

	if (frames%5 == 0){
		var nx = snake.last.x;
		var ny = snake.last.y;

		if (snake.direction == left) nx--;
		if (snake.direction == up) ny--;
		if (snake.direction == right) nx++;
		if (snake.direction == down) ny++;

		if (nx < grid.width-COLS){
			nx = COLS-1;
		} else if (nx > COLS-1) {
			nx = grid.width-COLS;
		} else if (ny < grid.height-ROWS) {
			ny = ROWS-1;
		} else if (ny > ROWS-1) {
			ny = grid.height-ROWS;
		} else if (gameOver(nx, ny)) {
			return init();
		}

		hx = nx;
		hy = ny;

		if (atFruit(nx, ny)) {
			score+=timer;
			taken++;

			//uncomment for walled snake
			if (walled == true && taken%4 == 0){
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
			/*set(BOMB);
			set(BOMB); */
			var tail = {x:nx, y:ny};
			for (var i = 0; i < 3; i++){			
				grid.set(SNAKE, tail.x, tail.y);
				snake.insert(tail.x, tail.y);
			} 

			if (bombs == true)
				grid.set(BOMB, tail.x, tail.y);//uncomment for bombs

			snake_length+=3;
			if (score > localStorage.getItem("highscore"))
				localStorage.setItem("highscore", score);
		} else {
			var tail = snake.remove();
			if (grid.get(tail.x, tail.y) != BOMB && grid.get(tail.x, tail.y) != WALL)
				grid.set(EMPTY, tail.x, tail.y);  //remove for infinite snake
			tail.x = nx;
			tail.y = ny;
			grid.set(SNAKE, tail.x, tail.y);
			snake.insert(tail.x, tail.y);
		}
	}
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
			if (atSnake(x, y)) ctx.fillStyle = "#0f0";
			if (atFruit(x, y)) ctx.fillStyle = "#f00";
			if (atBomb(x, y)) {
				if (invisibombs == true)
					ctx.fillStyle = "#f00";
				else ctx.fillStyle = "#000";
			}
			if (atHead(x, y)) ctx.fillStyle = "#f00";
			if (atWall(x ,y)) ctx.fillStyle = "blue";
			ctx.fillRect(x*tw, y*th, tw, th);
		}
	}

	if (timer > 0)
		timer--;

	ctx.fillStyle = "green";
	ctx.fillText("HIGH SCORE: " + localStorage.getItem("highscore"), 10, canvas.height-10);
	ctx.fillText("CURRENT SCORE: " + score, 10, canvas.height-30);
	ctx.fillText("FRUIT TAKEN: " + taken, 10, canvas.height-50);
	ctx.fillText("FRUIT VALUE: " + timer, 10, canvas.height-70);
}

function walled() {
	walled = true;
	classic = false;
	bombs = false;
	invisibombs = false;
	main();
}

function classic() {
	classic = true;
	walled = false;
	bombs = false;
	invisibombs = false;
}

function bombs() {
	bombs = true;
	classic = false;
	walled = false;
	invisibombs = false;
	main();
}

function invisibombs() {
	invisibombs = true;
	classic = false;
	walled = false;
	bombs = true;
	main();
}

// start and run the game