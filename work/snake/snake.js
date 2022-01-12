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
	head: null,	
	tail: null, 	
	body: null,	

	init: function(d, x, y) {
		this.direction = d;
		this.body = [];
		this.insert(x, y);
	},

	atend: function(x, y) {
		this.body.push({x:x, y:y});
		this.head = this.body[0];
		this.tail = this.body.at(-1);
	},

	insert: function(x, y) {
		this.body.unshift({x:x, y:y}); 		// unshift prepends an element to an array
		this.head = this.body[0];
		this.tail = this.body.at(-1);
	},
	remove: function() {
		return this.body.pop();
	}
}];

function setGame(game){
	gametype = game;
	
	for (var i = 0; i < games.length; i++) {
		if (games[i].name == gametype) { 
			document.getElementById(games[i].name).style.background = "#607480";
			document.getElementById(games[i].name).style.fontWeight = "bold";
			document.getElementById(games[i].name).innerHTML = "* " + games[i].title + " *";
		} else if (!document.getElementById(games[i].name).disabled) {
			document.getElementById(games[i].name).style.background = "#485157";
			document.getElementById(games[i].name).style.color = "#fafafa";
			document.getElementById(games[i].name).style.fontWeight = "normal";
			document.getElementById(games[i].name).innerHTML = games[i].title;
		}
	}

	if (gamecounter == 0) main();
	else init();
}

