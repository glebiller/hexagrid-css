/**
 * The Menu constructor.
 *
 * @param grid {Grid} The Grid to bind this menu to.
 * @constructor
 */
var Menu = function(grid) {
    /**
     * @type {null|Object}
     */
    this.container = null;
    /**
     * @const
     * @type {Grid}
     */
    this.grid = grid;
    /**
     * @const
     * @type {Object}
     */
    this.elements = $('<a href="javascript:void(0);" class="modeClicking">Clicking Mode</a>').click($.proxy(this.switchMode, this, 'click', 'modeClicking'))
        .add($('<a href="javascript:void(0);" class="modeDrawing">Drawing Mode</a>').click($.proxy(this.switchMode, this, 'mouseover', 'modeDrawing')))
        .add($('<hr />'))
        .add($('<a href="javascript:void(0);">Reset</a>').click($.proxy(this.grid.reset, this.grid)));
};

/**
 * Switch the Grid to the given mode.
 *
 * @private
 * @param event {string} The mouse event type to bind the handler.
 * @param handler {string} The handler to bind with the event type.
 */
Menu.prototype.switchMode = function(event, handler) {
    this.elements.removeClass('active').filter('.' + handler).addClass('active');
    this.grid.container.unbind().bind(event, $.proxy(this.grid[handler], this.grid));
};

/**
 * Generate the menu inside the container.
 *
 * @private
 * @param container {Object} The container to generate the menu into.
 */
Menu.prototype.generate = function(container) {
    this.container = container;
    this.container.append(this.elements);
    this.switchMode('click', 'modeClicking');
};