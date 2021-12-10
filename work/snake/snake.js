//WORK PLEASE

var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5, MISSILE = 6;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow, uarrow, rarrow, darrow;
var a, d, s, w;
var canvas, ctx, keystate, frames, score, timer, taken, board;
var gametype, gamecounter = 0, growth_rate, paused;
var hx, hy, nx, ny, reset, bomb_reset, bombs, fruit, fruit_reset;
var flash;
var bombcount;

let bomblist = new Array();

grid = {
	width: null, 
	height: null,
	pos: null, 

	init: function(d, c, r) {
		this.width = c;
		this.height = r;
		this.pos = [];

		for (var x=0; x < c; x++) {
			this.pos.push([]);
			for (var y=0; y < r; y++) {
				this.pos[x].push(d);
			}
		}
	},

	set: function(val, x, y) {
		this.pos[x][y] = val;
	},

	get: function(x, y) {
		return this.pos[x][y];
	}
}

snake = {
	direction: null,
	last: null,		
	s_body: null,	

	init: function(d, x, y) {
		this.direction = d;
		this.s_body = [];
		this.insert(x, y);
	},

	insert: function(x, y) {
		// unshift prepends an element to an array
		this.s_body.unshift({x:x, y:y});
		this.last = this.s_body[0];
	},
	remove: function() {
		return this.s_body.pop();
	}
};

function set(value) {
	var empty = [];
	var i = 0;
	if (gametype == "walled") i++;
	if (value == BOMB){
		for (var x=grid.width-COLS+i; x < COLS-i; x++) {
			for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
				if (grid.get(x, y) == EMPTY && x != nx && y != ny) {
					empty.push({x:x, y:y});
				}
			}
		}
	}
	if (value == FRUIT) {
		for (var x=grid.width-COLS+i; x < COLS-i; x++) {
			for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
				if (grid.get(x, y) == EMPTY) {
					empty.push({x:x, y:y});
				}
			}
		}
	}

	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	grid.set(value, randpos.x, randpos.y);
	if (value == FRUIT) fruit = {x:randpos.x, y:randpos.y};
}

function main() {
	//localStorage.clear() //resets high scores
	canvas = document.getElementById("grid");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);

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
	timer = 250;
	bombcount = 0;
	//bomblist = new Array();

	growth_rate = 2;
	flash = false;
	COLS = 26, ROWS = 26;
	larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;
	a = 65, d = 68, s = 83, w = 87;

	if (localStorage.getItem(gametype+location.pathname) == null) 
		localStorage.setItem(gametype+location.pathname, 0);
	if (localStorage.getItem(gametype+location.pathname+'fruit') == null)
		localStorage.setItem(gametype+location.pathname+'fruit', 0);
	grid.init(EMPTY, COLS, ROWS);

	var sp = {x:ROWS-1, y:Math.floor(COLS/2)};
	snake.init(right, sp.x, sp.y);
	for (var i = 0; i < 3; i++){
		grid.set(SNAKE, sp.x, sp.y);
		snake.insert(sp.x, sp.y);	
	}
	grid.set(EMPTY, ROWS-1, sp.y);
	snake_length = 4;
	gamecounter++;
	reset = false;
	bomb_reset = false;
	if (gametype == "mover"||gametype == "dodge"||gametype == "invisibombs"||gametype == "bombs"||gametype == "flash"||gametype=="disoriented" || gametype == "nogod")
		bombs = true;
	else bombs = false;
	if (gametype == "portal"||gametype == "tick") set(FRUIT);
	set(FRUIT);
}

function loop() {
	draw();

	update();

	globalID = window.requestAnimationFrame(loop, canvas);
}
/*
function update() {
	frames++;

	if ((frames%4 == 0 && gametype == "mover")||((gametype == "disoriented" || gametype == "nogod") && frames%8 ==0)){
		moveFruit();
	}		

	if (frames%20 == 0 && (gametype == "dodge" || gametype=="disoriented" || gametype == "nogod"))
		moveBombs();

	if (frames%5 == 0 && (gametype == "missiles" || gametype == "nogod")) 
		moveMissiles();

	if (frames%1 == 0){
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
*/

