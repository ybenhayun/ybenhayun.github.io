games = [
	{ name: "Classic", score: 30, title: "Classic", dev: 126 },
	{ name: "Bombs", score: 20, title: "Bombs", dev: 38 },
	{ name: "Colorblind", score: 18, title: "Colorblind", dev: 31 },
	{ name: "20/20_Vision", score: 18, title: "20/20 Vision", dev: 35 },
	{ name: "Boxed_In", score: 25, title: "Closing In", dev: 37 },
	{ name: "Infinity", score: 30, title: "And Beyond", dev: 90 },
	{ name: "Movers", score: 17, title: "Track Star", dev: 28 },
	{ name: "Portal", score: 30, title: "Portal", dev: 47 },
	{ name: "Tick_Tock", score: 28, title: "Tick Tock", dev: 38 },
	{ name: "Flash", score: 16, title: "Light Switch", dev: 31 },
	{ name: "Phantom_Snake", score: 25, title: "Phantom Snake", dev: 44 },
	{ name: "Dodge", score: 15, title: "Dodgeball", dev: 21 },
	{ name: "Frogger", score: 13, title: "Frogger", dev: 19 },
	{ name: "Good_Luck", score: 12, title: "Good Luck", dev: 15 },
	{ name: "Shots_Fired", score: 16, title: "Shots Fired", dev: 27 },
	{ name: "No_Survivors", score: 0, title: "No Survivors", dev: 12 },
];

$(document).ready(function(){
	readDescriptions();
	createButtons();
	unlockGames();
	original();

	$("button").not("#auto").mouseover(
		function(){
			if (text != null) $("#descr").html("<span class = 'name'>" + games[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))].title.toUpperCase() + "</span>: " + text[games.map(function(e) { return e.name; }).indexOf($(this).attr('id'))+1]);
			else $("#descr").html("<span class = 'name'> NAME</span>: This is where your description of your game would go if you could read! But you can't, haha!");

			if (getScore($(this).attr('id')) == null) setScore($(this).attr('id'), 0);
			if (getFruitScore($(this).attr('id')) == null) setFruitScore($(this).attr('id'), 0);
						
			$("#best").html("<p>HIGH SCORE: " + getScore($(this).attr('id')) + "<br> MOST FRUIT: " + getFruitScore($(this).attr('id')) + "</p>");

			if ($(this).attr('id') != games.at(-1).name && getFruitScore($(this).attr('id')) < scoreToContinue($(this).attr('id')))
					$("#req").html("Collect " + scoreToContinue($(this).attr('id')) + " fruit to progress.");
			else $("#req").html("Dev Score: " + games[games.findIndex(g => g.name === $(this).attr('id'))].dev + " fruit");
		});

		$("button").mouseleave(
			function(){
				$("#best").empty();
				original();
			}
		);
	//localStorage.clear();   //uncomment to clear highscores
});

function original() {
	if (text != null) description = text[0];
	else description = "This is SNAKE, with 15 alternate versions. Take a look! Use the arrows keys to move around the grid. Collect as many fruit as you can without hitting yourself (walls are ok). Good luck!";

	$("#inst").html(description);
	$("#descr").html("Want to try a different level? Place your mouse over a level to see what you're in for.");
	$("#req").html("SNAKE by Yuval Ben-Hayun")
}

function createButtons() {
	games.forEach(function(g) {
		document.getElementById("games").innerHTML += "<button id = '" + g.name + 
		"' onclick = setGame('" + g.name + "')>" + g.title + "<span class ='needed'></span></button>";
	});
}

function readDescriptions() {
	text = null;
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
		if (getFruitScore(games[i].name) >= games[i].score) { 
			document.getElementById(games[i+1].name).disabled = false;
			document.getElementById(games[i+1].name).innerHTML =  games[i+1].title;
		} else { 
			document.getElementById(games[i+1].name).disabled = true;
			document.getElementById(games[i+1].name).innerHTML = "LOCKED"
		}
	}
}

function scoreToContinue(gametype) {
	return games[games.map(function(e) { return e.name; }).indexOf(gametype)].score;
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