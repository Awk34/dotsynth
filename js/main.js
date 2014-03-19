undoStack = [];
redoStack = [];
nodeArray = [];

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
addListeners(helptext, {onTapEnd: function() { helptext.classList.toggle('hidden') }});
addListeners(help, {onTapEnd: function() { helptext.classList.toggle('hidden') }});
addListeners(undobutton, {onTapEnd: function() { undo() }});

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
            del(thisAction.context);
            break;
        case "delete":
            //TODO
            break;
        case "connect":
            del(thisAction.context);
            break;
        case "break": //connections
            //TODO
            break;
        default:
            console.log("Unkown undo type");
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
                //TODO
            } else {console.log("Unimplemented recreate")}
            break;
        case "delete":
            //TODO
            break;
        case "connect":
            //TODO
            break;
        case "break": //connections
            //TODO
            break;
        default:
            console.log("Unkown undo type");
            break;
    }
}

//TODO: universal delete method
function del(obj) {
    if(obj instanceof Dot) {
        nodeArray.splice(dotList.indexOf(obj), 1);
        obj.svgElement.remove();
        for(i=0; i<obj.connections.length; i++)
            obj.connections[i].svgElement.remove();
        obj.connections.length = 0;
    }
    else if(obj instanceof Connection) {
        //TODO
        obj.svgElement.remove();
        obj.thisSource.connections.splice(obj.thisSource.connections.indexOf(obj), 1);
        obj.thisDest.connections.splice(obj.thisDest.connections.indexOf(obj), 1);
    }
    else {
        console.log("Unimplemented deletion");
    }
}
