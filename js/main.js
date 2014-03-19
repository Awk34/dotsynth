undoStack = [];
redoStack = [];
//TODO: delete oldest item once stack gets to MAX_UNDO/MAX_REDO

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
context.destination.connections = [];


// for help menu box, toggles display on/off
function toggle(obj) {
    var e = document.getElementById(obj);
    if(e.style.display == 'none')
        e.style.display = '';
    else
        e.style.display = 'none';
}
//TODO: should this be document.getElementById("helptext")?
addListeners(helptext, {onTapEnd: function() { helptext.classList.toggle('hidden') }});
addListeners(help, {onTapEnd: function() { helptext.classList.toggle('hidden') }});
addListeners(undobutton, {onTapEnd: function() { undo() }});
addListeners(redobutton, {onTapEnd: function() { redo() }});

function Action(context, type) {
    this.context = context;
    this.type = type;
}

//take proper action to undo latest Action on the undoStack, push all this info to redoStack
function undo() {
    if(undoStack.length == 0) return;
    var thisAction = undoStack.pop();
    redoStack.push(thisAction);
    //console.log("Undoing "+thisAction);

    switch(thisAction.type) {
        case "create":
            /* note: there won't be any connections to break yet,
             * since the node was just created */
            del(thisAction.context);
            break;
        case "delete":
            //TODO: replace dot, reconnect
            break;
        case "connect":
            del(thisAction.context);
            break;
        case "disconnect": //connections
            //TODO
            break;
        default:
            console.log("Unknown undo type");
            break;
    }
}

//TODO
//redo whatever action is latest on the redoStack
function redo() {
    if(redoStack.length == 0) return;
    var thisAction = redoStack.pop();
    undoStack.push(thisAction);

    switch(thisAction.type) {
        case "create":
            if(thisAction.context instanceof Dot) {
                //TODO: replace dot
                //replace dot
                new Dot(thisAction.context.definition, thisAction.context.x, thisAction.context.y);
                //no connections to recreate
            } else {console.log("Unimplemented recreate")}
            break;
        case "delete":
            //TODO
            break;
        case "connect":
            //TODO
            break;
        case "disconnect": //connections
            //TODO
            break;
        default:
            console.log("Unknown undo type");
            break;
    }
}

//TODO: universal delete method
function del(obj) {
    if(obj instanceof Dot) {
        undoStack.push(new Action(obj, "delete"));
        dotList.splice(dotList.indexOf(obj), 1);
        obj.svgElement.remove();
        for(var i=0; i<obj.connections.length; i++) {
            //remove connections from the connected dot's connections[]
            if(obj.connections[i].thisSource == obj) {
                obj.connections[i].thisDest.connections.splice(obj.connections[i].thisDest.connections.indexOf(obj.connections[i]), 1);
            } else {
                obj.connections[i].thisSource.connections.splice(obj.connections[i].thisSource.connections.indexOf(obj.connections[i]), 1);
            }
            //delete the connection's SVG
            obj.connections[i].svgElement.remove();
        }
        //de-allocate all of this dot's connections
        obj.connections.length = 0;
    }
    else if(obj instanceof Connection) {
        //TODO
        undoStack.push(new Action(obj, "disconnect"));
        obj.svgElement.remove();
        obj.thisSource.connections.splice(obj.thisSource.connections.indexOf(obj), 1);
        obj.thisDest.connections.splice(obj.thisDest.connections.indexOf(obj), 1);
    }
    else {
        console.log("Unimplemented deletion");
    }
}
