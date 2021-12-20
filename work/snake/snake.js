var COLS = 26, ROWS = 26;
var gamecounter = 0, snakespeed = 5;
const EMPTY = 0, SNAKE = 1, CLONE = 2, FRUIT = 3, BOMB = 4, WALL = 5, MARKED = 6, MISSILE = 7, HEAD = 8, CLONEHEAD = 9;
const left  = 0, up = 1, right = 2, down  = 3;
const larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;

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

function loop() {
	update();
	draw();
	globalID = window.requestAnimationFrame(loop, canvas);
}

function init() {
	frames = score = taken = 0, fruitvalue = 250;
	COLS = ROWS = 26, snake_length = 4;
	bombs = [], missiles = [], fruit = [], emptycells = [];
	reset = false, gamecounter++;

	for (var i = larrow; i <= darrow; i++) keystate[i] = false;
	grid.init(EMPTY, COLS, ROWS);

	for (var i = 0; i < COLS; i++) {
		for (var j = 0; j < ROWS; j++) {
			emptycells.push({direction:null, x:i, y:j});
		}
	}

	getGameAttributes();
	initSnakes();
	set(numfruit, FRUIT);
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
		for (var i = 0; i < snake_length; i++) snake[s].insert(sp.x, sp.y);	
	}
}

function update() {
	frames++;

	if (movefruit && timeToMove(FRUIT)) move(FRUIT);
	if (movebombs && timeToMove(BOMB)) move(BOMB);
	if (hasmissiles && timeToMove(MISSILE)) move(MISSILE);
	if (reset) return init();

	snake.forEach(function(s, i) {
		if ((timeToMove(SNAKE) && i == 0) || (timeToMove(CLONE) && i == 1)) {
			move(SNAKE+i);
			if (gameOver(s.last.x, s.last.y) && i == 0 || reset) {
				gameReset();
				return init();
			}

			if (at(FRUIT, s.last.x, s.last.y)) collectedFruit(s.last.x, s.last.y, i);

			var tail = s.remove();
			if (!infinite && !at(WALL, tail.x, tail.y)) set(1, EMPTY, tail.x, tail.y);
			set(1, SNAKE+i, s.last.x, s.last.y);
			s.insert(s.last.x, s.last.y);
		}
	});
	if (tick && frames%50 == 0 && fruitvalue < 175) set(1, BOMB);
	if (hasmissiles && frames%20 == 0) set(1, MISSILE, 0, Math.round(Math.random()*COLS-1));
	updateScoreboard();
}

