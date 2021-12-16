var snakespeed = 5;

var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5, MISSILE = 6, HEAD = 7, CLONE = 8;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;
var canvas, ctx, keystate, frames, score, fruitvalue, taken;
var gametype, gamecounter = 0;
var nx, ny, cx, cy, bomb;
var flash;

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
};

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

clone = {
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

fruit = {
	direction: null,
	x: null,
	y: null
};

bombs = [];

function setGame(game){
	gametype = game;
	if (gamecounter == 0) main();
	else init();
}

function main() {
	canvas = document.getElementById("grid");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;
	ctx = canvas.getContext("2d");
	document.body.appendChild(canvas);

	keystate = {};
	document.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		keystate[evt.keyCode] = false;
	});
	init();
	loop();
}

function init() {
	frames = 0, score = 0, taken = 0, fruitvalue = 250;
	COLS = 26, ROWS = 26;
	bombs = [];

	for (i = larrow; i <= darrow; i++) keystate[i] = false;

	if (getScore(gametype) == null) { //set scores to 0 if not yet played
		setScore(gametype, 0);
		setFruitScore(gametype, 0);
	}

	grid.init(EMPTY, COLS, ROWS);

	var sp = {x:ROWS-1, y:Math.floor(COLS/2)};
	snake.init(right, sp.x, sp.y);
	for (var i = 0; i < 3; i++){
		set(SNAKE, sp.x, sp.y);
		snake.insert(sp.x, sp.y);	
	}

	if (isGame("Phantom_Snake")) initClone();
	else { cx = null; cy = null; }
	set(EMPTY, ROWS-1, sp.y);

	snake_length = 4;
	gamecounter++;

	if (isGame(["Movers", "Dodge", "Bombs", "Colorblind", "Flash", "Good_Luck", "No_Survivors", "Frogger", "20/20_Vision"])) bomb = true;
	else bomb = false;

	if (isGame("20/20_Vision")) grade = true;
	else grade = false;

	if (isGame("Portal")) set(FRUIT);
	set(FRUIT);
}

function initClone() {
	var sp = {x:ROWS-1, y:0};
	clone.init(right, sp.x, sp.y);
	for (var i = 0; i < 3; i++){
		set(CLONE, sp.x, sp.y);
		clone.insert(sp.x, sp.y);	
	}
	set(EMPTY, ROWS-1, sp.y);

}

function moveClone() {
	if (fruit.x < cx) {
		if (Math.abs(fruit.x - cx) < COLS/2 && fruit.x != cx) clone.direction = left;
		else clone.direction = right;
	} else if (fruit.x > cx) { 
		if (Math.abs(fruit.x - cx) < COLS/2 && fruit.x != cx) clone.direction = right;
		else clone.direction = left
	} else if (fruit.y < cy) {
		if (Math.abs(fruit.y - cy) < ROWS/2 && fruit.y != cy) clone.direction = up;
		else clone.direction = down;
	} else if (fruit.y > cy) {
		if (Math.abs(fruit.y - cy) < ROWS/2 && fruit.y != cy) clone.direction = down;
		else clone.direction = up;
	}
	
	if (clone.direction == left) cx--;
	else if (clone.direction == up) cy--;
	else if (clone.direction == right) cx++;
	else if (clone.direction == down) cy++;

	if (cx < grid.width-COLS){
		cx = COLS-1;
	} else if (cx > COLS-1) {
		cx = grid.width-COLS;
	} else if (cy < grid.height-ROWS) {
		cy = ROWS-1;
	} else if (cy > ROWS-1) {
		cy = grid.height-ROWS;
	}

}

function loop() {
	draw();
	update();

	globalID = window.requestAnimationFrame(loop, canvas);
}

