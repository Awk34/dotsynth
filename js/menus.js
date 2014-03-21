//for side menus

var menuLeft = document.getElementById( 'leftMenu' ),
    menuRight = document.getElementById( 'rightMenu' ),
    showLeftPush = document.getElementById( 'showLeftPush' ),
    showRight = document.getElementById( 'showRight' ),
    body = document.body;

showRight.onclick = function() {
    // if(class.has(menuRight, 'menu-open')) {
    // 	disableOther( 'menuRight' );
    // }
    classie.toggle( menuRight, 'menu-open' );
};
showLeftPush.onclick = function() {
    // if(class.has(this, 'active')) {
    // 	disableOther( 'menuLeftPush' );
    // }
    classie.toggle( body, 'menu-push-toright' );
    classie.toggle( menuLeft, 'menu-open' );
};

//not working
function disableOther( menu ) {
    if( menu !== 'menuRight' ) {
        classie.remove( menuRight, 'menu-open' );
    }
    if( menu !== 'menuLeftPush' ) {
        classie.remove( body, 'menu-push-toright' );
        classie.remove( menuLeft, 'menu-open' );
    }
}