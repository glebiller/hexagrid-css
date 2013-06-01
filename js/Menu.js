var Menu = function( grid) {
    this.container = null;
    this.grid = grid;
    this.elements = $('<a href="javascript:void(0);" class="modeClicking">Clicking Mode</a>').click($.proxy(this.switchMode, this, 'click', 'modeClicking'))
        .add($('<a href="javascript:void(0);" class="modeDrawing">Drawing Mode</a>').click($.proxy(this.switchMode, this, 'mouseover', 'modeDrawing')))
        .add($('<hr />'))
        .add($('<a href="javascript:void(0);">Reset</a>').click($.proxy(this.grid.reset, this.grid)));
    return this;
};

Menu.prototype.switchMode = function(event, handler) {
    this.elements.removeClass('active').filter('.' + handler).addClass('active');
    this.grid.container.unbind().bind(event, $.proxy(this.grid[handler], this.grid));
    return this;
};

Menu.prototype.generate = function(container) {
    this.container = container;
    this.container.append(this.elements);
    this.switchMode('click', 'modeClicking');
    return this;
};