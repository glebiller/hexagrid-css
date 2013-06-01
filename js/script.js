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
                element = new Tile(TILE_WIDTH, TILE_HEIGHT, w % 2 ? 0 : 1);
                FLIPS[index] = element;
                columns[w].append(element.tile);
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
    
    function processFlippingQueue(queue, flipped) {
        var nextFlips = queue.shift();
        $.each(nextFlips, function() {
            FLIPS[this].flip();
        });
        if (queue.length) {
            setTimeout(processFlippingQueue, 100, queue, flipped);
        }
    }
    
    function flipTilesWithEvent(e) {
        var currentIndex = getTileIndex(e.pageX, e.pageY),
            currentTile = FLIPS[currentIndex];
        if (PREVIOUS_TILE_INDEX && PREVIOUS_TILE_INDEX !== currentIndex) {
            FLIPS[PREVIOUS_TILE_INDEX].setHideTimeout(TILE_HIDE_DELAY);
        }
        currentTile.setHideTimeout(TILE_HIDE_DELAY);
        currentTile.setFlipped(true).flip();
        PREVIOUS_TILE_INDEX = currentIndex;
        return false;
    }

    $(document).on('click', '#flips-container', function(e) {
        var currentIndex = getTileIndex(e.pageX, e.pageY),
            currentTile = FLIPS[currentIndex].tile,
            modifier = parseInt(currentTile.data('modifier'), 10),
            queue = [
                [currentIndex + 1, currentIndex - ROWS_SIZE + modifier],
                [currentIndex + ROWS_SIZE + modifier, currentIndex, currentIndex - ROWS_SIZE + modifier - 1],
                [currentIndex + ROWS_SIZE + modifier - 1, currentIndex - 1]
            ];
        currentTile.flipped && queue.reverse();
        processFlippingQueue(queue, currentTile.flipped);
        return false;
    }).on('click', '#mouseDrawingBtn', function() {
        var mouseDrawing = !$(this).hasClass('drawing'),
            newHtml = $(this).data(mouseDrawing ? 'stop' : 'start');
        $(this).toggleClass('drawing', mouseDrawing).html(newHtml);
        if (mouseDrawing) {
            $('#flips-container').bind('mouseover', flipTilesWithEvent);
        } else {
            $('#flips-container').unbind('mouseover', flipTilesWithEvent);
            FLIPS[PREVIOUS_TILE_INDEX].setHideTimeout(TILE_HIDE_DELAY);
        }
    }).on('click', '#resetBtn', function() {
        $(FLIPS).each(function() {
            if ($(this).flipped === false) {
                return;
            }
            $(this).clearHideTimeout().setFlipped(false).flip();
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