var SVG = {};
SVG.ns = "http://www.w3.org/2000/svg";
SVG.xlinkns = "http://www.w3.org/1999/xlink";
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

function AudioPlayer () {
    this.main = Elem("audio");
    this.type = "ogg";
    if(this.main.canPlayType("audio/mpeg") == "maybe" ||
       this.main.canPlayType("audio/mpeg") == "probably") {
        this.type = "mp3";
    }
    document.body.appendChild(this.main);
    this.pos = 0;
    this.audioControl = null;
}

AudioPlayer.prototype.play = function () {
    this.main.play();
};

AudioPlayer.prototype.pause = function () {
    this.main.pause();
};

AudioPlayer.prototype.setTrack = function (name) {
    this.main.src = settings.audioPrefix + name + "." + this.type;
};

AudioPlayer.prototype.seek = function (percent) {
    this.main.currentTime = percent / 100 * this.main.duration;
};

AudioPlayer.prototype.currentPos = function () {
    return Math.floor(100 * this.main.currentTime / this.main.duration);
};

AudioPlayer.prototype.registerControl = function(audioControl, file) {
    var self = this;
    if (this.audioControl === audioControl) {
        return;
    }
    if (this.audioControl !== null) {
        this.audioControl.detach();
    }
    this.main.pause();
    this.audioControl = audioControl;
    this.setTrack(file);
    this.timeCallback = function () {
        var percent = self.currentPos();
        self.audioControl.update(percent);
    };
    this.endCallback = function () {
        self.audioControl.end();
    };
    this.main.addEventListener("timeupdate", self.timeCallback);
    this.main.addEventListener("ended", self.endCallback);
};


var audioPlayer = new AudioPlayer();

function PlayIcon(size) {
    var self = this;
    this.main = document.createElementNS(SVG.ns, "svg");
    this.main.setAttribute("width", size);
    this.main.setAttribute("height", size);
    this.main.setAttribute("viewBox", "0 0 24 24");
    this.main.setAttribute("class", "surprise-play-icon");
    this.main.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", SVG.xlinkns);
    this.path = document.createElementNS(SVG.ns, "path");
    this.playPath = "M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 "
        + "2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z";
    this.pausePath = "M9 16h2V8H9v8zm3-14C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 "
        + "2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-4h2V8h-2v8z"
    this.path.setAttribute("d", this.playPath);
    this.main.appendChild(this.path);
}

PlayIcon.prototype.pause = function () {
    this.path.setAttribute("d", this.playPath);
};

PlayIcon.prototype.play = function () {
    this.path.setAttribute("d", this.pausePath);
};

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

function Knob(size, className, parent) {
    var self = this;
    this.parent = parent;
    this.main = Div(className);
    this.main.style.width = size + 'px';
    this.main.style.height = size + 'px';
    this.main.style.right = (-(size / 2)) + 'px';
    this.main.style.borderRadius = size / 2 + 'px';
    this.mouseEnter = function () {
        var bigSize = size * 2;
        self.main.style.width = bigSize + 'px';
        self.main.style.height = bigSize + 'px';
        self.main.style.right = (-(bigSize / 2)) + 'px';
        self.main.style.borderRadius = bigSize / 2 + 'px';
    };
    this.mouseLeave = function () {
        self.main.style.width = size + 'px';
        self.main.style.height = size + 'px';
        self.main.style.right = (-(size / 2)) + 'px';
        self.main.style.borderRadius = size / 2 + 'px';
    };
    this.mouseDown = function (event) {
        // preventDefault to prohibit text selection on mousemove
        event.preventDefault();
        self.parent.seeking = true;
        self.main.addEventListener("mousemove", self.parent.mouseMoved);
    };
    this.mouseUp = function (event) {
        self.parent.seeking = false;
        self.main.removeEventListener("mousemove", self.parent.mouseMoved);
    };
    this.enable = function () {
        self.main.addEventListener("mousedown", self.mouseDown);
        self.main.addEventListener("mouseup", self.mouseUp);
        self.main.addEventListener("mouseenter", self.mouseEnter);
        self.main.addEventListener("mouseleave", self.mouseLeave);
    };
    this.disable = function () {
        self.main.removeEventListener("mousedown", self.mouseDown);
        self.main.removeEventListener("mouseup", self.mouseUp);
        self.main.removeEventListener("mouseenter", self.mouseEnter);
        self.main.removeEventListener("mouseleave", self.mouseLeave);
    };
}

