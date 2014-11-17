undoStack = [];
redoStack = [];
//TODO: delete oldest item once stack gets to MAX_UNDO/MAX_REDO

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();


// for help menu box, toggles display on/off
function toggle(obj) {
    var e = document.getElementById(obj);
    if (e.style.display == 'none')
        e.style.display = '';
    else
        e.style.display = 'none';
}
addListeners(document.getElementById("helptext"), {
    onTapEnd: function () {
        document.getElementById("helptext").classList.toggle('hidden')
    }
});
addListeners(document.getElementById("help"), {
    onTapEnd: function () {
        document.getElementById("helptext").classList.toggle('hidden')
    }
});
addListeners(document.getElementById("undobutton"), {
    onTapEnd: function () {
        undo()
    }
});
addListeners(document.getElementById("redobutton"), {
    onTapEnd: function () {
        redo()
    }
});
//addListeners(document.getElementById("eraserbutton"), {onTapEnd: function() { /*TODO*/ }});

function Action(context, type) {
    this.context = context;
    this.type = type;
}

//take proper action to undo latest Action on the undoStack, push all this info to redoStack
function undo() {
    if (undoStack.length == 0) return;
    var thisAction = undoStack.pop();
    //console.log("Undoing "+thisAction);

    switch (thisAction.type) {
        case "create":
            redoStack.push(thisAction);
            /* note: there won't be any connections to break yet,
             * since the node was just created */
            del(thisAction.context);
            break;
        case "delete":
            //replace dot
            var tmpDot = new Dot(thisAction.context.definition, thisAction.context.x, thisAction.context.y);
            undoStack.pop();
            for (var i = 0; i < thisAction.context.arcs.length; i++) {
                tmpDot.arcs[i].invModifyValue(thisAction.context.node[tmpDot.arcs[i].definition.name].value);
            }

            //reconnect connections
            var length = thisAction.context.connections.length;
            for (i = 0; i < length; i++) {
                //TODO
                //if this dot is the output for this connection
                var tmpConn;
                if (thisAction.context.connections[i].thisSource == thisAction.context) {
                    tmpConn = new Connection(tmpDot);
                    undoStack.pop();
                    tmpConn.finalize(thisAction.context.connections[i].thisDest.centerElement);
                }
                //else, this dot is the input for this connection
                else if (thisAction.context.connections[i].thisDest == thisAction.context) {
                    tmpConn = new Connection(thisAction.context.connections[i].thisSource);
                    undoStack.pop();
                    tmpConn.finalize(tmpDot.centerElement);
                } else {
                    console.log("uh oh")
                }
            }
            redoStack.push(thisAction);
            break;
        case "connect":
            redoStack.push(thisAction);
            del(thisAction.context);
            break;
        case "disconnect": //connections
            redoStack.push(thisAction);
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
    if (redoStack.length == 0) return;
    var thisAction = redoStack.pop();

    switch (thisAction.type) {
        case "create":
            if (thisAction.context instanceof Dot) {
                //replace dot
                new Dot(thisAction.context.definition, thisAction.context.x, thisAction.context.y);
                //^This will push it's creation to the undoStack

                //there should be no connections to recreate
                if (thisAction.context.connections.length > 0) console.log("whoops, there WERE connections"); //this shouldn't happen
            } else {
                console.log("Unimplemented recreate")
            }
            break;
        case "delete":
            undoStack.push(thisAction);
            del(dotList[dotList.length - 1]);
            break;
        case "connect":
            undoStack.push(thisAction);
            var tmpConn = new Connection(thisAction.context.thisSource);
            undoStack.pop();
            tmpConn.finalize(thisAction.context.thisDest.centerElement);
            break;
        case "disconnect": //connections
            undoStack.push(thisAction);
            //TODO
            break;
        default:
            console.log("Unknown undo type");
            break;
    }
}

function del(obj) {
    if (obj instanceof Dot) {
        dotList.splice(dotList.indexOf(obj), 1);
        obj.svgElement.remove();
        for (var i = 0; i < obj.connections.length; i++) {
            //remove connections from the connected dot's connections[]
            if (obj.connections[i].thisSource == obj) {
                obj.connections[i].thisSource.node.disconnect(obj.connections[i].thisDest.node);
                obj.connections[i].thisDest.connections.splice(obj.connections[i].thisDest.connections.indexOf(obj.connections[i]), 1);
            } else if (obj.connections[i].thisDest == obj) {
                obj.connections[i].thisSource.node.disconnect(obj.connections[i].thisDest.node);
                obj.connections[i].thisSource.connections.splice(obj.connections[i].thisSource.connections.indexOf(obj.connections[i]), 1);
            } else {
                console.log("something went wrong (del(Dot))")
            }
            //delete the connection's SVG
            obj.connections[i].svgElement.remove();
        }
        Physics.remove(obj);
        updateArcsClipPath();
    } else if (obj instanceof Connection) {
        obj.svgElement.remove();
        obj.thisSource.node.disconnect(obj.thisDest.node);
        obj.thisSource.connections.splice(obj.thisSource.connections.indexOf(obj), 1);
        obj.thisDest.connections.splice(obj.thisDest.connections.indexOf(obj), 1);
    } else if (obj instanceof undefined) {
        console.log("Object for deletion is undefined");
    } else {
        console.log("Unimplemented deletion");
    }
}

function deleteDot(dot) {
    undoStack.push(new Action(dot, "delete"));
    del(dot);
}

function deleteConnection(conn) {
    undoStack.push(new Action(conn, "disconnect"));
    del(conn);
}
