$(document).ready(function(){
	$("button").hover(
		function(){
			$('.descr').empty();
			var description;

			var initial = "Use WASD or the arrows keys to move around the grid. Collect as many fruit as you can without dying. Good luck!"
			if ($(this).attr('id') == "classic") description = "<span class = 'descr'> <br><br> No tricks here. This is the same classic game you played on your Nokia cell phone. </span>";
			if ($(this).attr('id') == "bombs") description = "<span class = 'descr'> <br><br> This little snake loves fruit, but he seems to leave some nasty things behind as he slithers around...</span>"
			if ($(this).attr('id') == "invisibombs") description = "<span class = 'descr'> <br><br> This guy loves to eat so much, that sometimes he forgets what he should and shouldn't be putting into his mouth. </span>"
			if ($(this).attr('id') == "walled") description = "<span class = 'descr'> <br><br> I really hope you're not claustrophobic.</span>"
			if ($(this).attr('id') == "infinity") description = "<span class = 'descr'> <br><br> You want a really long snake? Well, here you go. </span>"
			if ($(this).attr('id') == "mover") description = "<span class = 'descr'> <br><br> This snake doesn't mind chasing after the food he wants. And the food isn't going to stop moving anytime soon. </span>"
			if ($(this).attr('id') == "disoriented") description = "<span class = 'descr'> <br><br> You're snake's a little disoriented. So is the food you're trying to eat. And so are you. Basically, nobody has any idea what they're doing.</span>"
			if ($(this).attr('id') == "portal") description = "<span class = 'descr'> <br><br> This snake is years ahead of its time, and perfectly capable of bending time and space at will! </span>"
			if ($(this).attr('id') == "speed") description = "<span class = 'descr'> <br><br> This snake doesn't wait for no man. Be careful around corners with him. </span>"
			if ($(this).attr('id') == "tick") description = "<span class = 'descr'> <br><br> If you can pick up your fruit quickly, this game will be a breeze. Otherwise... </span>"

			$("#inst").append(description);
		}, function(){
			//$('.descr').empty();
		});
});