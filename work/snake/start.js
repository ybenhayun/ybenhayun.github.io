games = [
	{ name: "Classic", score: 0},
	{ name: "Bombs", score: 30 },
	{ name: "Colorblind", score: 20 },
	{ name: "20/20_Vision", score: 18 },
	{ name: "Boxed_In", score: 18 },
	{ name: "Infinity", score: 22 },
	{ name: "Movers", score: 30 },
	{ name: "Portal", score: 16 },
	{ name: "Tick_Tock", score: 30 },
	{ name: "Flash", score: 25 },
	{ name: "Phantom_Snake", score: 17 },
	{ name: "Dodge", score: 20 },
	{ name: "Frogger", score: 15 },
	{ name: "Good_Luck", score: 13 },
	{ name: "Shots_Fired", score: 12 },
	{ name: "No_Survivors", score: 22 },
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

			if (text != null) description = text[0] + text[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))+1];
			else description = "<span id = 'inst'><br>You're in local mode!  This would be the instructions! You're in local mode! This would be the instructions! You're in local mode! This would be the instructions!</span>" + "<span id = 'descr'><br><span id = 'name'> NAME:</span> This is where your description would go!</span>";

			if (getScore($(this).attr('id')) == null) localStorage.setItem($(this).attr('id')+location.pathname, 0);
			if (getFruitScore($(this).attr('id')) == null) localStorage.setItem($(this).attr('id')+location.pathname +'fruit', 0);
						
			description += "<br><span id = 'best'>HIGH SCORE: " + localStorage.getItem($(this).attr('id') + location.pathname) + "<br> MOST FRUIT: " + localStorage.getItem($(this).attr('id')+location.pathname+'fruit') + "</span>";
			
			if ($(this).attr('id') != games.at(-1).name)
				if (getFruitScore($(this).attr('id')) < scoreToContinue($(this).attr('id')))
					description += "<br><span id = 'req'> Collect " + scoreToContinue($(this).attr('id')) + " fruit to progress.</span>";
			
			description += "</span>"
				
			$("#overview").append(description);

			

		});

	//localStorage.clear();
});

function createButtons() {
	for (var i = 0; i < games.length; i++) {
		document.getElementById("games").innerHTML += "<button id = '" + games[i].name + 
		"' onclick = setGame('" + games[i].name + "')> " + games[i].name + " <span class ='needed'></span></button>";
	}

	for (var i = 0; i < games.length; i++) {
		scoreNeeded(games[i].name);
	}
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