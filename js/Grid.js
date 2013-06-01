var Grid = function(viewport, tileWidth, tileHeight) {
    this.tiles = [];
    this.tileWidth = tileWidth;
    this.threeQuarterTileWidth = tileWidth * 3 / 4;
    this.tileHeight = tileHeight;
    this.halfTileHeight = tileHeight / 2;
    this.quarterTileHeight = tileHeight / 4;
    this.numberOfRows = Math.round(viewport.height() / this.tileHeight) + 1;
    this.numberOfColumns = Math.round(viewport.width() / this.threeQuarterTileWidth) + 1;
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
    var self = this, nextFlips = queue.shift();
    $.each(nextFlips, function() {
        self.tiles[this].flip();
    });
    if (queue.length) {
        setTimeout($.proxy(this.processFlippingQueue, this), 100, queue, flipped);
    }
};

Grid.prototype.handleClick = function(event) {
    var currentIndex = this.getTileIndex(event.pageX, event.pageY),
        currentTile = this.tiles[currentIndex].tile,
        modifier = parseInt(currentTile.data('modifier'), 10),
        queue = [
            [currentIndex + 1, currentIndex - this.numberOfRows + modifier],
            [currentIndex + this.numberOfRows + modifier, currentIndex, currentIndex - this.numberOfRows + modifier - 1],
            [currentIndex + this.numberOfRows + modifier - 1, currentIndex - 1]
        ];
    currentTile.flipped && queue.reverse();
    this.processFlippingQueue(queue, currentTile.flipped);
    return false;
};

Grid.prototype.generateInside = function(container) {
    var columns = [], w, h;
    for (w = 0; w < this.numberOfColumns; ++w) {
        columns[w] = $('<div class="flips"></div>');
        for (h = 0; h < this.numberOfRows; ++h) {
            columns[w].append(this.tiles[(w * this.numberOfRows) + h].tile);
        }
    }
    container.css({
        width: this.numberOfColumns * this.tilePartialWidth,
        height: this.numberOfRows * this.tileHeight
    }).html(columns).click($.proxy(this.handleClick, this));
    return this;
};