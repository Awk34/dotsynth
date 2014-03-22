//for side menus

var menuLeft = document.getElementById( 'leftMenu' ),
    menuRight = document.getElementById( 'rightMenu' ),
    showLeftPush = document.getElementById( 'showLeftPush' ),
    showRight = document.getElementById( 'showRight' ),
    body = document.body;

showRight.onclick = function() {
    if(!classie.has(menuRight, 'menu-open')) {
    	closeOther( 'menuRight' );
    }
    classie.toggle( menuRight, 'menu-open' );
};
showLeftPush.onclick = function() {
    if(!classie.has(menuLeft, 'menu-open')) {
    	closeOther( 'menuLeftPush' );
    }
    classie.toggle( body, 'menu-push-toright' );
    classie.toggle( menuLeft, 'menu-open' );
};

//not working
function closeOther( menu ) {
    if( menu !== 'menuRight' ) {
        classie.remove( menuRight, 'menu-open' );
    }
    if( menu !== 'menuLeftPush' ) {
        classie.remove( body, 'menu-push-toright' );
        classie.remove( menuLeft, 'menu-open' );
    }
}