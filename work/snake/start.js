games = [
	{ name: "classic", score: 0 },
	{ name: "bombs", score: 30 },
	{ name: "invis", score: 20 },
	{ name: "noeyes", score: 18 },
	{ name: "walled", score: 18 },
	{ name: "infinity", score: 25 },
	{ name: "mover", score: 30 },
	{ name: "portal", score: 16 },
	{ name: "tick", score: 30 },
	{ name: "flash", score: 26 },
	{ name: "dodge", score: 18 },
	{ name: "frogger", score: 15 },
	{ name: "disoriented", score: 13 },
	{ name: "missiles", score: 13 },
	{ name: "nogod", score: 22 },
];

$(document).ready(function(){
	unlockGames();

	$("button").mouseover(
		function(){
			$('span#overview').empty();
			var description = "<span id = 'overview'>";

			if ($(this).attr('id') == "classic") description += "<span id = 'descr'> <br><span id = 'name'>CLASSIC:</span> No tricks here. This is the same classic game you played on your Nokia cell phone.";
			if ($(this).attr('id') == "bombs") description += "<span id = 'descr'> <br><span id = 'name'>BOMBS:</span> This little snake loves fruit, but he seems to leave some nasty things behind as he slithers around...";
			if ($(this).attr('id') == "invis") description += "<span id = 'descr'> <br><span id = 'name'>COLORBLIND:</span> This guy loves to eat so much, that sometimes he forgets what he should and shouldn't be putting into his mouth.";
			if ($(this).attr('id') == "noeyes") description += "<span id = 'descr'> <br><span id = 'name'>20/20 VISION:</span> You might that the title of this game means your snake has really good eyesight. You'd be wrong.";
			if ($(this).attr('id') == "walled") description += "<span id = 'descr'> <br><span id = 'name'>BOXED IN:</span> I really hope you're not claustrophobic.";
			if ($(this).attr('id') == "infinity") description += "<span id = 'descr'> <br><span id = 'name'>INFINITY:</span> You want a really long snake? Well, here you go.";
			if ($(this).attr('id') == "mover") description += "<span id = 'descr'> <br><span id = 'name'>MOVERS:</span> This snake doesn't mind chasing after the food he wants. And the food isn't going to stop moving anytime soon.";
			if ($(this).attr('id') == "portal") description += "<span id = 'descr'> <br><span id = 'name'>PORTAL:</span> This snake is years ahead of its time, and perfectly capable of bending time and space at will!";
			if ($(this).attr('id') == "tick") description += "<span id = 'descr'> <br><span id = 'name'>TICK TOCK:</span> If you can pick up your fruit quickly, this game will be a breeze. Otherwise...";
			if ($(this).attr('id') == "flash") description += "<span id = 'descr'> <br><span id = 'name'>FLASH:</span> I hope you have a good memory...";
			if ($(this).attr('id') == "dodge") description += "<span id = 'descr'> <br><span id = 'name'>DODGE:</span> If you can dodge a bomb, you can dodge a ball.";
			if ($(this).attr('id') == "frogger") description += "<span id = 'descr'> <br><span id = 'name'>FROGGER:</span> Keep an eye out for traffic.";
			if ($(this).attr('id') == "disoriented") description += "<span id = 'descr'> <br><span id = 'name'>GOOD LUCK:</span> Good luck making sense of this one. ";
			if ($(this).attr('id') == "missiles") description += "<span id = 'descr'> <br><span id = 'name'>SHOTS FIRED:</span> I hope your snake is wearing some body armor. ";
			if ($(this).attr('id') == "nogod") description += "<span id = 'descr'> <br><span id = 'name'>NO SURVIVORS:</span> This is the end... sorry.";
			
			if (getScore($(this).attr('id')) == null){
				localStorage.setItem($(this).attr('id')+location.pathname, 0);
			}
			if (getFruitScore($(this).attr('id')) == null) {
				localStorage.setItem($(this).attr('id')+location.pathname +'fruit', 0);
			}
			
			description += "</span><br><span id = 'best'>HIGH SCORE: " + localStorage.getItem($(this).attr('id') + location.pathname) + "<br> MOST FRUIT: " + localStorage.getItem($(this).attr('id')+location.pathname+'fruit') + "</span>";
			
			if ($(this).attr('id') != "nogod")
				if (getFruitScore($(this).attr('id')) < scoreToContinue($(this).attr('id')))
					description += "<br><span id = 'req'> Collect " + scoreToContinue($(this).attr('id')) + " fruit to progress.</span>";
			
			description += "</span>"
				
			$("#inst").append(description);
		});

	//localStorage.clear();
});

function unlockGames() {
	for (i = 0; i < games.length-1; i++) {
		if (getFruitScore(games[i].name) >= games[i+1].score) document.getElementById(games[i+1].name).disabled = false;
		else document.getElementById(games[i+1].name).disabled = true;
	}
}

function scoreNeeded(gametype) {
	var points = games.find(games => { return games.name === gametype }).score;

	document.getElementById(gametype).children[0].innerHTML = "Locked. Collect " + points + " fruit from the previous level to progress."
}