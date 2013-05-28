(function () {
    "use strict";
    var FLIPS = [], VIEWPORT = $(window),
        PREVIOUS_TILE_INDEX = null,
        TILE_HIDE_DELAY = 5000, TILE_WIDTH = 100, TILE_PARTIAL_WIDTH = 75, TILE_HEIGHT = 88,
        QUARTER_TILE_HEIGHT = TILE_HEIGHT / 4, HALF_TILE_HEIGHT = TILE_HEIGHT / 2,
        COLUMNS_SIZE = Math.round(VIEWPORT.width() / TILE_PARTIAL_WIDTH) + 1,
        ROWS_SIZE = Math.round(VIEWPORT.height() / TILE_HEIGHT) + 1;
    
    function generateFlips() {
        var columns = [], w, h, index, element;
        for (w = 0; w < COLUMNS_SIZE; ++w) {
            columns[w] = $('<div class="flips"></div>');
            for (h = 0; h < ROWS_SIZE; ++h) {
                index = (w * ROWS_SIZE) + h;
                element = $(
                    '<div class="flip" data-flipped="false" data-modifier="' 
                        + (w % 2 ? 0 : 1) + '">\
                        <div class="face front">\
                            <img src="img/hexa.png" width="' 
                                + TILE_WIDTH + '" height="' + TILE_HEIGHT + '">\
                        </div>\
                        <div class="face back">\
                            <img src="img/hexa_flipped.png" width="' 
                                + TILE_WIDTH + '" height="' + TILE_HEIGHT + '" />\
                        </div>\
                    </div>'
                );
                FLIPS[index] = element;
                columns[w].append(element);
            }
        }
        return columns;
    }
    
    function getTileIndex(mouseX, mouseY) {
        var lineX = mouseX + HALF_TILE_HEIGHT,
            column = Math.floor(lineX / TILE_PARTIAL_WIDTH),
            columnEven = column % 2 === 0,
            lineY = columnEven ? mouseY : mouseY + HALF_TILE_HEIGHT,
            row = Math.floor(lineY / TILE_HEIGHT);
        lineX = lineX - (column * TILE_PARTIAL_WIDTH);
        lineY = lineY - (row * TILE_HEIGHT);
        if (lineX + (lineY / 2) < QUARTER_TILE_HEIGHT) {
            --column;
            if (!columnEven) {
                --row;
            }
        } else if (lineX - (lineY / 2) < -QUARTER_TILE_HEIGHT) {
            --column;
            if (columnEven) {
                ++row;
            }
        }
        return (column * ROWS_SIZE) + row;
    }
    
    function flipTile(tile, flipped) {
        tile.css('transform', 'rotate3d(1, 1, 0, ' + (flipped ? '0deg' : '180deg') + ')')
            .data('flipped', !flipped);
    }
    
    function processFlippingQueue(queue, flipped) {
        var index, nextFlips = queue.shift();
        for (index in nextFlips) {
            flipTile(FLIPS[nextFlips[index]], flipped);
        }
        if (queue.length) {
            setTimeout(processFlippingQueue, 100, queue, flipped);
        }
    }
    
    function setTileHideTimeout() {
        var previousTile = FLIPS[PREVIOUS_TILE_INDEX];
        previousTile.data('hideDelay', setTimeout(function() {
            flipTile(previousTile, true);
        }, TILE_HIDE_DELAY));
    }
    
    function clearTileHideTimeout(element) {
        var hideDelay = element.data('hideDelay');
        if (hideDelay) {
            clearTimeout(hideDelay);
        }
    }
    
    function flipTilesWithEvent(e) {
        var currentIndex = getTileIndex(e.pageX, e.pageY),
            currentTile = FLIPS[currentIndex];
        if (PREVIOUS_TILE_INDEX && PREVIOUS_TILE_INDEX !== currentIndex) {
            setTileHideTimeout();
        }
        clearTileHideTimeout(currentTile);
        flipTile(currentTile, false);
        PREVIOUS_TILE_INDEX = currentIndex;
        return false;
    }

    $(document).on('click', '#flips-container', function(e) {
        var currentIndex = getTileIndex(e.pageX, e.pageY),
            currentTile = FLIPS[currentIndex],
            flipped = currentTile.data('flipped') === true,
            modifier = parseInt(currentTile.data('modifier'), 10),
            queue = [
                [currentIndex + 1, currentIndex - ROWS_SIZE + modifier],
                [currentIndex + ROWS_SIZE + modifier, currentIndex, currentIndex - ROWS_SIZE + modifier - 1],
                [currentIndex + ROWS_SIZE + modifier - 1, currentIndex - 1]
            ];
        flipped && queue.reverse();
        processFlippingQueue(queue, flipped);
        return false;
    }).on('click', '#mouseDrawingBtn', function(e) {
        var mouseDrawing = !$(this).hasClass('drawing'),
            newHtml = $(this).data(mouseDrawing ? 'stop' : 'start');
        $(this).toggleClass('drawing', mouseDrawing).html(newHtml);
        if (mouseDrawing) {
            $('#flips-container').bind('mouseover', flipTilesWithEvent);
        } else {
            $('#flips-container').unbind('mouseover', flipTilesWithEvent);
            setTileHideTimeout();
        }
    }).on('click', '#resetBtn', function(e) {
        $(FLIPS).each(function() {
            if ($(this).data('flipped') === false) {
                return;
            }
            clearTileHideTimeout($(this));
            flipTile($(this), true);
        });
    }).ready(function() {
        $('#viewport').css({
            width: VIEWPORT.width(),
            height: VIEWPORT.height()
        });
        $('#flips-container').css({
            width: COLUMNS_SIZE * TILE_PARTIAL_WIDTH,
            height: ROWS_SIZE * TILE_HEIGHT
        }).html(generateFlips());
    });
}());