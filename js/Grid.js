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
    var w, h, tile;
    for (w = 0; w < this.numberOfColumns; ++w) {
        for (h = 0; h < this.numberOfRows; ++h) {
            tile = new Tile(this.numberOfRows, w, h, this.tileWidth, this.tileHeight);
            this.tiles[tile.index] = tile;
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

Grid.prototype.addNextTiles = function(nextRound, tile, centerTile) {
    if (!tile) {
        return;
    }
    switch (tile.index) {
        case centerTile.index:
            nextRound.push(tile.south, tile.southWest, tile.southEast, tile.north, tile.northEast, tile.northWest);
            break;
        case centerTile.north:
            nextRound.push(tile.north, tile.northEast);
            break;
        case centerTile.northEast:
            nextRound.push(tile.northEast, tile.southEast);
            break;
        case centerTile.southEast:
            nextRound.push(tile.southEast, tile.south);
            break;
        case centerTile.south:
            nextRound.push(tile.south, tile.southWest);
            break;
        case centerTile.southWest:
            nextRound.push(tile.southWest, tile.northWest);
            break;
        case centerTile.northWest:
            nextRound.push(tile.northWest, tile.north);
            break;
    }
};

Grid.prototype.processTilesQueue = function(queue, centerTile) {
    var self = this, nextTiles = queue.shift(), nextRound = [], tile;
    $.each(nextTiles, function() {
        tile = self.tiles[this];
        if (!tile) {
            return;
        }
        self.addNextTiles(nextRound, tile, centerTile);
        if (!tile.flipped) {
            tile.setHideTimeout(self.tileHideDelay).flip();
        }
    });
    if (nextRound.length) {
        queue.push(nextRound);
    }
    if (queue.length) {
        setTimeout($.proxy(this.processTilesQueue, this, queue, centerTile), 125);
    }
};

Grid.prototype.modeClicking = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY),
        currentTile = this.tiles[currentIndex],
        queue = [
            [currentTile.index]
        ];
    this.processTilesQueue(queue, currentTile);
    return event.preventDefault();
};

Grid.prototype.modeDrawing = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY);
    if (this.selectedTileIndex !== currentIndex) {
        var currentTile = this.tiles[currentIndex];
        if (this.selectedTileIndex) {
            this.tiles[this.selectedTileIndex].setHideTimeout(this.tileHideDelay);
        }
        if (!currentTile.flipped) {
            currentTile.flip();
        } else {
            currentTile.clearHideTimeout();
        }
        this.selectedTileIndex = currentIndex;
    }
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