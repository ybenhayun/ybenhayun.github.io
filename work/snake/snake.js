var snakespeed = 5;

var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5, MISSILE = 6, HEAD = 7;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;
var canvas, ctx, keystate, frames, score, fruitvalue, taken, board;
var gametype, gamecounter = 0, paused;
var nx, ny, reset, bomb_reset, bombs, fruit, fruit_reset;
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

function set(value, a, b) {
	if (a == -1 || b == -1) { //place at a random spot
		var empty = [];
		var i = 0;
		if (isGame("walled")) i++;   //don't place fruit on edge of map during walled
	
		for (var x=grid.width-COLS+i; x < COLS-i; x++) {
			for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
				if (at(EMPTY, x, y) && x != nx && y != ny) {
					empty.push({x:x, y:y});
				}
			}
		}
	
		var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
		a = randpos.x; b = randpos.y;
	}

	if (value == FRUIT) fruit = {x:a, y:b};
	grid.set(value, a, b);
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
	fruitvalue = 250;
	bombcount = 0;

	flash = false;
	COLS = 26, ROWS = 26;
	larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;

	if (localStorage.getItem(gametype+location.pathname) == null) { //set scores to 0 if not yet played
		localStorage.setItem(gametype+location.pathname, 0);
		localStorage.setItem(gametype+location.pathname+'fruit', 0);
	}

	grid.init(EMPTY, COLS, ROWS);

	var sp = {x:ROWS-1, y:Math.floor(COLS/2)};
	snake.init(right, sp.x, sp.y);
	for (var i = 0; i < 3; i++){
		set(SNAKE, sp.x, sp.y);
		snake.insert(sp.x, sp.y);	
	}
	set(EMPTY, ROWS-1, sp.y);

	snake_length = 4;
	gamecounter++;

	reset = false;
	bomb_reset = false;

	if (isGame(["mover", "dodge", "bombs", "invis", "flash", "disoriented", "nogod"]))
		bombs = true;
	else bombs = false;

	if (isGame(["portal", "tick"])) set(FRUIT, -1, -1);
	set(FRUIT, -1, -1);
}

function loop() {
	draw();

	update();

	globalID = window.requestAnimationFrame(loop, canvas);
}

function update() {
	frames++;

	if ((frames%4 == 0 && isGame("mover"))||((isGame("disoriented") || isGame("nogod")) && frames%8 ==0)){
		moveFruit();
	}		

	if (frames%20 == 0 && (isGame("dodge") || isGame("disoriented") || isGame("nogod")))
		moveBombs();

	if (frames%5 == 0 && (isGame("missiles") || isGame("nogod"))) 
		moveMissiles();

	if (frames%snakespeed == 0){
		nx = snake.last.x;
		ny = snake.last.y;

		moveSnake();
		
		if (gameOver(nx, ny)) {
			reset = false;
			window.alert("sorry");
			return init();
		}

		if (at(FRUIT, nx, ny)) {
			collectedFruit(nx, ny);
		} else {
			var tail = snake.remove();
			if (!at(BOMB, tail.x, tail.y) && !at(WALL, tail.x, tail.y) && !isGame("infinity"))
				set(EMPTY, tail.x, tail.y);  //remove for infinite snake
			tail.x = nx;
			tail.y = ny;
			set(SNAKE, tail.x, tail.y);
			snake.insert(tail.x, tail.y);
		}
	}
}

function collectedFruit(x, y){
	playSound();
	updateScore();
	lengthenSnake({x:x, y:y}, 2);

	if (isGame("walled") && taken%4 == 0) shrinkBoard();
	if (isGame("portal")) teleportSnake();
	if (bombs) plantBombs({x:x, y:y});

	checkHighScores();

	if (isGame("infinity")) { set(FRUIT, -1, -1); set(FRUIT, -1, -1); }
	if (isGame("portal")) set(FRUIT, -1, -1);
	set(FRUIT, -1, -1);

}