function AudioControl(h, file) {
    var self = this;
    this.file = file;
    this.main = Div("audio-control-box");
    this.playIcon = new PlayIcon(24);
    this.outer = Div("progress-outer");
    this.bar = Div("progress-inner");
    this.knob = new Knob(h*4, "progress-knob", this);
    this.main.appendChild(this.playIcon.main);
    this.outer.appendChild(this.bar);
    this.bar.appendChild(this.knob.main);
    this.main.appendChild(this.outer);
    this.outer.style.width = 'calc(100% - ' + 4 * h + 'px)';
    this.outer.style.height = h + 'px'
    this.bar.style.width = "0%";
    this.bar.style.height = h + 'px'
    this.outer.style.left = 2 * h + 'px';
    this.outer.style.bottom = 2 * h + 'px';
    this.mouseMoved = function (event) {
        if (self.active) {
            event.preventDefault();
            var percent = self.handlePositionEvent(event);
            self.set(percent);
        }
    };
    this.seek = function(event) {
        if (self.active) {
            var percent = self.handlePositionEvent(event);
            self.set(percent);
            audioPlayer.seek(percent);
        }
    };
    this.end = function() {
        self.playIcon.pause();
        this.playing = false;
    };
    this.handlePositionEvent = function (event) {
        var boundingRect = self.outer.getBoundingClientRect();
        var x = event.pageX - boundingRect.left;
        var percent = 0;
        if ( x < 0 ) {
            percent = 0;
        } else if (x < boundingRect.width) {
            percent = Math.floor(100 * x / boundingRect.width);
        } else {
            percent = 100;
        }
        return percent;
    };
    this.bar.addEventListener("click", function(event) {
        self.seek(event);
    });
    this.outer.addEventListener("click", function(event) {
        self.seek(event);
    });
    this.playIcon.main.addEventListener("click", function () { self.togglePlayPause(); });
    this.playing = false;
    this.active = false;
    this.seeking = false;
}

AudioControl.prototype.stop = function () {
    this.pause();
    this.set(0);
};

AudioControl.prototype.pause = function () {
    this.playIcon.pause();
    audioPlayer.pause();
    this.playing = false;
};

AudioControl.prototype.play = function () {
    audioPlayer.registerControl(this, this.file);
    this.playIcon.play();
    audioPlayer.play();
    this.playing = true;
    this.active = true;
    this.knob.enable();
};

AudioControl.prototype.togglePlayPause = function () {
    if (this.playing) {
        this.pause();
    } else {
        this.play();
    }
};

AudioControl.prototype.detach = function () {
    this.stop();
    this.active = false;
    this.knob.disable();
};

AudioControl.prototype.update = function (percent) {
    if (!(this.seeking)) {
        this.set(percent);
    }
};

