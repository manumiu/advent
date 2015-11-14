var bImage = null;
var tiles = new Array();
var settings = {
    audioPrefix: "music/",
    imgPrefix: "img/",
};
var mobile = navigator.userAgent.match(/Mobil/) !== null;
var numTiles = 24;

function MobileSizes() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    var unit = Math.floor(this.screenHeight / 6);

    this.hspace = 0;
    this.vspace = 0;
    this.tileWidth = this.screenWidth;
    this.tileHeight = unit;
    this.tilesPerRow = 1;
    this.hborder = 0;
    this.vborder = 0;
}

function Sizes() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;

    var hunit = Math.floor(this.screenWidth / 74);
    var vunit = Math.floor(this.screenHeight / 37);
    this.unit = Math.min(hunit, vunit);

    this.hspace = this.unit * 2;
    this.vspace = this.unit * 1;
    this.tileWidth = this.unit * 8;
    this.tileHeight = this.unit * 8;
    this.tilesPerRow = 6;
    var tilesPerColumn = numTiles /  this.tilesPerRow;
    var hb =  this.screenWidth - this.tilesPerRow * this.tileWidth - (this.tilesPerRow - 1) * this.hspace;
    this.hborder = Math.floor(hb / 2);
    var vb =  this.screenHeight - tilesPerColumn * this.tileHeight - (tilesPerColumn - 1) * this.vspace;
    this.vborder = Math.floor(vb / 2);
}

function Song(artist, title, audioFile, artistPicture) {
    this.artist = artist;
    this.title = title;
    this.audioFile = audioFile;
    this.artistPicture = artistPicture;
}

function SurpriseTextBox(artist, title, size) {
    this.main = Div("surprise-text");
    this.songTitle = Elem("div", "surprise-title");
    this.songTitle.style.fontSize = Math.floor(size * 0.10) + 'px';
    this.songTitle.innerHTML = title;
    this.main.appendChild(this.songTitle);
    this.artist = Elem("div", "surprise-artist");
    this.artist.style.fontSize = Math.floor(size * 0.08) + 'px';
    this.artist.innerHTML = artist;
    this.main.appendChild(this.artist);
}

function Surprise(song, size) {
    this.main = Div("surprise-box");
    this.textBox = new SurpriseTextBox(song.artist, song.title, size);
    this.audioControl = new AudioControl(3, song.audioFile);
    this.main.appendChild(this.textBox.main);
    this.main.appendChild(this.audioControl.main);
}

function Tile(width, height, song, number) {
    this.fontScale = 0.6;
    this.main = Div("tile-box");
    this.main.style.perspective = "1000px";
    this.main.style.perspectiveOrigin = "50% 50%";
    this.main.style.transformStyle = "preserve-3d";
    this.doorFront = Div("tile-door-front");
    this.doorCanvas = Elem("canvas", "tile-canvas");
    this.doorBack = Div("tile-door-back");
    this.number = Div("tile-door-number");
    this.number.innerHTML = number.toString();
    this.back = Div("tile-back");
    this.closed = true;
    size(this, width, height);
    if (song !== null) {
        setOnClick(this);
        this.surprise = new Surprise(song, height);
        this.back.appendChild(this.surprise.main);
        this.doorBackImage =Elem("img", "tile-artist-image");
        this.doorBackImage.src = settings.imgPrefix + song.artistPicture;
        this.doorBackImage.width = Math.floor(height * 0.95);
        //this.doorBack.appendChild(this.doorBackImage);
        this.back.appendChild(this.doorBackImage);
    }
    this.doorFront.appendChild(this.doorCanvas);
    this.doorFront.appendChild(this.number);
    this.main.appendChild(this.back);
    this.main.appendChild(this.doorBack);
    this.main.appendChild(this.doorFront);
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

function toggleDoor(tile) {
    if (tile.closed) {
        openDoor(tile);
    } else {
        closeDoor(tile);
    }
}

function setOnClick(tile) {
    tile.onClickFunction = function (event) {
        toggleDoor(tile);
    };
    tile.doorFront.addEventListener("click", tile.onClickFunction);
    tile.doorBack.addEventListener("click", tile.onClickFunction);
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

function initDesktop() {
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
        var t = new Tile(tileWidth, tileHeight, song, j);
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
    var sizes = new Sizes();
    ready(initDesktop);
} else {
    var sizes = new MobileSizes();
    ready(initDesktop);
}