function lengthenSnake(tail, growth_rate) {
	for (var i = 0; i < growth_rate; i++){			
		set(SNAKE, tail.x, tail.y);
		snake.insert(tail.x, tail.y);
	} 

	snake_length+=growth_rate;
}

function checkHighScores() {
	if (score > localStorage.getItem(gametype+location.pathname))
		localStorage.setItem(gametype+location.pathname, score);
	if (taken > localStorage.getItem(gametype+location.pathname+'fruit'))
		localStorage.setItem(gametype+location.pathname+'fruit', taken);
}

function shrinkBoard() {
	for (var i = 0; i < ROWS; i++){
		set(WALL, (taken/4)-1, i);
		set(WALL, COLS-1, i);
	}
	for (var i = 0; i < COLS; i++){
		set(WALL, i, (taken/4)-1);
		set(WALL, i, ROWS-1);
	}
	ROWS--;
	COLS--;
}

function playSound() {
	document.getElementById("fruitsound").pause();
	document.getElementById("fruitsound").currentTime = 0;
	document.getElementById("fruitsound").play();
}

function updateScore() {
	score += Math.floor(fruitvalue);
	fruitvalue = 250;
	taken++;
}

function teleportSnake() {
	for (var i = 0; i < COLS; i++){
		for(var j = 0; j < ROWS; j++){
			if (at(FRUIT, i, j)){
				set(SNAKE, i, j);
				snake.last.x = i;
				snake.last.y = j;
				nx = i; ny = j;
				break;
			}
		}
	}
}

