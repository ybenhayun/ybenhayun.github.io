var snakespeed = 5;
var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 10, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5, MISSILE = 6, HEAD = 7, CLONE = 11, CLONEHEAD = 9;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;
var canvas, ctx, keystate, frames, score, fruitvalue, taken;
var gametype, gamecounter = 0;
var bomb, reset, flash, grade, tick, frog, clone, movebombs, movefruit, hasmissiles;

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

snake = [{
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
}];

fruit = [];
bombs = [];
missiles = [];

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
	bombs = [], missiles = [], fruit = [];
	reset = false;

	for (i = larrow; i <= darrow; i++) keystate[i] = false;
	grid.init(EMPTY, COLS, ROWS);

	snake_length = 4;
	gamecounter++;

	getGameAttributes();
	initSnakes();

	if (portal) set(FRUIT);
	set(FRUIT);
}

function getGameAttributes() {
	bomb = isGame(["Movers", "Dodge", "Bombs", "Colorblind", "Flash", "Good_Luck", "No_Survivors", "Frogger", "20/20_Vision"]);
	movefruit = isGame(["Movers", "Frogger", "Good_Luck", "No_Survivors"]);
	movebombs = isGame(["Dodge", "Good_Luck", "No_Survivors", "Frogger"]);
	hasmissiles = isGame(["Shots_Fired", "No_Survivors"]);
	flash = isGame("Flash");
	grade = isGame("20/20_Vision");
	redbombs = isGame(["Colorblind", "Good_Luck", "No_Survivors"]);
	tick = isGame("Tick_Tock");
	frog = isGame("Frogger");
	clone = isGame("Phantom_Snake");
	walls = isGame("Boxed_In");
	infinite = isGame("Infinity");
	portal = isGame("Portal");
}

function initSnakes() {
	if (clone) count = 2;
	else count = 1;
	if (snake.length > 1) snake.pop(); //max 2 snakes in array

	for (var s = 0; s < count; s++) {
		if (s > 0) { 
			var double = Object.create(snake[0]);
			snake.push(double);
			body = CLONE;
		} else body = SNAKE;

		var sp = {x:ROWS-1, y:Math.round(Math.random()*COLS-1)};
		snake[s].init(right, sp.x, sp.y);
		for (var i = 0; i < snake_length; i++){
			set(body, sp.x, sp.y);
			snake[s].insert(sp.x, sp.y);	
		}
		set(EMPTY, ROWS-1, sp.y);
	}
}

function moveClone() {
	var lastdir = snake[1].direction;

	if (fruit[0].y < snake[1].last.y && frames > 30) {
		if (Math.abs(fruit[0].y - snake[1].last.y) < ROWS/2 && fruit[0].y != snake[1].last.y) snake[1].direction = up;
		else snake[1].direction = down;
	} else if (fruit[0].y > snake[1].last.y && frames > 30) {
		if (Math.abs(fruit[0].y - snake[1].last.y) < ROWS/2 && fruit[0].y != snake[1].last.y) snake[1].direction = down;
		else snake[1].direction = up;
	} else if (fruit[0].x < snake[1].last.x) {
		if (Math.abs(fruit[0].x - snake[1].last.x) < COLS/2 && fruit[0].x != snake[1].last.x) snake[1].direction = left;
		else snake[1].direction = right;
	} else if (fruit[0].x > snake[1].last.x) { 
		if (Math.abs(fruit[0].x - snake[1].last.x) < COLS/2 && fruit[0].x != snake[1].last.x) snake[1].direction = right;
		else snake[1].direction = left
	} 

	if (snake[1].direction == oppDirection(lastdir)) snake[1].direction = (snake[1].direction+1)%4  //cant turn 180º

	snake[1].last.x = newPosition(CLONE, snake[1].direction, snake[1].last.x, snake[1].last.y).x
	snake[1].last.y = newPosition(CLONE, snake[1].direction, snake[1].last.x, snake[1].last.y).y
}

function loop() {
	update();
	draw();

	globalID = window.requestAnimationFrame(loop, canvas);
}

