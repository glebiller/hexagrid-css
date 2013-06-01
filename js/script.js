(function () {
    "use strict";
    var viewport = $(window), tileWidth = 100, tileHeight = 88, tileHideDelay = 5000,
        grid = new Grid(viewport, tileWidth, tileHeight, tileHideDelay),
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