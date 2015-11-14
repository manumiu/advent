var bImage = null;
var tiles = new Array();
var settings = {
    audioPrefix: "music/",
    imgPrefix: "img/",
};
var mobile = navigator.userAgent.match(/Mobil/) !== null;
var numTiles = 24;

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

function spawn(tile, x, y, area) {
    var elem = tile.main;
    elem.style.top = y + 'px';
    elem.style.left = x + 'px';
    area.appendChild(elem);
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
        for (var i in tiles) {
            draw(tiles[i]);
        }
    };
    this.img.src = file;
    this.oWidth = this.img.naturlaWidth;
    this.oHeight = this.img.naturalHeight;
    this.img.style.width = "100%";
    this.img.style.display = "block";
    this.img.style.margin = "0 auto";
    this.main.appendChild(this.img);
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
    var top = sizes.vborder;
    var left = sizes.hborder;
    var tileWidth = sizes.tileWidth;
    var tileHeight = sizes.tileHeight;
    var width = sizes.screenWidth;
    var vspace = sizes.vspace;
    var hspace = sizes.hspace;
    var tilesPerRow = sizes.tilesPerRow;
    var x = left;
    var y = top;
    var perm = [];
    for (var i = 0; i < numTiles; i++) {
        perm.push(i + 1);
    }
    shuffleArray(perm);
    for (var i = 0; i < numTiles; i++) {
        var j = perm[i];
        var song = songs[j] !== undefined ? songs[j]: null;
        var t = new lib.Tile(tileWidth, tileHeight, song, j);
        spawn(t, x, y, main);
        tiles.push(t);
        x = x + tileWidth + hspace;
        if ((i + 1) % tilesPerRow === 0) {
            x = left;
            y = y + tileHeight + vspace;
        }
    }
}


function ready(f) {
    document.addEventListener("DOMContentLoaded", function(event) {
        f();
    });
}

if (!(mobile)) {
    lib = libDesktop;
    var sizes = new lib.Sizes();
    ready(init);
} else {
    lib = libMobile;
    var sizes = new lib.Sizes();
    ready(init);
}
