var Tile = function(numberOfRows, columnIndex, rowIndex, width, height) {
    var modifier = (columnIndex % 2) ? 0 : 1;
    this.tile = $(
        '<div class="flip" data-flipped="false">\
            <div class="face front">\
                <img src="/img/hexa.png" width="' + width + '" height="' + height + '">\
            </div>\
            <div class="face back">\
                <img src="/img/hexa_flipped.png" width="' + width + '" height="' + height + '" />\
            </div>\
        </div>'
    );
    this.flipped = false;
    this.hideTimeout = null;
    this.index = (columnIndex * numberOfRows) + rowIndex;
    this.north = (rowIndex === 0) ? -1 : this.index - 1;
    this.south = (rowIndex === numberOfRows - 1) ? -1 : this.index + 1;
    this.northWest = (rowIndex === 0 && modifier === 0) ? -1 : this.index - numberOfRows + modifier - 1;
    this.northEast = (rowIndex === 0 && modifier === 0) ? -1 : this.index + numberOfRows + modifier - 1;
    this.southWest = (rowIndex === numberOfRows - 1 && modifier === 1) ? -1 : this.index - numberOfRows + modifier;
    this.southEast = (rowIndex === numberOfRows - 1 && modifier === 1) ? -1 : this.index + numberOfRows + modifier;
    return this;
};

Tile.prototype.setFlipped = function(flipped) {
    this.flipped = flipped;
    return this;
};

Tile.prototype.setHideTimeout = function (hideDelay) {
    var self = this;
    this.hideTimeout = setTimeout(function() {
        self.setFlipped(true).flip();
    }, hideDelay);
    return this;
};

Tile.prototype.clearHideTimeout = function() {
    clearTimeout(this.hideTimeout);
    this.hideTimeout = null;
    return this;
};

Tile.prototype.flip = function() {
    this.flipped = !this.flipped;
    this.tile.css('transform', 'rotate3d(1, 1, 0, ' + (this.flipped ? '180deg' : '0deg') + ')')
        .data('flipped', !this.flipped);
    return this;
};