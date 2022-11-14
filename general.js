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

function createElement(object, html, class_name, id) {
    let new_object = document.createElement(object);
    
    new_object.setAttribute('class', class_name);
    new_object.setAttribute('id', id);
    new_object.innerHTML = html;

    return new_object;
}

function count(string, char) {
    let count = 0;

    for (let i = 0; i < string.length; i++) {
        if (string[i] == char) count++;
    }

    return count;
}