function draw() {
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	if (frames%50 == 0 && isGame("Flash")) flash = !flash; //turns bomb visibility on & off

	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (at(WALL, x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (x == cx && y == cy) ctx.fillStyle = "black";
			else if (at(CLONE, x, y)) ctx.fillStyle = "gray";
			else if (at(EMPTY, x, y)) ctx.fillStyle = "#fff";
			else if (at(HEAD, x, y)) ctx.fillStyle = "#f00";
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
			else if (at(BOMB, x, y)) {
				if (isGame(["Colorblind", "Good_Luck", "No_Survivors"])) ctx.fillStyle = "#f00";
				else if (isGame("Flash") && flash) ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} 
			else if (at(SNAKE, x, y) || at(MISSILE, x, y)) ctx.fillStyle = "orange";

			ctx.fillRect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (fruitvalue > 50) fruitvalue-=.5;
	if (isGame("Tick_Tock") && frames%50 == 0 && fruitvalue < 175) set(BOMB);
	if (isGame(["Shots_Fired", "No_Survivors"]) && frames%20 == 0) set(MISSILE, 0);

	updateScoreboard();
}

function getGrade() {

	if (!grade) return "00";
	if (fruitvalue < 205) return "ff";
	
	return (+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16) + (+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16);
}

function scoreToContinue(gametype) {
	return games[games.map(function(e) { return e.name; }).indexOf(gametype)+1].score;
}

function updateScoreboard() {
	var d = "";
	if (text != null) d += text[0];
	else d += "<span id = 'inst'><br>You're in local mode! This would be the instructions! You're in local mode! This would be the instructions! You're in local mode! This would be the instructions!</span>"
	
	d += "<span id = 'descr'><br> CURRENT SCORE: " + score;
	d += "<br> FRUIT TAKEN: " + taken;
	d += "<br> FRUIT VALUE: " + Math.floor(fruitvalue);
	d += "<br>SNAKE LENGTH: " + snake_length + " pieces long</span>";

	d += "<br><span id ='best'>HIGH SCORE: " + getScore(gametype);
	d += "<br>MOST FRUIT: " + getFruitScore(gametype) + "</span>";

	if (gametype != games.at(-1).name && getFruitScore(gametype) < scoreToContinue(gametype))
		d += "<br><span id = 'req'> Collect " + (scoreToContinue(gametype) - taken) + " fruit to progress.</span>";
	
	
	document.getElementById("overview").innerHTML = d;
}

function update() {
	frames++;

	if ((frames%4 == 0 && isGame("Movers"))||(isGame(["Good_Luck", "No_Survivors"]) && frames%8 ==0)) moveFruit();
	if (frames%20 == 0 && taken > 0 && isGame(["Dodge", "Good_Luck", "No_Survivors"])) moveBombs();
	if (frames%4 == 0 && (frames % 100 >  30 && frames % 100 < 60) && isGame("Frogger")) { moveBombs(); moveFruit(); }
	if (frames%5 == 0 && isGame(["Shots_Fired", "No_Survivors"])) moveMissiles();

	if (frames > 50) resetBoard();

	if (frames%(snakespeed+8) == 0 && isGame("Phantom_Snake")) {
		cx = clone.last.x;
		cy = clone.last.y;

		moveClone();

		if (at(FRUIT, cx, cy)) {
			playSound();
			set(BOMB, cx, cy);
			bombs.push({direction:oppDirection(clone.direction), x:cx, y:cy});
			set(FRUIT);
		} 
		
		var tail = clone.remove();
		set(EMPTY, tail.x, tail.y);  
		tail.x = cx;
		tail.y = cy;
		set(CLONE, tail.x, tail.y);
		clone.insert(tail.x, tail.y);
		
	}

	if ((frames+2)%snakespeed == 0){
		nx = snake.last.x;
		ny = snake.last.y;

		moveSnake();
		
		if (gameOver(nx, ny)) {
			gameReset();
			return init();
		}

		if (at(FRUIT, nx, ny)) {
			collectedFruit(nx, ny);
		} else {
			var tail = snake.remove();
			if (!at(BOMB, tail.x, tail.y) && !at(WALL, tail.x, tail.y) && !isGame("Infinity"))
				set(EMPTY, tail.x, tail.y);  //remove for infinite snake
			tail.x = nx;
			tail.y = ny;
			set(SNAKE, tail.x, tail.y);
			snake.insert(tail.x, tail.y);
		}
	}
}

function gameReset() {
	unlockGames();
	if (!confirm("Press OK to play again. Press cancel to pick another level.")) location.reload();
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

function set(value, a, b) {
	if (a == null || b == null) { //place at a random spot
		var empty = [];
		var i = 0;
		if (isGame("Boxed_In")) i++;   //don't place fruit on edge of map during Boxed_In
	
		for (var x=grid.width-COLS+i; x < COLS-i; x++) {
			for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
				if (at(EMPTY, x, y) && x != nx && y != ny) {
					empty.push({x:x, y:y});
				}
			}
		}
	
		var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
		if (a == null) a = randpos.x; 
		if (b == null) b = randpos.y;
	}

	if (value == FRUIT) fruit = {x:a, y:b};
	grid.set(value, a, b);
}

function isGame(gamelist) {
	return gamelist.includes(gametype);
}

function collectedFruit(x, y){
	playSound();
	updateScore();
	lengthenSnake({x:x, y:y}, 2);

	if (isGame("Boxed_In") && taken%4 == 0) shrinkBoard();
	if (isGame("Portal")) teleportSnake();
	if (bomb) {
		set(BOMB, x, y); 
		bombs.push({direction:oppDirection(snake.direction), x:x, y:y});
	}

	checkHighScores();

	if (isGame("Infinity")) { set(FRUIT); set(FRUIT); }
	if (isGame("Portal")) set(FRUIT);
	set(FRUIT);

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
				lengthenSnake({x:snake.last.x, y:snake.last.y}, 2);

				missiles.splice(i, 0);
			} else {
				set(MISSILE, missiles[i].x, missiles[i].y);
			}
		}
	} 	
}