function main() {
	canvas = document.getElementById("grid");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;
	ctx = canvas.getContext("2d");

	keystate = {};
	document.addEventListener("keydown", function(evt) { keystate[evt.keyCode] = true; });
	document.addEventListener("keyup", function(evt) { keystate[evt.keyCode] = false; });

	document.querySelectorAll("button").forEach(function(el) {
		el.addEventListener("mouseover", function() {
			var index = games.findIndex(cell => cell.name === el.id);
			if (text != null) document.getElementById("descr").innerHTML = "<span class = 'name'>" + games[index].title.toUpperCase() + "</span>: " + text[index+1];
			else document.getElementById("descr").innerHTML = "This would be new text!";
		});

		el.addEventListener("mouseout", function() {
			var index = games.findIndex(cell => cell.name === gametype);
			if (text != null) document.getElementById("descr").innerHTML = "<span class = 'name'>" + games[index].title.toUpperCase() + "</span>: " + text[index+1];
			else document.getElementById("descr").innerHTML = "Back to the original!";
		  });
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
	beammeup = reset = false;
	frames = score = taken = 0, fruitvalue = 250;
	COLS = ROWS = 26, snake_length = 4;
	bombs = [], missiles = [], fruit = [], emptycells = [];
	gamecounter++;

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
	if (snake.length > 1) snake.pop(); //max 2 snakes in array

	for (var s = 0; s < 1+clone; s++) {
		if (s > 0) { 
			var double = Object.create(snake[0]);
			snake.push(double);
			body = CLONE;
		} else body = SNAKE;

		var sp = {x:0, y:Math.round(Math.random()*COLS-1)};
		snake[s].init(right, sp.x, sp.y);
		for (var i = 0; i < snake_length; i++) {
			snake[s].insert(sp.x, sp.y);	
			set(1, SNAKE, sp.x, sp.y);
		}
	}
}

function update() {
	frames++;

	if (movefruit && timeToMove(FRUIT)) move(FRUIT);
	if (movebombs && timeToMove(BOMB)) move(BOMB);
	if (hasmissiles && timeToMove(MISSILE)) move(MISSILE);

	snake.forEach(function(s, i) {
		if ((timeToMove(SNAKE) && i == 0) || (timeToMove(CLONE) && i == 1)) {
			move(SNAKE+i);
			if (gameOver(s.head.x, s.head.y) && i == 0 || reset) {
				gameReset();
				return setGame(gametype);
			}

			if (at(FRUIT, s.head.x, s.head.y)) collectedFruit(s.head.x, s.head.y, i);

			if (!infinite) { 
				var tail = s.remove();
				if (!at(WALL, tail.x, tail.y)) set(1, EMPTY, tail.x, tail.y);
			} else snake_length++;
			set(1, SNAKE+i, s.head.x, s.head.y);
			s.insert(s.head.x, s.head.y);
		}
	});

	if (tick && frames%50 == 0 && fruitvalue < 175) set(1, BOMB);
	if (hasmissiles && frames%20 == 0) set(1, MISSILE, 0, Math.round(Math.random()*COLS-1));
	if (bombs && flash) bombs.forEach(function(b) { b.life++ });
	
	updateScoreboard();
}

function updateScoreboard() {
	if (fruitvalue > 50) fruitvalue-=.5;

	document.getElementById('points').innerHTML = "<p><span class = 'name'>CURRENT SCORE</span>: <span class = 'amt'>" + score + "</span><br> <span class = 'name'>FRUIT TAKEN</span>: <span class = 'amt'>" + taken + "</span><br> <span class = 'name'>FRUIT VALUE</span>: " 
												+ Math.floor(fruitvalue) + "<br><span class = 'name'>SNAKE LENGTH</span>: " + snake_length + " pieces long";
	document.getElementById('best').innerHTML = "<p>HIGH SCORE: " + getScore(gametype) + "<br>MOST FRUIT: " + getFruitScore(gametype) + "</p>";

	if (gametype != games.at(-1).name && getFruitScore(gametype) < scoreToContinue(gametype))
		document.getElementById('req').innerHTML = "Collect " + (scoreToContinue(gametype) - taken) + " fruit to progress.";
	else document.getElementById('req').innerHTML = "Dev Score: " + games[games.findIndex(g => g.name === gametype)].dev + " fruit";
}

function draw() {
	resetBoard();
	tw = canvas.width/grid.width;
	th = canvas.height/grid.height;

	ctx.fillStyle = "#ededed";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (var x = 0; x < grid.width; x++) {
		for (var y = 0; y < grid.height; y++) {
            
            if (at(WALL, x, y)) ctx.fillStyle = "#2b2b2b";
            if (at(EMPTY, x, y)) ctx.fillStyle = "white";
            if (at(FRUIT, x, y)) ctx.fillStyle = "#f" + getGrade();
            if (at(BOMB, x, y)) ctx.fillStyle = (flash && flashTime(x, y)) ? ("white") : ((redbombs) ? ("red") : ("black"));
            if (at(SNAKE, x, y)) ctx.fillStyle = (at(HEAD, x, y)) ? ("red") : ("orange"); 
            if (at(MISSILE, x, y)) ctx.fillStyle = "orange";
            if (at(CLONE, x, y)) ctx.fillStyle = (at(CLONEHEAD, x, y)) ? ("black") : ("gray");
            
			if (at(WALL, x, y)) ctx.fillRect(x*tw, y*th, tw, th);
			else if ((!at(SNAKE, x, y) && !at(CLONE, x, y)) || at(HEAD, x, y) || at(CLONEHEAD, x, y)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
			else if (at(SNAKE, x, y) || at(CLONE, x, y)) drawSnakes(x , y, 0+at(CLONE, x, y)); //if at(clone) return true, itll draw a clone, otherwise a snake            
		}
	}
}

function drawSnakes(x, y, i) {
	var index = snake[i].body.findIndex(cell => cell.x === x && cell.y === y)
	var sx = snake[i].body[index].x, sy = snake[i].body[index].y;
	var nx = snake[i].body[index-1].x, ny = snake[i].body[index-1].y;

	if (sx == nx) {
		if ((sy - ny == 1) || (ny - sy > 1)) ctx.fillRect(x*tw+1, y*th-1, tw-2, th);
		else if ((ny - sy == 1) || (sy - ny > 1)) ctx.fillRect(x*tw+1, y*th+1, tw-2, th);
	} else if (sy == ny) {
		if ((sx - nx == 1) || (nx - sx > 1)) ctx.fillRect(x*tw-1, y*th+1, tw, th-2);
		else if ((nx - sx == 1) || (sx - nx > 1)) ctx.fillRect(x*tw+1, y*th+1, tw, th-2);
	} else ctx.fillRect(x*tw+1, y*th+1, tw-2, th-2);
} 

function set(num, value, a, b, isOld) {
	for (var count = 0; count < num; count++) {
		if ((a == null || b == null) || num > 1) {

			do { var randpos = Math.round(Math.random()*(emptycells.length-1));
			} while (cantPlace(emptycells[randpos].x, emptycells[randpos].y, value));

			a = emptycells[randpos].x;
			b = emptycells[randpos].y;
		}
		if (value == FRUIT || value == BOMB || value == MISSILE || value == EMPTY)
			if (!at(value, a, b) && isOld == null) getAll(value).push({direction:getDirection(value), x:a, y:b, life:0});
			
		if (value != EMPTY && at(EMPTY, a, b)) emptycells.splice(emptycells.findIndex(cell => cell.x === a && cell.y === b), 1);

		grid.set(value, a, b);
	}
}

function cantPlace(x, y, value) {
	if (emptycells.length <= ROWS) return false;
	if (value == FRUIT && bomb) var options = getsToSnake(left, x, y) + getsToSnake(right, x, y) + getsToSnake(up, x, y) + getsToSnake(down, x, y);   //dont place fruit inside bombs
	if (options < 2) return true;

	if (value == FRUIT && portal && fruit.length >= 1 && (fruit.some(e => e.x === x || e.y === y))) return true;      //dont place portals on same line

	return (x == snake[0].head.x || y == snake[0].head.y) //dont place bomb right in front of you
	|| (walls && (x == wall(left) || x == wall(right) || y == wall(up) || y == wall(down)));  //dont place fruit on edge during walls
}

function getsToSnake(dir, x, y) {
	(dir == left) ? (x--) : ((dir == right) ? (x++) : ((dir == up) ? (y--) : (y++)));
	(x > wall(right)) ? (x = wall(left)) : ((x < wall(left)) ? (x = wall(right)) : ((y > wall(down)) ? (y = wall(up)) : ((y < wall(up)) ? (y = wall(down)) : (null))));

	if (at(SNAKE, x, y)) {
		resetBoard();
		return true;
	}

	if (bombs.some(e => e.x === x && e.y === y) || at(MARKED, x, y)) return false;
	grid.set(MARKED, x, y);

	return getsToSnake(left, x, y) || getsToSnake(right, x, y) || getsToSnake(up, x, y) || getsToSnake(down, x, y);
}

function move(object) {
	if (object == SNAKE) beammeup ? teleportSnake() : moveSnake();
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
	var headdir = snake[1].direction;
	if (frames < 50) snake[1].direction = right;

	else if (fruit[0].y < snake[1].head.y) {
		if (Math.abs(fruit[0].y - snake[1].head.y) < ROWS/2) snake[1].direction = up;
		else snake[1].direction = down;
	} else if (fruit[0].y > snake[1].head.y) {
		if (Math.abs(fruit[0].y - snake[1].head.y) < ROWS/2) snake[1].direction = down;
		else snake[1].direction = up;
	} else if (fruit[0].x < snake[1].head.x) {
		if (Math.abs(fruit[0].x - snake[1].head.x) < COLS/2) snake[1].direction = left;
		else snake[1].direction = right;
	} else if (fruit[0].x > snake[1].head.x) { 
		if (Math.abs(fruit[0].x - snake[1].head.x) < COLS/2) snake[1].direction = right;
		else snake[1].direction = left
	} 

	if (snake[1].direction == oppDirection(headdir)) snake[1].direction = (snake[1].direction+1)%4;  //cant turn 180º

	snake[1].head.x = newPosition(CLONE, snake[1].direction, snake[1].head.x, snake[1].head.y).x;
	snake[1].head.y = newPosition(CLONE, snake[1].direction, snake[1].head.x, snake[1].head.y).y;
};

function newPosition(value, dir, x, y) {
	(dir == left) ? (x--) : ((dir == right) ? (x++) : ((dir == up) ? (y--) : (y++)));

	if (x > wall(right) && value == MISSILE) return null;  //missiles dont wrap around

	(x > wall(right)) ? (x = wall(left)) : ((x < wall(left)) ? (x = wall(right)) : ((y > wall(down)) ? (y = wall(up)) : ((y < wall(up)) ? (y = wall(down)) : (null))));
	return {direction:dir, x:x, y:y};
}


function timeToMove(object) {
	if (object == SNAKE) return frames%snakespeed == 0;
	else if (object == CLONE) return frames%(snakespeed+8) == 0;
	else if (object == MISSILE) return frames%5 == 0;
	else if (object == BOMB) return (frog) ? ((frames+2)%5 == 0 && frames%100 > 30 && frames%100 < 60) : ((frames+2)%20 == 0);
	else if (object == FRUIT) return (frog) ? (frames%4 == 0 && frames%100 > 30 && frames%100 < 60) : (frames%4 == 0);
}

function collectedFruit(x, y, isClone) {
	fruit.splice(fruit.findIndex(item => item.x === x && item.y === y), 1);
	playSound();
	if (isClone != true) { 
		updateScore();
		if (!infinite) lengthenSnake({x:snake[0].tail.x, y:snake[0].tail.y}, 2);
		i--;
	}

	if (walls && taken%4 == 0) shrinkBoard();
	if (portal) beammeup = true;
	if (bomb || isClone) set(1, BOMB, x, y);

	checkHighScores();
	set(numfruit, FRUIT);
}

function collision(value, array, i) {
	if (value == MISSILE) {
		playSound();
		lengthenSnake({x:snake[0].tail.x, y:snake[0].tail.y}, 2);
		array.splice(i, 1);
	} else if (value == FRUIT) { 
		collectedFruit(snake[0].head.x, snake[0].head.y);
		set(1, SNAKE, snake[0].head.x, snake[0].head.y);
	} else if (value == BOMB) reset = true;
}

function resetBoard() {
	emptycells.forEach(function(e) { set(1, EMPTY, e.x, e.y, true) });
	missiles.forEach(function(m) { if (!at(HEAD, m.x, m.y) && !at(FRUIT, m.x, m.y)) set(1, MISSILE, m.x, m.y, true) });
	snake[0].body.forEach(function(s) { if (!at(FRUIT, s.x, s.y) && !at(WALL, s.x, s.y)) set(1, SNAKE, s.x, s.y, true) });
	fruit.forEach(function(f) { if (!at(BOMB, f.x, f.y)) set(1, FRUIT, f.x, f.y, true) });
	bombs.forEach(function(b) { if (!at(SNAKE, b.x, b.y) || movebombs) set(1, BOMB, b.x, b.y, true) });	
	if (clone) snake[1].body.forEach(function(c) { set(1, CLONE, c.x, c.y, true) });
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

	infinite ? numfruit = 3 : (portal ? numfruit = 2 : numfruit = 1);
}

function gameReset() {
	unlockGames();
	if (clone) snake.pop();  //get rid of clone snake before next game
	if (!confirm("You died with " + taken + " fruit. Press OK to play again. Press cancel to pick another level.")) location.reload();
}

function gameOver(x, y) {
	return at(SNAKE, x, y) || at(BOMB, x, y) || bombs.some(e => e.x === x && e.y === y) || (snake[0].body.some(e => e.x === x && e.y === y) && (x != snake[0].head.x || y != snake[0].head.y));
}

function at(value, x, y) {
	if (value == HEAD) return (x == snake[0].head.x && y == snake[0].head.y);
	if (value == CLONEHEAD) return !clone ? false : (x == snake[1].head.x && y == snake[1].head.y);
	
	return grid.get(x, y) == value;
}

function isGame(gamelist) {
	return gamelist.includes(gametype);
}

function getDirection(value) {
	return value == MISSILE ? right : (value == FRUIT ? Math.round(Math.random()*3) : (value == BOMB ? oppDirection(snake[0].direction) : null));
}

function getAll(value) {
	return value == FRUIT ? fruit : (value == BOMB ? bombs : (value == MISSILE ? missiles : (value == EMPTY ? emptycells : null)));
}

function lengthenSnake(tail, growth_rate) {
	for (var i = 0; i < growth_rate; i++){			
		if (at(EMPTY, tail.x, tail.y)) set(1, SNAKE, tail.x, tail.y);
		snake[0].atend(tail.x, tail.y);
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
	set(1, EMPTY, fruit[0].x, fruit[0].y);   //remove this and youll get fruit forever
	snake[0].head.x = fruit[0].x;
	snake[0].head.y = fruit[0].y;
	fruit.splice(0, 1);
	beammeup = false;
}

function getGrade() {
	return (!grade) ? ("00") : ((fruitvalue < 205) ? ("ff") : ((+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16) + (+(Math.ceil((250 - fruitvalue)/3)%16)).toString(16)));
}

function shrinkBoard() {
	for (var i = wall(up); i <= wall(down); i++) {
		set(1, WALL, i, wall(up));
		set(1, WALL, i, wall(down));
		set(1, WALL, wall(left), i);
		set(1, WALL, wall(right), i);
	}
	
	ROWS = COLS -= 2;
}

function wall(side) {
	return (side == left) ? ((grid.width-COLS)/2) : ((side == right) ? (COLS-1+(grid.width-COLS)/2) : ((side == up) ? ((grid.height-ROWS)/2) : (ROWS-1+(grid.height-ROWS)/2)));
}

function flashTime(x, y) {
    return bombs[bombs.findIndex(b => b.x === x && b.y === y)].life%100 > 50 && bombs[bombs.findIndex(b => b.x === x && b.y === y)].life%100 < 99;
}