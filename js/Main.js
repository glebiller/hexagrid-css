(function () {
    /**
     * The tile width.
     *
     * @const
     * @type {number}
     */
    var TILE_WIDTH = 100;

    /**
     * The tile height.
     *
     * @const
     * @type {number}
     */
    var TILE_HEIGHT = 88;

    /**
     * The delay before hidding flipped tiles.
     *
     * @const
     * @type {number}
     */
    var TILE_HIDE_DELAY = 5000;

    var viewport = $(window),
        grid = new Grid(viewport, TILE_WIDTH, TILE_HEIGHT, TILE_HIDE_DELAY),
        menu = new Menu(grid);

    $(document).ready(function() {
        $('#viewport').css({
            width: viewport.width(),
            height: viewport.height()
        });
        grid.generate($('#grid'));
        menu.generate($('#menu'));
    });
}());