function moveBombs(){
	for (var i = 0; i < bombs.length; i++) {
		set(EMPTY, bombs[i].x, bombs[i].y);

		if (bombs[i].direction == left) {
			bombs[i].x--;
			if (bombs[i].x < 0) bombs[i].x = COLS-1;
	   	} else if (bombs[i].direction == right) {
			bombs[i].x++;
			if (bombs[i].x >= COLS) bombs[i].x = 0;
	   	} else if (bombs[i].direction == up) {
		   	bombs[i].y--;
			if (bombs[i].y < 0) bombs[i].y = ROWS-1;
	   	} else if (bombs[i].direction == down) {
		   	bombs[i].y++;
			if (bombs[i].y >= ROWS) bombs[i].y = 0;
	   	}

	   	if (at(HEAD, bombs[i].x, bombs[i].y)){
			gameReset();
			return init();
	   	}

	   	set(BOMB, bombs[i].x, bombs[i].y);
	}
}

function resetBoard() {
	for (var i = 0; i < snake.s_body.length; i++) {
		if (!at(FRUIT, snake.s_body[i].x, snake.s_body[i].y) && !at(WALL, snake.s_body[i].x, snake.s_body[i].y)) set(SNAKE, snake.s_body[i].x, snake.s_body[i].y);
	}

	if (!at(BOMB, fruit.x, fruit.y)) set(FRUIT, fruit.x, fruit.y);

	for (var i = 0; i < bombs.length; i++) {
		if (!at(SNAKE, bombs[i].x, bombs[i].y)) set(BOMB, bombs[i].x, bombs[i].y);
	}

	if (isGame("Phantom_Snake")) {
		for (var i = 0; i < clone.s_body.length; i++) {
			set(CLONE, clone.s_body[i].x, clone.s_body[i].y);
		}
	}
}

function moveFruit(){
	set(EMPTY, fruit.x, fruit.y);

	if (isGame(["Movers", "Frogger"])) fruit.direction = taken;
	else fruit.direction = Math.floor((Math.random()*15)+1);

	if (fruit.direction%4 == 0) { 
		fruit.x--;
		if (fruit.x == grid.width-COLS-1 && isGame(["Movers", "Frogger"])) fruit.x = COLS-1;
		else if (fruit.x == grid.width-COLS-1) fruit.x++;
	} else if (fruit.direction%3 == 0) { 
		fruit.y--;
		if (fruit.y == grid.height-ROWS-1 && isGame(["Movers", "Frogger"])) fruit.y = ROWS-1;
		else if (fruit.y == grid.height-ROWS-1) fruit.y++;
	} else if (fruit.direction%2 == 0) { 
		fruit.x++;
		if (fruit.x == COLS && isGame(["Movers", "Frogger"])) fruit.x = grid.width-COLS;
		else if (fruit.x == COLS) fruit.x--;
	} else { 
		fruit.y++;
		if (fruit.y == ROWS && isGame(["Movers", "Frogger"])) fruit.y = grid.height-ROWS;
		else if (fruit.y == ROWS) fruit.y--;
	}

	if (at(HEAD, fruit.x, fruit.y)) collectedFruit(fruit.x, fruit.y); 
	set(FRUIT, fruit.x, fruit.y);
}

function lengthenSnake(tail, growth_rate) {
	for (var i = 0; i < growth_rate; i++){			
		set(SNAKE, tail.x, tail.y);
		snake.insert(tail.x, tail.y);
	} 

	snake_length+=growth_rate;
}

function checkHighScores() {
	if (score > getScore(gametype))
		setScore(gametype, score);
	if (taken > getFruitScore(gametype))
		setFruitScore(gametype, taken);
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

function oppDirection(direction) {
	return (direction + 2) % 4;
}

function getScore(gametype) {
	return localStorage.getItem(gametype + location.pathname);
}

function getFruitScore(gametype) {
	return localStorage.getItem(gametype + location.pathname + 'fruit');
}

function setScore(gametype, value) {
	localStorage.setItem(gametype + location.pathname, value);
}

function setFruitScore(gametype, value) {
	localStorage.setItem(gametype + location.pathname + 'fruit', value);
}