function collectedFruit(x, y){
	document.getElementById("fruitsound").pause();
	document.getElementById("fruitsound").currentTime = 0;
	document.getElementById("fruitsound").play();
	score+=Math.floor(timer);
	timer = 250;
	taken++;

			//uncomment for walled snake
	if (gametype == "walled" && taken%4 == 0){
		for (var i = 0; i < ROWS; i++){
			grid.set(WALL, (taken/4)-1, i);
			grid.set(WALL, COLS-1, i);
		}
		for (var i = 0; i < COLS; i++){
			grid.set(WALL, i, (taken/4)-1);
			grid.set(WALL, i, ROWS-1);
		}
		ROWS--;
		COLS--;
	}

	if (gametype == "infinity") { set(FRUIT); set(FRUIT); }

	var tail = {x:x, y:y};

	for (var i = 0; i < growth_rate; i++){			
		grid.set(SNAKE, tail.x, tail.y);
		snake.insert(tail.x, tail.y);
	} 

	snake_length+=growth_rate;

	if (gametype == "portal"){
		for (var i = 0; i < COLS; i++){
			for(var j = 0; j < ROWS; j++){
				if (grid.get(i, j) == FRUIT){
					grid.set(SNAKE, i, j);
					snake.last.x = i;
					snake.last.y = j;
					hx = i; hy = j;
					break;
				}
			}
		}
	}
	if (bombs) {
		grid.set(BOMB, tail.x, tail.y);
		bombcount++;

		let newlist = new Array(bombcount*3);
		for (var i = 0; i < bomblist.length; i++) {
			newlist[i] = bomblist[i];
		}

		bomblist = newlist;						//increasing list length

		bomblist[bombcount*3-1] = (snake.direction+2)%4 //sets bomb direction
		bomblist[bombcount*3-2] = tail.y //sets y value for bomb
		bomblist[bombcount*3-3] = tail.x //sets x value for bomb 
	}

	if (score > localStorage.getItem(gametype+location.pathname))
		localStorage.setItem(gametype+location.pathname, score);
	if (taken > localStorage.getItem(gametype+location.pathname+'fruit'))
		localStorage.setItem(gametype+location.pathname+'fruit', taken);

	console.log(location.pathname); //hellooi

	if (gametype == "portal") set(FRUIT);
	set(FRUIT);

}

function gameOver(x, y){
	if (x < 0) x = COLS-1;
	if (y < 0) y = ROWS-1;
	if (x >= COLS) x = 0;
	if (y >= ROWS) y = 0;

	if (grid.get(x,y) == SNAKE || grid.get(x,y) == BOMB) return true;

	return false;
}