function updateScoreboard() {
	if (fruitvalue > 50) fruitvalue-=.5;

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

function draw() {
	resetBoard();

	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;

	for (var x = 0; x < grid.width; x++) {
		for (var y = 0; y < grid.height; y++) {
			if (at(WALL, x ,y)) ctx.fillStyle = "#2b2b2b";
			else if (at(EMPTY, x, y)) ctx.fillStyle = "#fff";
			else if (at(HEAD, x, y)) ctx.fillStyle = "#f00";
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
			else if (at(BOMB, x, y)) {
				if (flash && frames%100 > 50 && frames%100 < 99) ctx.fillStyle = "fff";
				else if (redbombs) ctx.fillStyle = "#f00";
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
}

function set(num, value, a, b, isOld) {
	for (var count = 0; count < num; count++) {
		if ((a == null || b == null) || num > 1) {
			do { var randpos = Math.round(Math.random()*(emptycells.length-1));
			} while ((emptycells[randpos].x == snake[0].last.x || emptycells[randpos].y == snake[0].last.y)
					|| (walls && (emptycells[randpos].x <= (grid.width-COLS)/2 || emptycells[randpos].x >= (COLS-1+(grid.width-COLS)/2) 
					|| emptycells[randpos].y <= (grid.height-ROWS)/2 || emptycells[randpos].y >= (ROWS-1+(grid.height-ROWS)/2))));
					//dont place on same cell as snake head or on edges if playing w/ walls
			a = emptycells[randpos].x;
			b = emptycells[randpos].y;
		}

		if (value == FRUIT || value == BOMB || value == MISSILE || value == EMPTY)
			if (isOld == null) getAll(value).push({direction:getDirection(value), x:a, y:b});

		if (value != EMPTY && at(EMPTY, a, b)) emptycells.splice(emptycells.findIndex(cell => cell.x === a && cell.y === b), 1);
		grid.set(value, a, b);
	}
}

function move(object) {
	if (object == SNAKE) moveSnake();
	else if (object == CLONE) moveClone();
	else {
		getAll(object).forEach(function(item, i, objArray) {
			if (at(SNAKE, item.x, item.y) && object == MISSILE) collision(object, objArray, i);
			else { 
				set(1, EMPTY, item.x, item.y);
				objArray[i] = newPosition(object, item.direction, item.x, item.y);

				if (objArray[i] == null) objArray.splice(i, 1);
				else {
					set(1, object, objArray[i].x, objArray[i].y, true);  //true means the object shouldnt be pushed again
					if (at(HEAD, objArray[i].x, objArray[i].y)) collision(object, objArray, i);
				}
			}
		});
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

function newPosition(value, direction, x, y) {
	if (direction == left) x--;
	else if (direction == right) x++;
	else if (direction == up) y--;
	else if (direction == down) y++;

	if (x > COLS-1 && value == MISSILE) return null;  //missiles dont wrap around
	else if (x < (grid.width-COLS)/2) x = COLS-1+(grid.width-COLS)/2;
	else if (x > COLS-1+(grid.width-COLS)/2) x = (grid.width-COLS)/2;
	else if (y < (grid.height-ROWS)/2) y = ROWS-1+(grid.height-ROWS)/2;
	else if (y > ROWS-1+(grid.height-ROWS)/2) y = (grid.height-ROWS)/2;

	return {direction:direction, x:x, y:y};
}


function timeToMove(object) {
	if (object == SNAKE) return frames%snakespeed == 0;
	else if (object == CLONE) return frames%(snakespeed+8) == 0;
	else if (object == MISSILE) return frames%5 == 0;

	else if (object == BOMB) {
		if (frog) return (frames+2)%5 == 0 && frames%100 > 30 && frames%100 < 60;
		return ((frames+2)%20 == 0); 
	} else if (object == FRUIT) {
		if (frog) return frames%4 == 0 && frames%100 > 30 && frames%100 < 60;
		return frames%4 == 0;
	}
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
	if (bomb || isClone) set(1, BOMB, x, y);

	checkHighScores();
	set(numfruit, FRUIT);
}

function collision(value, array, i) {
	if (value == MISSILE) {
		playSound();
		lengthenSnake({x:snake[0].last.x, y:snake[0].last.y}, 2);
		array.splice(i, 1);
	} else if (value == FRUIT) collectedFruit(snake[0].last.x, snake[0].last.y);
	else if (value == BOMB) {
		reset = true;
		gameReset();
	}
}

function resetBoard() {
	if (frames > 50) snake[0].s_body.forEach(function(s) { if (!at(FRUIT, s.x, s.y) && !at(WALL, s.x, s.y)) set(1, SNAKE, s.x, s.y, true) });
	fruit.forEach(function(f) { if (!at(BOMB, f.x, f.y)) set(1, FRUIT, f.x, f.y, true) });
	bombs.forEach(function(b) { if (!at(SNAKE, b.x, b.y) || movebombs) set(1, BOMB, b.x, b.y, true) });	
	if (clone && frames > 100) snake[1].s_body.forEach(function(c) { set(1, CLONE, c.x, c.y, true) });
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

	if (infinite) numfruit = 3;
	else if (portal) numfruit = 2;
	else numfruit = 1;
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

function isGame(gamelist) {
	return gamelist.includes(gametype);
}

function getDirection(value) {
	if (value == MISSILE) return right;
	if (value == FRUIT) return Math.round(Math.random()*3);
	if (value == BOMB) return oppDirection(snake[0].direction);
}

function getAll(value) {
	if (value == FRUIT) return fruit;
	if (value == BOMB) return bombs;
	if (value == MISSILE) return missiles;
	if (value == EMPTY) return emptycells;
}

function lengthenSnake(tail, growth_rate) {
	for (var i = 0; i < growth_rate; i++){			
		set(1, SNAKE, tail.x, tail.y);
		snake[0].insert(tail.x, tail.y);
	} 

	snake_length += growth_rate;
}

function checkHighScores() {
	if (score > getScore(gametype)) setScore(gametype, score);
	if (taken > getFruitScore(gametype)) setFruitScore(gametype, taken);
}

function updateScore() {
	score += Math.floor(fruitvalue);
	fruitvalue = 250;
	taken++;
}

function playSound() {
	document.getElementById("fruitsound").pause();
	document.getElementById("fruitsound").currentTime = 0;
	document.getElementById("fruitsound").play();
}

function oppDirection(direction) {
	return (direction + 2) % 4;
}

function teleportSnake() {
	set(1, SNAKE, fruit[0].x, fruit[0].y);
	snake[0].last.x = fruit[0].x;
	snake[0].last.y = fruit[0].y;
	fruit.pop();
}

function getGrade() {
	if (!grade) return "00";
	if (fruitvalue < 205) return "ff";
	
	return (+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16) + (+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16);
}

function shrinkBoard() {
	for (var i = (grid.height-ROWS)/2; i < ROWS+(grid.height-ROWS)/2; i++) {
		set(1, WALL, i, (grid.height-ROWS)/2);
		set(1, WALL, i, ROWS-1+(grid.height-ROWS)/2);
		set(1, WALL, (grid.width-COLS)/2, i);
		set(1, WALL, COLS-1+(grid.width-COLS)/2, i);
	}
	
	ROWS -= 2;
	COLS -= 2;
}