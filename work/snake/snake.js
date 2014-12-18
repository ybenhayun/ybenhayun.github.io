var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;
var a = 65, d = 68, s = 83, w = 87;
var canvas, ctx, keystate, frames, score, timer, taken;	 

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

function setFood() {
	var empty = [];
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (grid.get(x, y) === EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	grid.set(FRUIT, randpos.x, randpos.y);
	timer = 500;
}

function main() {
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
	//localStorage.setItem("highscore", score);
	grid.init(EMPTY, COLS, ROWS);
	var sp = {x:Math.floor(COLS/2), y:ROWS-1};
	snake.init(up, sp.x, sp.y);
	grid.set(SNAKE, sp.x, sp.y);
	setFood();
}

function loop() {
	update();
	draw();

	window.requestAnimationFrame(loop, canvas);
}

function update() {
	frames++;

	if ((keystate[larrow]||keystate[a]) && snake.direction != right) snake.direction = left;
	if ((keystate[rarrow]||keystate[d]) && snake.direction != left) snake.direction = right;
	if ((keystate[uarrow]||keystate[w]) && snake.direction != down) snake.direction = up;
	if ((keystate[darrow]||keystate[s]) && snake.direction != up) snake.direction = down;
	if (frames%5 === 0){
		var nx = snake.last.x;
		var ny = snake.last.y;

		if (snake.direction == left) nx--;
		if (snake.direction == up) ny--;
		if (snake.direction == right) nx++;
		if (snake.direction == down) ny++;

		if (gameOver(nx, ny)) {
			return init();
		}

		if (atFruit(nx, ny)) {
			score+=timer;
			taken++;
			setFood(); 
			var tail = {x:nx, y:ny};
			for (var i = 0; i < 4; i++){			
				grid.set(SNAKE, tail.x, tail.y);
				snake.insert(tail.x, tail.y);
			}
			snake_length+=4;
			if (score > localStorage.getItem("highscore"))
				localStorage.setItem("highscore", score);
		} else {
			var tail = snake.remove();
			grid.set(EMPTY, tail.x, tail.y);
			tail.x = nx;
			tail.y = ny;
			grid.set(SNAKE, tail.x, tail.y);
			snake.insert(tail.x, tail.y);
		}
	}
}

function gameOver(x, y){
	if ((x < 0)||(x > grid.width-1)) return true;
	if ((y < 0)||(y > grid.height-1)) return true;
	if (grid.get(x,y) === SNAKE) return true;

	return false;
}

function atFruit(x, y){
	return grid.get(x, y) === FRUIT;
}

function draw() {
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (grid.get(x, y) == EMPTY) ctx.fillStyle = "#fff";
			if (grid.get(x,y) == SNAKE) ctx.fillStyle = "#0ff";
			if (grid.get(x,y) == FRUIT) ctx.fillStyle = "#f00";
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
// start and run the game
main();