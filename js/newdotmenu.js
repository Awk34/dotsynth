dotMenuEvent = function (e) {
    var self = this;
    this.isVisible = false;
    if (this.newDotMenu == undefined) {
        //first-time set-up
        this.newDotMenu = document.createElementNS(NS, 'svg');
        this.newDotMenu.classList.add('newDotMenu');
        DOT_CONTAINER.appendChild(this.newDotMenu);
        //recreate this menu
        var radius = layerRadius(DOT_LIST.length);
        var size = (radius + DOT_RADIUS + GAP_WIDTH) * 2;

        function pxToMm(val) {
            return val / ( newDotMenu.offsetHeight / size );
        }

        newDotMenu.setAttribute('width', size + UNITS);
        newDotMenu.setAttribute('height', size + UNITS);
        newDotMenu.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
        //add menu items
        for (var i = 0; i < DOT_LIST.length; i++) {
            var angle = 3 * Math.PI / 2 + 2 * Math.PI * i / DOT_LIST.length;
            var circle = document.createElementNS(NS, 'circle');
            var cx = size / 2 + radius * Math.cos(angle);
            var cy = size / 2 + radius * Math.sin(angle);

            //label the circle
            var name = document.createElementNS(NS, 'text');
            name.setAttribute('x', cx);
            name.setAttribute('y', cy);
            name.setAttribute('text-anchor', 'middle');
            name.setAttribute('dominant-baseline', 'middle');
            name.setAttribute('font-size', DOT_NAME_SIZE);
            name.setAttribute('fill', 'black');
            name.innerHTML = DOT_LIST[i].shortName;

            //create the circle
            circle.setAttribute('cx', cx);
            circle.setAttribute('cy', cy);
            circle.setAttribute('r', DOT_RADIUS);
            circle.setAttribute('fill', 'hsla(' + DOT_LIST[i].hue + ', 100%, ' + DOT_LIGHTNESS + ', 1)');
            circle.dotDefinition = DOT_LIST[i];
            addListeners(circle, {
                onTapStart: function (e) {
                    newDot = new Dot(e.element.dotDefinition, e.mmX + pxToMm(DOT_CONTAINER.scrollLeft), e.mmY + pxToMm(DOT_CONTAINER.scrollTop));
                    nodeArray.push(newDot);
                    self.isVisible = false;
                    newDotMenu.classList.add('hidden');
                }
            }, true);
            newDotMenu.appendChild(circle);
            newDotMenu.appendChild(name);
        }
        newDotMenu.classList.add('hidden');
    } //end first-time set-up
    if (this.isVisible) {
        this.isVisible = false;
        newDotMenu.classList.add('hidden');
    } else {
        this.isVisible = true;
        newDotMenu.classList.remove('hidden');
        //TODO: make it show properly!
        newDotMenu.style.left = e.pxX - newDotMenu.offsetWidth / 2 + "px";
        newDotMenu.style.top = e.pxY - newDotMenu.offsetHeight / 2 + "px";
    }
};

/**
 * Helper function. Determines the ideal radius of a circle of dots
 *
 * @param layer the number of dots in the circle
 */
function layerRadius(layer) {
    return Math.max(
        (DOT_RADIUS + GAP_WIDTH) / (Math.cos((Math.PI * (layer - 2)) / (2 * layer))),
        DOT_RADIUS * 2 + GAP_WIDTH
    );
}