function plantBombs(tail) {
	set(BOMB, tail.x, tail.y);
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

function gameOver(x, y){
	if (x < 0) x = COLS-1;
	if (y < 0) y = ROWS-1;
	if (x >= COLS) x = 0;
	if (y >= ROWS) y = 0;

	if (at(SNAKE, x, y) || at(BOMB, x, y)) return true;

	return false;
}

function at(value, x, y) {
	if (value == HEAD) return (x == nx && y == ny);
	return grid.get(x, y) == value;
}

function draw() {
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	if (frames%50 == 0 && isGame("flash")) flash = !flash; //turns bomb visibility on & off

	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (at(WALL, x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (at(EMPTY, x, y)) ctx.fillStyle = "#fff";
			else if (at(HEAD, x, y)) ctx.fillStyle = "#f00";
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f00";
			else if (at(BOMB, x, y)) {
				if (isGame("invis") || isGame("disoriented") || isGame("nogod")) ctx.fillStyle = "#f00";
				else if (flash) ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} 
			else if (at(SNAKE, x, y) || at(MISSILE, x, y)) ctx.fillStyle = "orange";

			ctx.fillRect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (fruitvalue > 50) fruitvalue-=.5;

	if (isGame("tick") && frames%30 == 0 && fruitvalue < 200) set(BOMB, -1, -1);

	if ((isGame("missiles") || isGame("nogod")) && frames%20 == 0) setMissiles();

	document.getElementById("inst").innerHTML = "<span id = 'inst'>";
	document.getElementById("inst").innerHTML += "Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!</span>";
	document.getElementById("inst").innerHTML += "<br><br><br> CURRENT SCORE: " + score;
	document.getElementById("inst").innerHTML += "<br> FRUIT TAKEN: " + taken;
	document.getElementById("inst").innerHTML += "<br> FRUIT VALUE: " + Math.floor(fruitvalue);
	document.getElementById("inst").innerHTML += "<br><br><br>HIGH SCORE: " + localStorage.getItem(gametype+location.pathname);
	document.getElementById("inst").innerHTML += "<br>MOST FRUIT: " + localStorage.getItem(gametype+location.pathname+'fruit') + "</span>";
	document.getElementById("inst").innerHTML += "<br>SNAKE LENGTH: " + snake_length + " pieces long";
}

function setMissiles () {
	var empty = [];

	for (var y = 0; y < ROWS; y++) {
		if (at(EMPTY, 0, y)) {
			empty.push({y:y});
		}
	}

	if (empty == []) return;

	var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
	set(MISSILE, 0, randpos.y);
}

function moveMissiles() {
	var missiles = []

	for (var x = 0; x < COLS; x++) {
		for (var y = 0; y < ROWS; y++) {
			if (at(MISSILE, x, y)) {
				set(EMPTY, x, y);
				missiles.push({x:x, y:y});
			}
		}
	}

	for (var i = 0; i < missiles.length; i++) {
		if (missiles[i].x < COLS-1) {
			missiles[i].x++;
			if (at(SNAKE, missiles[i].x, missiles[i].y) || at(HEAD, missiles[i].x, missiles[i].y)) {
				playSound();
				lengthenSnake({x:snake.last.x, y:snake.last.y}, 1);

				missiles.splice(i, 0);

			} else {
				if (at(FRUIT, missiles[i].x, missiles[i].y)) { 
					set(FRUIT, -1, -1);
					missiles.push({x:missiles[i].x, y:missiles[i].y});
				}
				set(MISSILE, missiles[i].x, missiles[i].y);
			}
		}
	} 	
}

function moveBombs(){
	for (var i = 1; i <= bombcount; i++) {

		set(EMPTY, bomblist[i*3-3], bomblist[i*3-2]);

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

		if (at(FRUIT, bomblist[i*3-3], bomblist[i*3-2])) set(FRUIT, -1, -1);

		set(BOMB, bomblist[i*3-3], bomblist[i*3-2]);
	}
}

function isGame(gamelist) {
	return gamelist.includes(gametype);
}

function moveFruit(){
	if (reset == true) {  //if fruit has gone over snake				
		set(SNAKE, fruit.x, fruit.y);
		reset = false;
	} else set(EMPTY, fruit.x, fruit.y);

	if (bomb_reset == true) { //if fruit has gone over bomb
		set(BOMB, fruit.x, fruit.y);
		bomb_reset = false;
	}

	if (isGame("mover")) fruit_direction = taken;
	else fruit_direction = Math.floor((Math.random()*15)+1);

	if (fruit_direction%4 == 0) { 
		fruit.x--;
		if (fruit.x == grid.width-COLS-1 && isGame("mover")) fruit.x = COLS-1;
		else if (fruit.x == grid.width-COLS-1) fruit.x++;
	} else if (fruit_direction%3 == 0) { 
		fruit.y--;
		if (fruit.y == grid.height-ROWS-1 && isGame("mover")) fruit.y = ROWS-1;
		else if (fruit.y == grid.height-ROWS-1) fruit.y++;
	} else if (fruit_direction%2 == 0) { 
		fruit.x++;
		if (fruit.x == COLS && isGame("mover")) fruit.x = grid.width-COLS;
		else if (fruit.x == COLS) fruit.x--;
	} else { 
		fruit.y++;
		if (fruit.y == ROWS && isGame("mover")) fruit.y = grid.height-ROWS;
		else if (fruit.y == ROWS) fruit.y--;
	}

	if (at(SNAKE, fruit.x, fruit.y)) 
		reset = true;
	if (at(BOMB, fruit.x, fruit.y)) bomb_reset = true;
	if (fruit.x == snake.s_body[snake_length-1].x && fruit.y == snake.s_body[snake_length-1].y)
		reset = false;	
	if (fruit.x == snake.s_body[snake_length-2].x && fruit.y == snake.s_body[snake_length-2].y)
		reset = false;
	if (at(HEAD, fruit.x, fruit.y)) { collectedFruit(fruit.x, fruit.y); reset = false; }
	set(FRUIT, fruit.x, fruit.y);
}

function setGame(game){
	gametype = game;
	if (gamecounter == 0) main();
	else init();
}
