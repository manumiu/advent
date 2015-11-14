function closeDoor(tile) {
    function close(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "left";
        //elem.style.transform = "rotate3d(0, 0, 0, 0deg)";
        elem.style.transform = "translate(0px)";
    }
    close(tile.doorFront);
    close(tile.doorBack);
    tile.closed = true;
}

function openDoor(tile) {
    function open(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "left";
        //elem.style.transform = "rotate3d(0, -1, 0, 160deg)";
        elem.style.transform = "translate(" + sizes.tileWidth * 0.9 + "px)";
    }
    open(tile.doorFront);
    open(tile.doorBack);
    tile.closed = false;
}