AudioControl.prototype.set = function (percent) {
    this.bar.style.width = percent + '%';
};

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
    this.size(width, height);
    if (song !== null) {
        this.setOnClick();
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

Tile.prototype.draw = function() {
    var ctx = this.doorCanvas.getContext("2d");
    var iwidth = bImage.oWidth;
    var factor = iwidth / compWidth(bImage.img);
    var width = compWidth(this.doorCanvas);
    var height = compHeight(this.doorCanvas);
    var ix = parseInt(this.main.style.left);
    var iy = parseInt(this.main.style.top);
    ix *= factor;
    iy *= factor;
    ctx.drawImage(bImage.img,
                  ix, iy, width * factor, height * factor,
                  0, 0, width, height);
};

Tile.prototype.size = function(x, y=x) {
    this.main.style.width = x + 'px';
    this.main.style.height = y + 'px';
    this.doorCanvas.width = x;
    this.doorCanvas.height = y;
    this.number.style.fontSize = y * this.fontScale + 'px';
    this.draw();
};

Tile.prototype.spawn = function(x, y, area) {
    var elem = this.main;
    this.main.style.top = y + 'px';
    this.main.style.left = x + 'px';
    area.appendChild(elem);
    this.draw();
};

Tile.prototype.toggleDoor = function () {
    if (this.closed) {
        this.open();
    } else {
        this.close();
    }
};

Tile.prototype.close = function () {
    function close(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "left";
        //elem.style.transform = "rotate3d(0, 0, 0, 0deg)";
        elem.style.transform = "translate(0px)";
    }
    close(this.doorFront);
    close(this.doorBack);
    this.closed = true;
};

Tile.prototype.open = function () {
    function open(elem) {
        elem.style.transitionProperty = "transform";
        elem.style.transitionDuration = "2s";
        elem.style.transformOrigin = "left";
        //elem.style.transform = "rotate3d(0, -1, 0, 160deg)";
        elem.style.transform = "translate(" + sizes.tileWidth * 0.9 + "px)";
    }
    open(this.doorFront);
    open(this.doorBack);
    this.closed = false;
};

Tile.prototype.setOnClick = function () {
    var self = this;
    this.onClickFunction = function (event) {
        self.toggleDoor();
    };
    this.doorFront.addEventListener("click", this.onClickFunction);
    this.doorBack.addEventListener("click", this.onClickFunction);
};

function BImage(file) {
    this.main = Div("image-cropper");
    this.main.style.height = sizes.screenHeight + 'px';
    this.img = Elem("img");
    var me = this;
    this.img.onload = function () {
        me.oWidth = me.img.naturalWidth;
        me.oHeight = me.img.naturalHeight;
        for (var i in tiles) {
            tiles[i].draw();
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
        t.spawn(x, y, main);
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
/*
    function initMobile() {
        var main = Div("mobile-main");
        document.body.appendChild(main);
        var fullSize = window.innerWidth;
        var size = Math.floor(fullSize * 0.7);
        var fontSmall = Math.floor(size * 0.08);
        var fontBig = Math.floor(size * 0.10);
        var iconSize = Math.floor(size * 0.2);
        var perm = [];
        for (var i = 0; i < 24; i++) {
            perm.push(i + 1);
        }
        shuffleArray(perm);
        var y = 10;
        for (var i = 0; i < 24; i++) {
            var j = perm[i];
            var song = songs[j] !== undefined ? songs[j]: null;
            var t = new MobileTile(size, song, j);
            if (song !== null) {
                t.surprise.textBox.artist.style.fontSize = fontSmall + 'px';
                t.surprise.textBox.songTitle.style.fontSize = fontBig + 'px';
                t.surprise.audioControl.outer.style.visibility = "hidden";
                t.surprise.audioControl.playIcon.main.setAttribute("width", iconSize);
                t.surprise.audioControl.playIcon.main.setAttribute("height", iconSize);
            }
            var box = Div("mobile-box");
            box.style.width = size + 'px';
            box.style.bottom = 0 + 'px';
            box.style.right = 0 + 'px';
            t.spawn(y, box);
            main.appendChild(box);
            y += 10 + size;
        }
    }

    function MobileTile(size, song, number) {
        this.fontScale = 0.4;
        this.main = Div("tile-box");
        this.doorFront = Div("tile-door-front");
        this.doorFront.style.background = "#888888";
        this.number = Div("tile-door-number");
        this.number.innerHTML = number.toString();
        this.back = Div("tile-back");
        this.main.style.width = size + 'px';
        this.main.style.height = size + 'px';
        this.number.style.fontSize = size * this.fontScale + 'px';
        if (song !== null) {
            this.setOnClick();
            this.surprise = new Surprise(song);
            this.back.appendChild(this.surprise.main);
        }
        this.doorFront.appendChild(this.number);
        this.main.appendChild(this.back);
        this.main.appendChild(this.doorFront);
    };

    MobileTile.prototype.setOnClick = function () {
        var self = this;
        this.onClickFunction = function (event) {
            console.log("foo");
            self.doorFront.style.visibility = "hidden";
        };
        this.doorFront.addEventListener("click", this.onClickFunction);
    };

    MobileTile.prototype.spawn = function(y, area) {
        var elem = this.main;
        this.main.style.top = y + 'px';
        area.appendChild(elem);
    };

    ready(initMobile);
}
*/
