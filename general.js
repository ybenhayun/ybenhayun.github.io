function replaceAt(old_string, char, index) {
    old_string = old_string.slice(0, index) + char + old_string.slice(index+1);
    return old_string;
}

function allInstancesOf(c, string) {
    let indices = [];
    for (let i = 0; i < string.length; i++) {
        if (string.charAt(i) == c) {
            indices.push(i);
        }
    }

    return indices;
}

function clearHTML(element) {
    element.innerHTML = "";
}