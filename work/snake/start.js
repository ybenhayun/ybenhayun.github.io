$(document).ready(function(){
	unlockGames();

	$("button").mouseover(
		function(){
			$('.descr').empty();
			var description;

			if ($(this).attr('id') == "classic") description = "<span class = 'descr'> <br><br> No tricks here. This is the same classic game you played on your Nokia cell phone.<br><br>";
			if ($(this).attr('id') == "bombs") description = "<span class = 'descr'> <br><br> This little snake loves fruit, but he seems to leave some nasty things behind as he slithers around...<br>";
			if ($(this).attr('id') == "invis") description = "<span class = 'descr'> <br><br> This guy loves to eat so much, that sometimes he forgets what he should and shouldn't be putting into his mouth.<br>";
			if ($(this).attr('id') == "walled") description = "<span class = 'descr'> <br><br> I really hope you're not claustrophobic.<br><br><br>";
			if ($(this).attr('id') == "infinity") description = "<span class = 'descr'> <br><br> You want a really long snake? Well, here you go.<br><br><br>";
			if ($(this).attr('id') == "mover") description = "<span class = 'descr'> <br><br> This snake doesn't mind chasing after the food he wants. And the food isn't going to stop moving anytime soon.<br>";
			if ($(this).attr('id') == "portal") description = "<span class = 'descr'> <br><br> This snake is years ahead of its time, and perfectly capable of bending time and space at will!<br><br>";
			if ($(this).attr('id') == "tick") description = "<span class = 'descr'> <br><br> If you can pick up your fruit quickly, this game will be a breeze. Otherwise...<br><br>";
			if ($(this).attr('id') == "flash") description = "<span class = 'descr'> <br><br> I hope you have a good memory...<br><br><br><br>";
			if ($(this).attr('id') == "dodge") description = "<span class = 'descr'> <br><br> If you can dodge a bomb, you can dodge a ball.<br><br><br>";
			if ($(this).attr('id') == "frogger") description = "<span class = 'descr'> <br><br> Keep an eye out for traffic. <br><br><br><br>";
			if ($(this).attr('id') == "disoriented") description = "<span class = 'descr'> <br><br> Good luck making sense of this one. <br><br><br>";
			if ($(this).attr('id') == "missiles") description = "<span class = 'descr'> <br><br> I hope your snake is wearing some body armor. <br><br><br>";
			if ($(this).attr('id') == "nogod") description = "<span class = 'descr'> <br><br> This is the end... sorry. <br><br><br><br>";
			
			if (localStorage.getItem($(this).attr('id')+location.pathname) == null){
				localStorage.setItem($(this).attr('id')+location.pathname, 0);
			}
			if (localStorage.getItem($(this).attr('id') + location.pathname + 'fruit') == null) {
				localStorage.setItem($(this).attr('id')+location.pathname +'fruit', 0);
			}
			
			description += "<br><br>HIGH SCORE: " + localStorage.getItem($(this).attr('id') + location.pathname) + "<br> MOST FRUIT: " + localStorage.getItem($(this).attr('id')+location.pathname+'fruit') + "</span>";
			$("#inst").append(description);
		});

	//localStorage.clear();
});

var bombscore = 35, invisscore = 25, wallscore = 20, infinscore = 25, movscore = 30, portscore = 18, 
	tickscore = 30, flashscore = 28, dodgescore = 18, frogscore = 15, disscore = 13, missilescore = 13, 
	nogodscore = 25;

function unlockGames() {
	if (localStorage.getItem('classic' + location.pathname + 'fruit') >= bombscore) document.getElementById("bombs").disabled = false;
	else document.getElementById("bombs").disabled = true;

	if (localStorage.getItem('bombs' + location.pathname + 'fruit') >= invisscore) document.getElementById("invis").disabled = false;
	else document.getElementById("invis").disabled = true;

	if (localStorage.getItem('invis' + location.pathname + 'fruit') >= wallscore) document.getElementById("walled").disabled = false;
	else document.getElementById("walled").disabled = true;

	if (localStorage.getItem('walled' + location.pathname + 'fruit') >= infinscore) document.getElementById("infinity").disabled = false;
	else document.getElementById("infinity").disabled = true;

	if (localStorage.getItem('infinity' + location.pathname + 'fruit') >= movscore) document.getElementById("mover").disabled = false;
	else document.getElementById("mover").disabled = true;

	if (localStorage.getItem('mover' + location.pathname + 'fruit') >= portscore) document.getElementById("portal").disabled = false;
	else document.getElementById("portal").disabled = true;

	if (localStorage.getItem('portal' + location.pathname + 'fruit') >= tickscore) document.getElementById("tick").disabled = false;
	else document.getElementById("tick").disabled = true;

	if (localStorage.getItem('tick' + location.pathname + 'fruit') >= flashscore) document.getElementById("flash").disabled = false;
	else document.getElementById("flash").disabled = true;
	
	if (localStorage.getItem('flash' + location.pathname + 'fruit') >= dodgescore) document.getElementById("dodge").disabled = false;
	else document.getElementById("dodge").disabled = true;

	if (localStorage.getItem('dodge' + location.pathname + 'fruit') >= frogscore) document.getElementById("frogger").disabled = false;
	else document.getElementById("frogger").disabled = true;

	if (localStorage.getItem('frogger' + location.pathname + 'fruit') >= disscore) document.getElementById("disoriented").disabled = false;
	else document.getElementById("disoriented").disabled = true;

	if (localStorage.getItem('disoriented' + location.pathname + 'fruit') >= missilescore) document.getElementById("missiles").disabled = false;
	else document.getElementById("missiles").disabled = true;

	if (localStorage.getItem('missiles' + location.pathname + 'fruit') >= nogodscore) document.getElementById("nogod").disabled = false;
	else document.getElementById("nogod").disabled = true;
}

function scoreNeeded(gametype) {
	var points;

	if (gametype == "bombs") points = bombscore
	else if (gametype == "invis") points = invisscore
	else if (gametype == "walled") points = wallscore
	else if (gametype == "infinity") points = infinscore
	else if (gametype == "mover") points = movscore
	else if (gametype == "portal") points = portscore
	else if (gametype == "tick") points = tickscore
	else if (gametype == "flash") points = flashscore
	else if (gametype == "dodge") points = dodgescore
	else if (gametype == "frogger") points = frogscore
	else if (gametype == "disoriented") points = disscore
	else if (gametype == "missiles") points = missilescore
	else if (gametype == "nogod") points = nogodscore

	document.getElementById(gametype).children[0].innerHTML = "Locked. Collect " + points + " fruit from the previous level to progress."
}