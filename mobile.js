function closeDoor(tile) {
    function close(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "right";
        elem.style.transform = "scaleX(1)";
    }
    close(tile.doorFront);
    close(tile.doorBack);
    tile.closed = true;
}

function openDoor(tile) {
    function open(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "right";
        elem.style.transform = "scaleX(0.1)";
    }
    open(tile.doorFront);
    open(tile.doorBack);
    tile.closed = false;
}
