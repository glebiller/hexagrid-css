(function () {
    "use strict";
    var VIEWPORT = $(window),
        PREVIOUS_TILE_INDEX = null,
        TILE_HIDE_DELAY = 5000, TILE_WIDTH = 100, TILE_HEIGHT = 88,
        GRID = new Grid(VIEWPORT, TILE_WIDTH, TILE_HEIGHT);
    
    function flipTilesWithEvent(e) {
        var currentIndex = GRID.getTileIndex(e.pageX, e.pageY),
            currentTile = GRID.tiles[currentIndex];
        if (PREVIOUS_TILE_INDEX && PREVIOUS_TILE_INDEX !== currentIndex) {
            GRID.tiles[PREVIOUS_TILE_INDEX].setHideTimeout(TILE_HIDE_DELAY);
        }
        if (!currentTile.flipped) {
            currentTile.flip();
        }
        currentTile.setHideTimeout(TILE_HIDE_DELAY);
        PREVIOUS_TILE_INDEX = currentIndex;
        return false;
    }

    $(document).on('click', '#mouseDrawingBtn', function() {
        var mouseDrawing = !$(this).hasClass('drawing'),
            newHtml = $(this).data(mouseDrawing ? 'stop' : 'start');
        $(this).toggleClass('drawing', mouseDrawing).html(newHtml);
        if (mouseDrawing) {
            $('#flips-container').bind('mouseover', flipTilesWithEvent);
        } else {
            $('#flips-container').unbind('mouseover', flipTilesWithEvent);
            GRID.tiles[PREVIOUS_TILE_INDEX].setHideTimeout(TILE_HIDE_DELAY);
        }
    }).on('click', '#resetBtn', function() {
        $(GRID.tiles).each(function() {
            if (!this.flipped) {
                return;
            }
            this.clearHideTimeout().flip();
        });
    }).ready(function() {
        $('#viewport').css({
            width: VIEWPORT.width(),
            height: VIEWPORT.height()
        });
        GRID.generateInside($('#flips-container'));
    });
}());