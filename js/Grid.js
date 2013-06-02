/**
 * The Grid constructor.
 *
 * @param viewport {Object} The viewport.
 * @param tileWidth {number} The tile width.
 * @param tileHeight {number} The tile Height.
 * @param tileHideDelay {number} The delay before hidding a tile.
 * @constructor
 */
var Grid = function(viewport, tileWidth, tileHeight, tileHideDelay) {
    /**
     * @type {null|Object}
     */
    this.container = null;
    /**
     * @type {Array.<Tile>}
     */
    this.tiles = [];
    /**
     * @const
     * @type {number}
     */
    this.tileWidth = tileWidth;
    /**
     * @const
     * @type {number}
     */
    this.threeQuarterTileWidth = tileWidth * 3 / 4;
    /**
     * @const
     * @type {number}
     */
    this.tileHeight = tileHeight;
    /**
     * @const
     * @type {number}
     */
    this.halfTileHeight = tileHeight / 2;
    /**
     * @const
     * @type {number}
     */
    this.quarterTileHeight = tileHeight / 4;
    /**
     * @const
     * @type {number}
     */
    this.numberOfRows = Math.round(viewport.height() / this.tileHeight) + 1;
    /**
     * @const
     * @type {number}
     */
    this.numberOfColumns = Math.round(viewport.width() / this.threeQuarterTileWidth) + 1;
    /**
     * @type {null|number}
     */
    this.selectedTileIndex = null;
    var w, h, tile;
    for (w = 0; w < this.numberOfColumns; ++w) {
        for (h = 0; h < this.numberOfRows; ++h) {
            tile = new Tile(this.numberOfRows, w, h, this.tileWidth, this.tileHeight, tileHideDelay);
            this.tiles[tile.index] = tile;
        }
    }
};

/**
 * Get the tile index based on mouse coordinates.
 *
 * @private
 * @param mouseX {number} The mouse X coordinate.
 * @param mouseY {number} The mouse Y coordinate.
 * @returns {number} The tile index.
 */
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

/**
 * Add the next tiles to flip to the queue.
 *
 * @private
 * @param tilesToQueue {Array.<number>} The array of tiles index to flip next.
 * @param tile {Tile} The current tile to compute the next tiles to flip.
 * @param centerTile {Tile} The center tile which has been clicked first.
 */
Grid.prototype.addNextTiles = function(tilesToQueue, tile, centerTile) {
    if (!tile) {
        return;
    }
    switch (tile.index) {
        case centerTile.index:
            tilesToQueue.push(tile.south, tile.southWest, tile.southEast, tile.north, tile.northEast, tile.northWest);
            break;
        case centerTile.north:
            tilesToQueue.push(tile.north, tile.northEast);
            break;
        case centerTile.northEast:
            tilesToQueue.push(tile.northEast, tile.southEast);
            break;
        case centerTile.southEast:
            tilesToQueue.push(tile.southEast, tile.south);
            break;
        case centerTile.south:
            tilesToQueue.push(tile.south, tile.southWest);
            break;
        case centerTile.southWest:
            tilesToQueue.push(tile.southWest, tile.northWest);
            break;
        case centerTile.northWest:
            tilesToQueue.push(tile.northWest, tile.north);
            break;
    }
};

/**
 * Process the tiles queue and flip all the tiles in the first element
 * of the queue.
 *
 * @private
 * @this {Grid}
 * @param queue {Array.<Array.<number>>} The tiles queue to process.
 * @param centerTile {Tile} The center tile which has been clicked first.
 */
Grid.prototype.processTilesQueue = function(queue, centerTile) {
    var self = this, nextTiles = queue.shift(), tilesToQueue = [], tile;
    $.each(nextTiles, function() {
        tile = self.tiles[this];
        if (!tile) {
            return;
        }
        self.addNextTiles(tilesToQueue, tile, centerTile);
        tile.flip(true);
    });
    if (tilesToQueue.length) {
        queue.push(tilesToQueue);
    }
    if (queue.length) {
        setTimeout($.proxy(this.processTilesQueue, this, queue, centerTile), 125);
    }
};

/**
 * The Clicking mode handler.
 *
 * @expose
 * @param event {Object} The mouse click event.
 * @returns {boolean}
 */
Grid.prototype.modeClicking = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY),
        currentTile = this.tiles[currentIndex],
        queue = [
            [currentTile.index]
        ];
    this.processTilesQueue(queue, currentTile);
    return event.preventDefault();
};

/**
 * The Drawing mode handler.
 *
 * @expose
 * @param event {Object} The mouse move event.
 * @returns {boolean}
 */
Grid.prototype.modeDrawing = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY);
    if (this.selectedTileIndex !== currentIndex) {
        this.selectedTileIndex = currentIndex;
        this.tiles[currentIndex].flip(true);
    }
    return event.preventDefault();
};

/**
 * Reset all tiles to their original state.
 */
Grid.prototype.reset = function() {
    $(this.tiles).each(function() {
        this.flip(false);
    });
};

/**
 * Generate the Grid HTML into the container.
 *
 * @param container {Object} The container that will receive the HTML.
 * @returns Grid
 */
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