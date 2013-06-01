var Grid = function(viewport, tileWidth, tileHeight, tileHideDelay) {
    this.container = null;
    this.tiles = [];
    this.tileWidth = tileWidth;
    this.threeQuarterTileWidth = tileWidth * 3 / 4;
    this.tileHeight = tileHeight;
    this.halfTileHeight = tileHeight / 2;
    this.quarterTileHeight = tileHeight / 4;
    this.numberOfRows = Math.round(viewport.height() / this.tileHeight) + 1;
    this.numberOfColumns = Math.round(viewport.width() / this.threeQuarterTileWidth) + 1;
    this.tileHideDelay = tileHideDelay;
    this.selectedTileIndex = null;
    var w, h;
    for (w = 0; w < this.numberOfColumns; ++w) {
        for (h = 0; h < this.numberOfRows; ++h) {
            this.tiles[(w * this.numberOfRows) + h] = new Tile(this.tileWidth, this.tileHeight, w % 2 ? 0 : 1);
        }
    }
    return this;
};

Grid.prototype.getTileIndex = function(mouseX, mouseY) {
    var lineX = mouseX + this.halfTileHeight,
        column = Math.floor(lineX / this.threeQuarterTileWidth),
        columnEven = column % 2 === 0,
        lineY = columnEven ? mouseY : mouseY + this.halfTileHeight,
        row = Math.floor(lineY / this.tileHeight);
    lineX = lineX - (column * this.threeQuarterTileWidth);
    lineY = lineY - (row * this.tileHeight);
    if (lineX + (lineY / 2) <  this.quarterTileHeight) {
        --column;
        if (!columnEven) {
            --row;
        }
    } else if (lineX - (lineY / 2) < - this.quarterTileHeight) {
        --column;
        if (columnEven) {
            ++row;
        }
    }
    return (column * this.numberOfRows) + row;
};

Grid.prototype.processFlippingQueue = function(queue, flipped) {
    var self = this, nextFlips = queue.shift(), tile;
    $.each(nextFlips, function() {
        tile = self.tiles[this];
        if (tile.flipped ? flipped : !flipped) {
            tile.flip();
        }
    });
    if (queue.length) {
        setTimeout($.proxy(this.processFlippingQueue, this), 100, queue, flipped);
    }
};

Grid.prototype.modeClicking = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY),
        currentTile = this.tiles[currentIndex],
        modifier = parseInt(currentTile.modifier, 10),
        queue = [
            [currentIndex + 1, currentIndex - this.numberOfRows + modifier],
            [currentIndex + this.numberOfRows + modifier, currentIndex, currentIndex - this.numberOfRows + modifier - 1],
            [currentIndex + this.numberOfRows + modifier - 1, currentIndex - 1]
        ];
    currentTile.flipped && queue.reverse();
    this.processFlippingQueue(queue, currentTile.flipped);
    return event.preventDefault();
};

Grid.prototype.modeDrawing = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY),
        currentTile = this.tiles[currentIndex];
    if (this.selectedTileIndex && this.selectedTileIndex !== currentIndex) {
        this.tiles[this.selectedTileIndex].setHideTimeout(this.tileHideDelay);
    }
    if (!currentTile.flipped) {
        currentTile.flip();
    }
    this.selectedTileIndex = currentIndex;
    return event.preventDefault();
};

Grid.prototype.reset = function() {
    $(this.tiles).each(function() {
        if (!this.flipped) {
            return;
        }
        this.clearHideTimeout().flip();
    });
    return this;
};

Grid.prototype.generate = function(container) {
    this.container = container;
    var columns = [], w, h;
    for (w = 0; w < this.numberOfColumns; ++w) {
        columns[w] = $('<div class="flips"></div>');
        for (h = 0; h < this.numberOfRows; ++h) {
            columns[w].append(this.tiles[(w * this.numberOfRows) + h].tile);
        }
    }
    this.container.css({
        width: this.numberOfColumns * this.threeQuarterTileWidth,
        height: this.numberOfRows * this.tileHeight
    }).html(columns);
    return this;
};