var letters = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
var used;
var score;

$(document).ready(function(){
    restart();

    $(document).keypress(function(e) {
        if ((e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 97 && e.keyCode <= 122)) {
            var letter = String.fromCharCode(e.which).toUpperCase();
            $("." + letter).css({ background: "blue" });

            if (!used.includes(letter)) $("#word").append(letter);
        } else if (e.keyCode == 32 || e.keyCode == 13) {
            if (!word_list.includes($("#word").html())) {
                var is_word = false;
            } else is_word = true;
            $("#word").empty();

            for (var i = 65; i <= 90; i++) {
                var letter = String.fromCharCode(i).toUpperCase();

                if ($("." + letter).css("background-color") == "rgb(0, 0, 255)") {
                    if (is_word) {
                        used.push(letter);
                        $("." + letter).remove();
                    } else {
                        $("." + letter).css({background: "#2b2b2b"});
                    }
                }
            }

            score = 26 - used.length;
            $(".points").html(score + " letters")
        }

        // $("button").unbind();
    });

    $(document).keyup(function(e) {
        if (e.keyCode == 8) {
            var word = $("#word").html();
            var letter = word.at(-1);
            $("#word").html(word.slice(0, -1));

            if (!$("#word").html().includes(letter))
                $("." + letter).css({background: "#2b2b2b"});

        }
    });

    $("button").click(function(e) {
        if (e.keyCode != 13 || e.keyCode != 32) restart();
    });
});

function restart() {
    $(".top").empty();

    for (let i = 0; i < 10; i++) {
        $(".top").append("<div><div class = " + letters[i] + "> " + letters [i] + " </div></div>");
    }

    $(".middle").empty();
    for (let i = 10; i < 19; i++) {
        $(".middle").append("<div><div class = " + letters[i] + "> " + letters [i] + " </div></div>");
    }

    $(".bottom").empty();
    for (let i = 19; i < 26; i++) {
        $(".bottom").append("<div><div class = " + letters[i] + "> " + letters [i] + " </div></div>");
    }

    score = 26;
    used = [];
    $(".points").remove();
    $("#score").append("<div class = 'points'>" + score + " letters</div>")
}