"use strict";
var bImage = null;
var tiles = [];
var settings = {
    audioPrefix: "music/",
    imgPrefix: "img/",
};
var mobile = navigator.userAgent.match(/Mobil/) !== null || location.hash.includes('mobile');
var numTiles = 24;
var perm = (function () {
    var perm = [];
    for (var i = 0; i < numTiles; i++) {
        perm.push(i + 1);
    }
    shuffleArray(perm);
    return perm;
})();

function SurpriseTextBox(artist, title, size) {
    this.main = Div(mobile ? "surprise-text-mobile" : "surprise-text");
    this.songTitle = Elem("div", "surprise-title");
    this.songTitle.style.fontSize = Math.floor(size * 0.10) + 'px';
    this.songTitle.innerHTML = title;
    this.main.appendChild(this.songTitle);
    this.artist = Elem("div", "surprise-artist");
    this.artist.style.fontSize = Math.floor(size * 0.08) + 'px';
    this.artist.innerHTML = artist;
    this.main.appendChild(this.artist);
}

function draw(tile) {
    var ctx = tile.doorCanvas.getContext("2d");
    var iwidth = bImage.oWidth;
    var factor = iwidth / compWidth(bImage.img);
    var width = compWidth(tile.doorCanvas);
    var height = compHeight(tile.doorCanvas);
    var ix = parseInt(tile.main.style.left);
    var iy = parseInt(tile.main.style.top);
    ix *= factor;
    iy *= factor;
    ctx.drawImage(bImage.img,
                  ix, iy, width * factor, height * factor,
                  0, 0, width, height);
}

function size(tile, x, y) {
    tile.main.style.width = x + 'px';
    tile.main.style.maxWidth = x + 'px';
    tile.main.style.height = y + 'px';
    tile.doorCanvas.width = x;
    tile.doorCanvas.height = y;
    tile.number.style.fontSize = y * tile.fontScale + 'px';
    draw(tile);
}

function move(tile, x, y) {
    var elem = tile.main;
    elem.style.top = y + 'px';
    elem.style.left = x + 'px';
    draw(tile);
}

function BImage(file) {
    this.main = Div("image-cropper");
    this.main.style.height = sizes.screenHeight + 'px';
    this.img = Elem("img");
    var me = this;
    this.img.onload = function () {
        me.oWidth = me.img.naturalWidth;
        me.oHeight = me.img.naturalHeight;
        moveTiles();
    };
    this.img.src = file;
    this.oWidth = this.img.naturlaWidth;
    this.oHeight = this.img.naturalHeight;
    this.main.appendChild(this.img);
}

BImage.prototype.zoom = function (landscape) {
    if (landscape) {
        this.img.style.width = "100%";
        this.img.style.height = "unset";
    } else {
        this.img.style.width = "unset";
        this.img.style.height = "100%";
    }
};

function createTiles(area) {
    var tileWidth = sizes.tileWidth;
    var tileHeight = sizes.tileHeight;
    for (var i = 0; i < numTiles; i++) {
        var j = perm[i];
        var song = songs[j] !== undefined ? songs[j]: null;
        var t = new lib.Tile(tileWidth, tileHeight, song, j);
        tiles.push(t);
        area.appendChild(t.main);
    }
}

function moveTiles() {
    var imageAR = bImage.oWidth / bImage.oHeight;
    var aR = sizes.screenWidth / sizes.screenHeight;
    console.log(aR, imageAR);
    var top = sizes.vborder;
    var left = sizes.hborder;
    var width = sizes.screenWidth;
    var vspace = sizes.vspace;
    var hspace = sizes.hspace;
    var tilesPerRow = sizes.tilesPerRow;
    var tileWidth = sizes.tileWidth;
    var tileHeight = sizes.tileHeight;
    var x = left;
    var y = top;
    bImage.zoom(aR > imageAR);
    for (var i = 0; i < tiles.length; i++) {
        move(tiles[i], x, y);
        x = x + tileWidth + hspace;
        if ((i + 1) % tilesPerRow === 0) {
            x = left;
            y = y + tileHeight + vspace;
        }
    }
}

function init() {
    var main = Div("area");
    main.style.layout = "block";
    main.style.width = "100%";
    main.style.height = "100%";
    var img = new BImage("landscape_v.jpg");
    bImage = img;
    main.appendChild(img.main);
    document.body.appendChild(main);
    createTiles(main);
    moveTiles();
}


function ready(f) {
    document.addEventListener("DOMContentLoaded", function(event) {
        f();
    });
}

if (!(mobile)) {
    var lib = libDesktop;
    var sizes = new lib.Sizes();
    ready(init);
} else {
    var lib = libMobile;
    var sizes = new lib.Sizes();
    ready(init);
}
