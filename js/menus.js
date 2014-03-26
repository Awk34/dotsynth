//for side menus

var menuLeft = document.getElementById( 'leftMenu' ),
    menuRight = document.getElementById( 'rightMenu' ),
    showLeft = document.getElementById( 'showLeft' ),
    dotContainer = document.getElementById( 'new-dot-container' ),
    showRight = document.getElementById( 'showRight' );

loadDots = function() {
    var i;
    for(i=0; i<DOT_LIST.length; i++) {
        var svgElement = document.createElementNS(NS, 'svg');
        var circleElement = document.createElementNS(NS, 'circle');
        var size = 2*DOT_RADIUS;
        var cx = size/2 + UNITS;
        var cy = size/2 + UNITS;
        svgElement.setAttribute('width', size + UNITS);
        svgElement.setAttribute('height', size + UNITS);


        //label the circle
        var name = document.createElementNS(NS, 'text');
        name.setAttribute('x', cx.toString());
        name.setAttribute('y', cy.toString());
        //TODO: put in .css
        name.setAttribute('text-anchor', 'middle');
        name.setAttribute('dominant-baseline', 'middle');
        name.setAttribute('font-size', DOT_NAME_SIZE + UNITS);
        name.setAttribute('fill', 'black');
        name.innerHTML = DOT_LIST[i].shortName;

        //create the circle
        circleElement.setAttribute('cx', cx.toString());
        circleElement.setAttribute('cy', cy.toString());
        circleElement.setAttribute('r', DOT_RADIUS + UNITS);
        circleElement.setAttribute('fill', 'hsla(' + DOT_LIST[i].hue + ', 100%, ' + DOT_LIGHTNESS + ', 1)');
        circleElement.dotDefinition = DOT_LIST[i];
        addListeners(circleElement, {onTapStart: function(e) {
            //TODO
//            var newDot = new Dot(e.element.dotDefinition, e.mmX, e.mmY);
//            nodeArray.push(newDot);
        }, onDragStart: function(e) {
            //TODO
            tempDot = new Dot(e.element.dotDefinition, e.mmX, e.mmY);
            console.log("drag");
        }, onDragMove: function(e) {
            //TODO
        }, onDragEnd: function(e) {
            //TODO
            console.log("drag end");
        }});

        /*
         onDragStart: function(e) {
         //move to front
         selfDot.svgElement.parentNode.appendChild(selfDot.svgElement);
         if (!CONTINUOUS_PHYSICS) {
         Physics.remove(selfDot);
         updateArcsClipPath();
         }
         },
         onDragMove: function(e) {
         if (CONTINUOUS_PHYSICS)
         Physics.remove(selfDot);
         selfDot.x = e.mmX;
         selfDot.y = e.mmY;
         if (CONTINUOUS_PHYSICS) {
         Physics.add(selfDot);
         updateArcsClipPath();
         }
         //re-render the clipping paths for intersecting arcs
         },
         onDragEnd: function(e) {
         if (!CONTINUOUS_PHYSICS) {
         Physics.add(selfDot);
         updateArcsClipPath();
         }
         }
         */

        svgElement.appendChild(circleElement);
        svgElement.appendChild(name);
//        svgElement.innerHTML = DOT_LIST[i].name;
        dotContainer.appendChild(svgElement);
    }
}
loadDots();

showRight.onclick = function() {
    if(!classie.has( menuRight, 'menu-open' )) {
    	closeOther( 'menuRight' );
    }
    classie.toggle( menuRight, 'menu-open' );
    classie.toggle( showRight, 'menu-open' );
};
showLeft.onclick = function() {
    if(!classie.has(menuLeft, 'menu-open')) {
    	closeOther( 'menuLeft' );
    }
    classie.toggle( menuLeft, 'menu-open' );
    classie.toggle( showLeft, 'menu-open' );
};



//not working
function closeOther( menu ) {
    if( menu !== 'menuRight' ) {
        classie.remove( menuRight, 'menu-open' );
        classie.remove( showRight, 'menu-open' );
    }
    if( menu !== 'menuLeftPush' ) {
        classie.remove( menuLeft, 'menu-open' );
        classie.remove( showLeft, 'menu-open' );
    }
}