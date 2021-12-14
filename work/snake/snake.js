var snakespeed = 5;

var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5, MISSILE = 6, HEAD = 7;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow = 37, uarrow = 38, rarrow = 39, darrow = 40;
var canvas, ctx, keystate, frames, score, fruitvalue, taken;
var gametype, gamecounter = 0;
var nx, ny, bomb;
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
	set(EMPTY, ROWS-1, sp.y);

	snake_length = 4;
	gamecounter++;

	if (isGame(["mover", "dodge", "bombs", "invis", "flash", "disoriented", "nogod", "frogger", "noeyes"]))
		bomb = true;
	else bomb = false;

	if (isGame("noeyes")) grade = true;
	else grade = false;

	if (isGame("portal")) set(FRUIT);
	set(FRUIT);
}

function loop() {
	draw();
	update();

	globalID = window.requestAnimationFrame(loop, canvas);
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
			else if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
			else if (at(BOMB, x, y)) {
				if (isGame(["invis", "disoriented", "nogod"])) ctx.fillStyle = "#f00";
				else if (isGame("flash") && flash) ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} 
			else if (at(SNAKE, x, y) || at(MISSILE, x, y)) ctx.fillStyle = "orange";

			ctx.fillRect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (fruitvalue > 50) fruitvalue-=.5;
	if (isGame("tick") && frames%30 == 0 && fruitvalue < 175) set(BOMB);
	if (isGame(["missiles", "nogod"]) && frames%20 == 0) set(MISSILE, 0);

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
	document.getElementById("score").innerHTML = "<span id = 'inst'>";
	document.getElementById("inst").innerHTML += "<br>Use the arrows keys to move around the grid. Collect as many fruit as you can without hitting yourself (walls are ok). Good luck!</span>";
	document.getElementById("inst").innerHTML += "<span id = 'overview'><span id = 'descr'><br> CURRENT SCORE: " + score;
	document.getElementById("descr").innerHTML += "<br> FRUIT TAKEN: " + taken;
	document.getElementById("descr").innerHTML += "<br> FRUIT VALUE: " + Math.floor(fruitvalue);
	document.getElementById("descr").innerHTML += "<br>SNAKE LENGTH: " + snake_length + " pieces long</span>";

	document.getElementById("descr").innerHTML += "<br><span id ='best'>HIGH SCORE: " + getScore(gametype);
	document.getElementById("best").innerHTML += "<br>MOST FRUIT: " + getFruitScore(gametype) + "</span>";


	if (!isGame("nogod") && getFruitScore(gametype) < scoreToContinue(gametype))
		document.getElementById("inst").innerHTML += "<br><span id = 'req'> Collect " + (scoreToContinue(gametype) - taken) + " fruit to progress.</span>";
	document.getElementById("overview").innerHTML += "</span></div>"
}

function update() {
	frames++;

	if ((frames%4 == 0 && isGame("mover"))||(isGame(["disoriented", "nogod"]) && frames%8 ==0)) moveFruit();
	if (frames%20 == 0 && taken > 0 && isGame(["dodge", "disoriented", "nogod"])) moveBombs();
	if (frames%4 == 0 && (frames % 100 >  30 && frames % 100 < 60) && isGame("frogger")) { moveBombs(); moveFruit(); }
	if (frames%5 == 0 && isGame(["missiles", "nogod"])) moveMissiles();

	if (frames > 50) resetBoard();

	if ((frames+2)%snakespeed == 0){
		nx = snake.last.x;
		ny = snake.last.y;

		moveSnake();
		
		if (gameOver(nx, ny)) {
			gameReset();
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

function gameReset() {
	unlockGames();
	if (confirm("Press OK to play again. Press cancel to pick another level.")) return init();
	else location.reload();
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
		if (isGame("walled")) i++;   //don't place fruit on edge of map during walled
	
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

	if (isGame("walled") && taken%4 == 0) shrinkBoard();
	if (isGame("portal")) teleportSnake();
	if (bomb) {
		set(BOMB, x, y); 
		bombs.push({direction:oppDirection(snake.direction), x:x, y:y});
	}

	checkHighScores();

	if (isGame("infinity")) { set(FRUIT); set(FRUIT); }
	if (isGame("portal")) set(FRUIT);
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
		if (!at(FRUIT, snake.s_body[i].x, snake.s_body[i].y)) set(SNAKE, snake.s_body[i].x, snake.s_body[i].y);
	}

	if (!at(BOMB, fruit.x, fruit.y)) set(FRUIT, fruit.x, fruit.y);

	for (var i = 0; i < bombs.length; i++) {
		if (!at(SNAKE, bombs[i].x, bombs[i].y)) set(BOMB, bombs[i].x, bombs[i].y);
	}
}

function moveFruit(){
	set(EMPTY, fruit.x, fruit.y);

	if (isGame(["mover", "frogger"])) fruit.direction = taken;
	else fruit.direction = Math.floor((Math.random()*15)+1);

	if (fruit.direction%4 == 0) { 
		fruit.x--;
		if (fruit.x == grid.width-COLS-1 && isGame(["mover", "frogger"])) fruit.x = COLS-1;
		else if (fruit.x == grid.width-COLS-1) fruit.x++;
	} else if (fruit.direction%3 == 0) { 
		fruit.y--;
		if (fruit.y == grid.height-ROWS-1 && isGame(["mover", "frogger"])) fruit.y = ROWS-1;
		else if (fruit.y == grid.height-ROWS-1) fruit.y++;
	} else if (fruit.direction%2 == 0) { 
		fruit.x++;
		if (fruit.x == COLS && isGame(["mover", "frogger"])) fruit.x = grid.width-COLS;
		else if (fruit.x == COLS) fruit.x--;
	} else { 
		fruit.y++;
		if (fruit.y == ROWS && isGame(["mover", "frogger"])) fruit.y = grid.height-ROWS;
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

