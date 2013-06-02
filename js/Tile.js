/**
 * The Tile constructor.
 *
 * @param numberOfRows {number} The number of rows of the Grid.
 * @param columnIndex {number} The tile column index.
 * @param rowIndex {number} The tile row index.
 * @param width {number} The tile width.
 * @param height {number} The tile height.
 * @param hideDelay {number} The tile delay.
 * @constructor
 */
var Tile = function(numberOfRows, columnIndex, rowIndex, width, height, hideDelay) {
    /**
     * @const
     * @type {number}
     */
    var modifier = (columnIndex % 2) ? 0 : 1;
    /**
     * @const
     * @type {Object}
     */
    this.tile = $(
        '<div class="flip" data-flipped="false">' +
            '<div class="face front">' +
                '<img src="img/hexa.png" width="' + width + '" height="' + height + '">' +
            '</div>' +
            '<div class="face back">' +
                '<img src="img/hexa_flipped.png" width="' + width + '" height="' + height + '" />' +
            '</div>' +
        '</div>'
    );
    /**
     *  @type {boolean}
     */
    this.flipped = false;
    /**
     * @type {null|Object}
     */
    this.hideTimeout = null;
    /**
     * @const
     * @type {number}
     */
    this.hideDelay = hideDelay;
    /**
     * @const
     * @type {number}
     */
    this.index = (columnIndex * numberOfRows) + rowIndex;
    /**
     * @const
     * @type {number}
     */
    this.north = (rowIndex === 0) ? -1 : this.index - 1;
    /**
     * @const
     * @type {number}
     */
    this.south = (rowIndex === numberOfRows - 1) ? -1 : this.index + 1;
    /**
     * @const
     * @type {number}
     */
    this.northWest = (rowIndex === 0 && modifier === 0) ? -1 : this.index - numberOfRows + modifier - 1;
    /**
     * @const
     * @type {number}
     */
    this.northEast = (rowIndex === 0 && modifier === 0) ? -1 : this.index + numberOfRows + modifier - 1;
    /**
     * @const
     * @type {number}
     */
    this.southWest = (rowIndex === numberOfRows - 1 && modifier === 1) ? -1 : this.index - numberOfRows + modifier;
    /**
     * @const
     * @type {number}
     */
    this.southEast = (rowIndex === numberOfRows - 1 && modifier === 1) ? -1 : this.index + numberOfRows + modifier;
};

/**
 * Set the tile hide timeout.
 */
Tile.prototype.setHideTimeout = function () {
    this.hideTimeout = setTimeout($.proxy(this.flip, this, false), this.hideDelay);
};

/**
 * Clear the tile hide timeout.
 */
Tile.prototype.clearHideTimeout = function() {
    clearTimeout(this.hideTimeout);
};

/**
 * Flip the current tile.
 *
 * @param flipped {boolean} The state to flip the tile.
 */
Tile.prototype.flip = function(flipped) {
    /**
     * @type {string}
     */
    var newRotate;
    if (this.flipped) {
        if (flipped) {
            this.clearHideTimeout();
            this.setHideTimeout();
            return;
        }
        newRotate = '0deg';
        this.clearHideTimeout();
    } else {
        if (!flipped) {
            return;
        }
        newRotate = '180deg';
        this.setHideTimeout();
    }
    this.flipped = flipped;
    this.tile.css('transform', 'rotate3d(1, 1, 0, ' + newRotate + ')');
};