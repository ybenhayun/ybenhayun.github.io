games = [
	{ name: "Classic", score: 0, title: "Classic" },
	{ name: "Bombs", score: 0, title: "Bombs" },
	{ name: "Colorblind", score: 0, title: "Colorblind" },
	{ name: "20/20_Vision", score: 0, title: "20/20 Vision" },
	{ name: "Boxed_In", score: 0, title: "Boxed In" },
	{ name: "Infinity", score: 0, title: "Infinity" },
	{ name: "Movers", score: 0, title: "Movers" },
	{ name: "Portal", score: 0, title: "Portal" },
	{ name: "Tick_Tock", score: 0, title: "Tick Tock" },
	{ name: "Flash", score: 0, title: "Flash" },
	{ name: "Phantom_Snake", score: 0, title: "Phantom Snake" },
	{ name: "Dodge", score: 0, title: "Dodge" },
	{ name: "Frogger", score: 0, title: "Frogger" },
	{ name: "Good_Luck", score: 0, title: "Good Luck" },
	{ name: "Shots_Fired", score: 0, title: "Shots Fired" },
	{ name: "No_Survivors", score: 0, title: "No Survivors" },
];

var text = null;

$(document).ready(function(){
	readDescriptions();
	createButtons();
	unlockGames();

	if (text != null) description = text[0];
	else description = "<span id = 'inst'><br>Use the arrows keys to move around the grid. Collect as many fruit as you can without hitting yourself (walls are ok). Good luck!</span>";

	$("#overview").html(description);

	$("button").mouseover(
		function(){
			$('#overview').empty();

			if (text != null) description = text[0] + "<span id = 'descr'> <br><span id = 'name'>" + 
			games[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))].title.toUpperCase() + ": " + text[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))+1];
			else description = "<span id = 'inst'><br>You're in local mode!  This would be the instructions! You're in local mode! This would be the instructions! You're in local mode! This would be the instructions!</span>" + "<span id = 'descr'><br><span id = 'name'> NAME:</span> This is where your description would go!</span>";

			if (getScore($(this).attr('id')) == null) setScore($(this).attr('id'), 0);
			if (getFruitScore($(this).attr('id')) == null) setFruitScore($(this).attr('id'), 0);
						
			description += "<br><span id = 'best'>HIGH SCORE: " + getScore($(this).attr('id')) + "<br> MOST FRUIT: " + getFruitScore($(this).attr('id')) + "</span>";
			
			if ($(this).attr('id') != games.at(-1).name)
				if (getFruitScore($(this).attr('id')) < scoreToContinue($(this).attr('id')))
					description += "<br><span id = 'req'> Collect " + scoreToContinue($(this).attr('id')) + " fruit to progress.</span>";
			
			description += "</span>"
				
			$("#overview").append(description);

			

		});
	//localStorage.clear();   //uncomment to clear highscores
});

function createButtons() {
	games.forEach(function(g) {
		document.getElementById("games").innerHTML += "<button id = '" + g.name + 
		"' onclick = setGame('" + g.name + "')> " + g.title + " <span class ='needed'></span></button>";
	});

	games.forEach(function(g) { scoreNeeded(g.name) });
}

function readDescriptions() {

	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "descriptions.txt", true);
	txtFile.onreadystatechange = function() {
  		if (txtFile.readyState === 4) {  // document is ready to parse.
    		if (txtFile.status === 200) {  // file is found
      			allText = txtFile.responseText; 
      			text = txtFile.responseText.split("\n");
    		}
  		}
	}

	txtFile.send(null);
}

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

function scoreToContinue(gametype) {
	return games[games.map(function(e) { return e.name; }).indexOf(gametype)+1].score;
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