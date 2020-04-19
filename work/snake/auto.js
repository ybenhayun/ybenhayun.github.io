var COLS = 26, ROWS = 26;
var EMPTY = 0, SNAKE = 1, FRUIT = 2, BOMB = 3, WALL = 4, MARKED = 5;
var left  = 0, up = 1, right = 2, down  = 3;
var larrow, uarrow, rarrow, darrow;
var a, d, s, w;
var canvas, ctx, keystate, frames, score, timer, taken, board;
var gametype, gamecounter = 0, growth_rate, paused;
var hx, hy, nx, ny, reset, bomb_reset, bombs, fruit, fruit_reset;
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

	growth_rate = 2;
	flash = false;
	COLS = 26, ROWS = 26;
	if (gametype != "disoriented"){
		larrow  = 37, uarrow = 38, rarrow = 39, darrow = 40;
		a = 65, d = 68, s = 83, w = 87;
	} else {
		larrow = 39, uarrow = 40, rarrow = 37, darrow = 38;
		a = 68, d = 65, s = 87, w = 83;
	}

	if (localStorage.getItem(gametype) == null) 
		localStorage.setItem(gametype, 0);
	if (localStorage.getItem(gametype+'fruit') == null)
		localStorage.setItem(gametype+'fruit', 0);
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
	if (gametype == "mover"||gametype == "dodge"||gametype == "invisibombs"||gametype == "bombs"||gametype == "flash")
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

function update() {
	frames++;

	if ((frames%4 == 0 && gametype == "mover")||(gametype == "disoriented" && frames%8 ==0)){
		moveFruit();
	}		

	if (frames%50 == 0 && gametype == "dodge")
		moveBombs();

	//if (frames%5 == 0){
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
	//}
}

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
	if (bombs)
		grid.set(BOMB, tail.x, tail.y);

	if (score > localStorage.getItem(gametype))
		localStorage.setItem(gametype, score);
	if (taken > localStorage.getItem(gametype+'fruit'))
		localStorage.setItem(gametype+'fruit', taken);

	if (gametype == "portal") set(FRUIT);
	set(FRUIT);

}

function gameOver(x, y){
	if (x < 0) x = COLS-1;
	if (y < 0) y = ROWS-1;
	if (x >= COLS) x = 0;
	if (y >= ROWS) y = 0;

	if (grid.get(x,y) != SNAKE && grid.get(x,y) != BOMB) return false;

	return true;
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
				if (gametype == "invisibombs")
					ctx.fillStyle = "#f00";
				else if (flash)
					ctx.fillStyle = "fff";
				else ctx.fillStyle = "#000";
			} 
			else if (atSnake(x, y)) ctx.fillStyle = "orange";

			ctx.fillRect(x*tw, y*th, tw, th);
			//ctx.rect(x*tw, y*th, tw, th);
			ctx.stroke();
		}
	}

	if (timer > 50){
		if (gametype == "disoriented")
			timer-=.2;
		else timer-=.5;
	}
	if (gametype == "tick" && timer%43 == 0) set(BOMB);
	document.getElementById("inst").innerHTML = "<span id = 'inst'>";
	document.getElementById("inst").innerHTML += "Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!</span>";
	document.getElementById("inst").innerHTML += "<br><br><br> CURRENT SCORE: " + score;
	document.getElementById("inst").innerHTML += "<br> FRUIT TAKEN: " + taken;
	document.getElementById("inst").innerHTML += "<br> FRUIT VALUE: " + Math.floor(timer);
	document.getElementById("inst").innerHTML += "<br><br><br>HIGH SCORE: " + localStorage.getItem(gametype);
	document.getElementById("inst").innerHTML += "<br>MOST FRUIT: " + localStorage.getItem(gametype+'fruit') + "</span>";

}

function moveSnake(){
	/*if ((keystate[larrow]||keystate[a]) && snake.direction != right){
		snake.direction = left;
		//if (gametype == "speed") frames+=3;
	} else if ((keystate[rarrow]||keystate[d]) && snake.direction != left){
		snake.direction = right;
		//if (gametype == "speed") frames+=3;
	} else if ((keystate[uarrow]||keystate[w]) && snake.direction != down){ 
		snake.direction = up;
		//if (gametype == "speed")frames+=3;
	} else if ((keystate[darrow]||keystate[s]) && snake.direction != up) {
		snake.direction = down;
		//if (gametype == "speed") frames+=3;
   	}

*/
	if (fruit.x < nx && canGo(nx-1, ny)) snake.direction = left;
	else if (fruit.x > nx && canGo(nx+1, ny)) snake.direction = right;
	else if (fruit.y < ny && canGo(nx, ny-1)) snake.direction = up;
	else if (fruit.y > ny && canGo(nx, ny+1)) snake.direction = down;
	else if (canGo(nx-1, ny)) snake.direction = left;
	else if (canGo(nx+1, ny)) snake.direction = right;
	else if (canGo(nx, ny-1)) snake.direction = up;
	else if (canGo(nx, ny+1)) snake.direction = down;
	
	check(nx, ny);

	for (var i = 0; i < ROWS; i++) {
		for (var j = 0; j < COLS; j++) {
			if (grid.get(i, j) == MARKED) grid.set(EMPTY, i, j);
		}
	}

	if (snake.direction == left) nx--;
	else if (snake.direction == up) ny--;
	else if (snake.direction == right) nx++;
	else if (snake.direction == down) ny++;



	if (nx < grid.width-COLS){
			nx = COLS-1;
	} else if (nx > COLS-1) {
			nx = grid.width-COLS;
	} else if (ny < grid.height-ROWS) {
			ny = ROWS-1;
	} else if (ny > ROWS-1) {
			ny = grid.height-ROWS;
	}
}

function check(x, y) {
	/*if (x-1 < grid.width-COLS){
			x = COLS-1;
	} else if (x+1 > COLS-1) {
			x = grid.width-COLS;
	} else if (y-1 < grid.height-ROWS) {
			y = ROWS-1;
	} else if (y+1 > ROWS-1) {
			y = grid.height-ROWS;
	}*/

	if (snake.direction == left && gameOver(x-1, y)) changeDir();
	else if (snake.direction == right && gameOver(x+1, y)) changeDir();
	else if (snake.direction == up && gameOver(x, y-1)) changeDir();
	else if (snake.direction == down && gameOver(x-1, y+1)) changeDir();

}

function changeDir() {
	if (!gameOver(nx+1, ny)) snake.direction = right;
	else if (!gameOver(nx-1, ny)) snake.direction = left;
	else if (!gameOver(nx+1, ny+1)) snake.direction = down;
	else if (!gameOver(nx+1, ny-1)) snake.direction = up;
}

function canGo(x, y){

//	console.log(x);
//	console.log(y);
	if (x >= COLS-1 || x <= 0 || y <= 0 || y >= ROWS-1) return true;

	if (gameOver(x, y) || grid.get(x, y) == MARKED) return false;


	if (grid.get(x, y) == EMPTY) grid.set(MARKED, x, y);

	return canGo(x+1, y) || canGo(x-1, y) || canGo(x, y-1) || canGo(x, y+1);
}

function moveBombs(){

	for (var i = 0; i < COLS; i++) {
		for (var j = 0; j < ROWS; j++){
			if (grid.get(i, j) == BOMB){
				grid.set(EMPTY, i, j);
				if (i == 0) i = COLS-1;
				if (grid.get(i-1, j) == FRUIT) fruit_reset = true;
				else fruit_reset = false;
				grid.set(BOMB, i-1, j);

				if (fruit_reset == true) grid.set(FRUIT, i-1, j);
			}
		}
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