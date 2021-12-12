$(document).ready(function(){
	$("button").mouseover(
		function(){
			$('.descr').empty();
			var description;

			var initial = "Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!"
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
			if (localStorage.getItem($(this).attr('id')+location.pathname+'fruit') == null){
				localStorage.setItem($(this).attr('id')+location.pathname, 0);
				localStoarge.setItem($(this).attr('id')+location.pathname+'fruit', 0);
			}
			description += "<br><br>HIGH SCORE: " + localStorage.getItem($(this).attr('id') + location.pathname) + "<br> MOST FRUIT: " + localStorage.getItem($(this).attr('id')+location.pathname+'fruit') + "</span>";
			$("#inst").append(description);
			//$('.descr').empty();
		});
});