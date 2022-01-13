var word_length = 5;
var guesses = 6;

$(document).ready(function() {
    getWords();
    var correct_tbl = '<table><tr>';

    for(var i = 0; i < word_length; i++){
        correct_tbl += '<td><div contenteditable></div><input size = "2"></td>';
    }

    correct_tbl +=  '</tr></table>';

    $('#correct').append(correct_tbl);

    var wrong_spots_tbl = '<table>';

    for (var i = 0; i < guesses; i++) {
        wrong_spots_tbl += '<tr>';
        for (var j = 0; j < word_length; j++) {
            wrong_spots_tbl += '<td><div contenteditable></div><input size = "2"></td>'
        }
        wrong_spots_tbl += '<tr>';
    }

    wrong_spots_tbl += '</table>';

    $('#wrong_spots').append(wrong_spots_tbl);
    $('table').width(word_length*50);

    if (text != null) $("#words").append(text[0]);
    /*for (var i = 0; i < text.length; i++) {
        $("#words").append("<p>" + text[i] + "</p>");
    }*/
});

function getWords() {
	text = null;

	var txtFile = new XMLHttpRequest();
	txtFile.open("GET", "5letters.txt", true);
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