function draw() {
	resetBoard();

	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (at(WALL, x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (at(EMPTY, x, y)) ctx.fillStyle = "#fff";
			else if (at(HEAD, x, y)) ctx.fillStyle = "#f00";
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
			else if (at(BOMB, x, y)) {
				if (redbombs) ctx.fillStyle = "#f00";
				else if (flash && frames%100 > 50 && frames%100 < 99) ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} else if (at(SNAKE, x, y) || at(MISSILE, x, y)) ctx.fillStyle = "orange";
			else if (clone) {
				if (at(CLONEHEAD, x, y)) ctx.fillStyle = "black";
				else if (at(CLONE, x, y)) ctx.fillStyle = "gray";
			}

			ctx.fillRect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (fruitvalue > 50) fruitvalue-=.5;
	if (tick && frames%50 == 0 && fruitvalue < 175) set(BOMB);
	if (hasmissiles && frames%20 == 0) set(MISSILE, 0, Math.round(Math.random()*COLS-1));

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

function timeToMove(object) {
	if (object == SNAKE) return frames%snakespeed == 0;
	if (object == CLONE) return frames%(snakespeed+8) == 0;
	if (object == MISSILE) return frames%5 == 0;

	if (object == BOMB) {
		if (frog) return (frames+2)%5 == 0 && frames%100 > 30 && frames%100 < 60;
		return ((frames+2)%20 == 0); 
	} 

	if (object == FRUIT) {
		if (frog) return frames%4 == 0 && frames%100 > 30 && frames%100 < 60;
		return frames%4 == 0;
	}
}

function update() {
	frames++;

	if (movefruit && timeToMove(FRUIT)) move(FRUIT);
	if (movebombs && timeToMove(BOMB)) move(BOMB);
	if (hasmissiles && timeToMove(MISSILE)) move(MISSILE);
	if (reset) return init();

	for (var i = 0; i < snake.length; i++) {
		if ((timeToMove(SNAKE) && i == 0) || (timeToMove(CLONE) && i == 1)) {
			move(SNAKE+i);
			if (gameOver(snake[i].last.x, snake[i].last.y) && i == 0 || reset) {
				gameReset();
				return init();
			}

			if (at(FRUIT, snake[i].last.x, snake[i].last.y)) {
				collectedFruit(snake[i].last.x, snake[i].last.y, i);
				if (bomb || i != 0) set(BOMB, snake[i].last.x, snake[i].last.y);
			} 

			var tail = snake[i].remove();
			if (!infinite && !at(WALL, tail.x, tail.y)) set(EMPTY, tail.x, tail.y);
			set(SNAKE+i, snake[i].last.x, snake[i].last.y);
			snake[i].insert(snake[i].last.x, snake[i].last.y);
		}
	}
}

function gameReset() {
	unlockGames();
	if (clone) snake.pop();  //get rid of clone snake before next game
	if (!confirm("Press OK to play again. Press cancel to pick another level.")) location.reload();
}

function gameOver(x, y){
	return (at(SNAKE, x, y) || at(BOMB, x, y));
}

function at(value, x, y) {
	if (value == HEAD) return (x == snake[0].last.x && y == snake[0].last.y);
	if (value == CLONEHEAD) return (x == snake[1].last.x && y == snake[1].last.y);
	return grid.get(x, y) == value;
}

function set(value, a, b, isOld) {
	if (a == null || b == null) { //place at a random spot
		var empty = [];
		var i = 0;
		if (walls) i++;   //don't place fruit on edge of map during Boxed_In
	
		for (var x=grid.width-COLS+i; x < COLS-i; x++) {
			for (var y=grid.height-ROWS+i; y < ROWS-i; y++) {
				if (at(EMPTY, x, y) && x != snake[0].last.x && y != snake[0].last.y) {
					empty.push({x:x, y:y});
				}
			}
		}
	
		var randpos = empty[Math.round(Math.random()*(empty.length - 1))];
		if (a == null) a = randpos.x; 
		if (b == null) b = randpos.y;
	}
	
	if (value != SNAKE && value != EMPTY && value != CLONE && value != WALL) 
		if (isOld == null) getAll(value).push({direction:getDirection(value), x:a, y:b});

	grid.set(value, a, b);
}

function isGame(gamelist) {
	return gamelist.includes(gametype);
}

function collectedFruit(x, y, isClone) {
	fruit.splice(fruit.findIndex(item => item.x === x && item.y === y), 1);
	playSound();
	if (isClone != true) { 
		updateScore();
		lengthenSnake({x:x, y:y}, 2);
	}

	if (walls && taken%4 == 0) shrinkBoard();
	if (portal) teleportSnake();

	checkHighScores();

	if (infinite) { set(FRUIT); set(FRUIT); }
	if (portal) set(FRUIT);
	set(FRUIT);
}

function move(object) {
	if (object == SNAKE) moveSnake();
	else if (object == CLONE) moveClone();
	else {
		objArray = getAll(object);

		for (var i = 0; i < objArray.length; i++) {
			if (at(SNAKE, objArray[i].x, objArray[i].y) && object == MISSILE) collision(object, objArray, i);
			else { 
				set(EMPTY, objArray[i].x, objArray[i].y);
				objArray[i] = newPosition(object, objArray[i].direction, objArray[i].x, objArray[i].y);
				if (objArray[i] == null) objArray.splice(i, 1);
				else {
					set(object, objArray[i].x, objArray[i].y, true);  //true means the object shouldnt be pushed again
					if (at(HEAD, objArray[i].x, objArray[i].y)) collision(object, objArray, i);
				}
			}
		}
	}
}

function collision(value, array, i) {
	if (value == MISSILE) {
		playSound();
		lengthenSnake({x:snake[0].last.x, y:snake[0].last.y}, 2);
		array.splice(i, 1);
	} else if (value == FRUIT) {
		collectedFruit(snake[0].last.x, snake[0].last.y);
		if (bomb) set(BOMB, snake[0].last.x, snake[0].last.y);
	} else if (value == BOMB) {
		reset = true;
		gameReset();
	}
}

function getDirection(value) {
	if (value == MISSILE) return right;
	if (value == FRUIT) return taken%4;
	if (value == BOMB) return oppDirection(snake[0].direction);
}

function getAll(value) {
	if (value == FRUIT) return fruit;
	if (value == BOMB) return bombs;
	if (value == MISSILE) return missiles;
}

function newPosition(value, direction, x, y) {
	if (direction == left) x--;
	else if (direction == right) x++;
	else if (direction == up) y--;
	else if (direction == down) y++;

	if (x > COLS-1 && value == MISSILE) return null;  //missiles dont wrap around
	else if (x < grid.width-COLS) x = COLS-1;
	else if (x > COLS-1) x = grid.width-COLS;
	else if (y < grid.height-ROWS) y = ROWS-1;
	else if (y > ROWS-1) y = grid.height-ROWS;

	return {direction:direction, x:x, y:y};
}

function resetBoard() {
	if (frames > 50) {
		for (var i = 0; i < snake[0].s_body.length; i++) {
			if (!at(FRUIT, snake[0].s_body[i].x, snake[0].s_body[i].y) && !at(WALL, snake[0].s_body[i].x, snake[0].s_body[i].y)) set(SNAKE, snake[0].s_body[i].x, snake[0].s_body[i].y, true);
		}
	}

	if (!at(BOMB, fruit[0].x, fruit[0].y)) set(FRUIT, fruit[0].x, fruit[0].y, true);

	for (var i = 0; i < bombs.length; i++) {
		if (!at(SNAKE, bombs[i].x, bombs[i].y) || movebombs) set(BOMB, bombs[i].x, bombs[i].y, true);
	}

	if (clone && frames > 100) {
		for (var i = 0; i < snake[1].s_body.length; i++) {
			set(CLONE, snake[1].s_body[i].x, snake[1].s_body[i].y, true);
		}
	}
}

function lengthenSnake(tail, growth_rate) {
	for (var i = 0; i < growth_rate; i++){			
		set(SNAKE, tail.x, tail.y);
		snake[0].insert(tail.x, tail.y);
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
	set(SNAKE, fruit[0].x, fruit[0].y);
	snake[0].last.x = fruit[0].x;
	snake[0].last.y = fruit[0].y;
	fruit.pop();
}

function oppDirection(direction) {
	return (direction + 2) % 4;
}