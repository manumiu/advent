"use strict";
function Elem(t, cn) {
    cn = typeof cn !== 'undefined' ?  cn : "";
    var e = document.createElement(t);
    e.className = cn;
    return e;
}

function Div(cn) {
    return Elem("div", cn);
}

function shuffleArray(a) {
    for (var i = a.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * i);
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
}

function compWidth(elem) {
    return parseInt(window.getComputedStyle(elem).width);
}

function compHeight(elem) {
    return parseInt(window.getComputedStyle(elem).height);
}