function stopPause() {
		clearInterval(paused);
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

function atMissile(x, y){
	return grid.get(x, y) == MISSILE;
}

function draw() {
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	if (frames%50 == 0 && gametype == "flash") flash = !flash; 
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (atWall(x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (isEmpty(x, y)) ctx.fillStyle = "#fff";
			else if (atHead(x, y)) ctx.fillStyle = "#f00";
			else if (atFruit(x, y)) ctx.fillStyle = "#f00";
			else if (atBomb(x, y)) {
				if (gametype == "invisibombs" || gametype == "disoriented" || gametype == "nogod")
					ctx.fillStyle = "#f00";
				else if (flash)
					ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} 
			else if (atSnake(x, y) || atMissile(x, y)) ctx.fillStyle = "orange";

			ctx.fillRect(x*tw, y*th, tw, th);
			//ctx.rect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (timer > 50) timer-=.5;

	if (gametype == "tick" && timer%43 == 0) set(BOMB);

	if ((gametype == "missiles" || gametype == "nogod") && frames%20 == 0) setMissiles();

	document.getElementById("inst").innerHTML = "<span id = 'inst'>";
	document.getElementById("inst").innerHTML += "Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!</span>";
	document.getElementById("inst").innerHTML += "<br><br><br> CURRENT SCORE: " + score;
	document.getElementById("inst").innerHTML += "<br> FRUIT TAKEN: " + taken;
	document.getElementById("inst").innerHTML += "<br> FRUIT VALUE: " + Math.floor(timer);
	document.getElementById("inst").innerHTML += "<br><br><br>HIGH SCORE: " + localStorage.getItem(gametype+location.pathname);
	document.getElementById("inst").innerHTML += "<br>MOST FRUIT: " + localStorage.getItem(gametype+location.pathname+'fruit') + "</span>";
	document.getElementById("inst").innerHTML += "<br>SNAKE LENGTH: " + snake_length + " pieces long";
}

function setMissiles () {
	var empty = [];

	for (var y = 0; y < ROWS; y++) {
		if (grid.get(0, y) == EMPTY) {
			empty.push({y:y});
		}
	}

	if (empty == []) return;

	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	grid.set(MISSILE, 0, randpos.y);
}

function moveMissiles () {
	var missiles = []

	for (var x = 0; x < COLS; x++) {
		for (var y = 0; y < ROWS; y++) {
			if (atMissile(x, y)) {
				grid.set(EMPTY, x, y);
				missiles.push({x:x, y:y});
			}
		}
	}

	for (var i = 0; i < missiles.length; i++) {
		if (missiles[i].x < COLS-1) {
			missiles[i].x++;
			if (atSnake(missiles[i].x, missiles[i].y) || atHead(missiles[i].x, missiles[i].y)) {
				document.getElementById("fruitsound").pause();
				document.getElementById("fruitsound").currentTime = 0;
				document.getElementById("fruitsound").play();

				grid.set(SNAKE, snake.last.x, snake.last.y);
				snake.insert(snake.last.x, snake.last.y);
				snake_length++;

				missiles.splice(i, 0);

			} else {
				if (atFruit(missiles[i].x, missiles[i].y)) { 
					set(FRUIT);
					missiles.push({x:missiles[i].x, y:missiles[i].y});
				}
				grid.set(MISSILE, missiles[i].x, missiles[i].y);
			}
		}
	} 	
}

function moveBombs(){
	for (var i = 1; i <= bombcount; i++) {

		grid.set(EMPTY, bomblist[i*3-3], bomblist[i*3-2]);

		if (bomblist[i*3-1] == left) {
		 	bomblist[i*3-3]--;
		 	if (bomblist[i*3-3] < 0) bomblist[i*3-3] = COLS-1;
		} else if (bomblist[i*3-1] == right) {
		 	bomblist[i*3-3]++;
		 	if (bomblist[i*3-3] >= COLS) bomblist[i*3-3] = 0;
		} else if (bomblist[i*3-1] == up) {
			bomblist[i*3-2]--;
		 	if (bomblist[i*3-2] < 0) bomblist[i*3-2] = ROWS-1;
		} else if (bomblist[i*3-1] == down) {
			bomblist[i*3-2]++;
		 	if (bomblist[i*3-2] >= ROWS) bomblist[i*3-2] = 0;
		}

		if (grid.get(bomblist[i*3-3], bomblist[i*3-2]) == FRUIT) set(FRUIT);

		grid.set(BOMB, bomblist[i*3-3], bomblist[i*3-2]);
	}
}

function moveFruit(){
	if (reset == true) { 
		grid.set(SNAKE, fruit.x, fruit.y);
		reset = false;
	} else grid.set(EMPTY, fruit.x, fruit.y);

	if (bomb_reset == true) { 
		grid.set(BOMB, fruit.x, fruit.y);
		bomb_reset = false;
	}
	if (gametype == "mover") fruit_direction = taken;
	else fruit_direction = Math.floor((Math.random()*15)+1);

	if (fruit_direction%4 == 0) { 
		fruit.x--;
		if (fruit.x == grid.width-COLS-1 && gametype == "mover") fruit.x = COLS-1;
		else if (fruit.x == grid.width-COLS-1) fruit.x++;
	} else if (fruit_direction%3 == 0) { 
		fruit.y--;
		if (fruit.y == grid.height-ROWS-1 && gametype == "mover") fruit.y = ROWS-1;
		else if (fruit.y == grid.height-ROWS-1) fruit.y++;
	} else if (fruit_direction%2 == 0) { 
		fruit.x++;
		if (fruit.x == COLS && gametype == "mover") fruit.x = grid.width-COLS;
		else if (fruit.x == COLS) fruit.x--;
	} else { 
		fruit.y++;
		if (fruit.y == ROWS && gametype == "mover") fruit.y = grid.height-ROWS;
		else if (fruit.y == ROWS) fruit.y--;
	}

	if (grid.get(fruit.x, fruit.y) == SNAKE) 
		reset = true;
	if (grid.get(fruit.x, fruit.y) == BOMB) bomb_reset = true;
	if (fruit.x == snake.s_body[snake_length-1].x && fruit.y == snake.s_body[snake_length-1].y)
		reset = false;	
	if (fruit.x == snake.s_body[snake_length-2].x && fruit.y == snake.s_body[snake_length-2].y)
		reset = false;
	if (atHead(fruit.x, fruit.y)) { collectedFruit(fruit.x, fruit.y); reset = false; }
	grid.set(FRUIT, fruit.x, fruit.y);
}

function setGame(game){
	gametype = game;
	if (gamecounter == 0) main();
	else init();
}
