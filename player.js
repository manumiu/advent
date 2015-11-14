var SVG = {};
SVG.ns = "http://www.w3.org/2000/svg";
SVG.xlinkns = "http://www.w3.org/1999/xlink";

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
