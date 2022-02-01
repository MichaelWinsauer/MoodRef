//==========================================================//
// Initializing
import Media from "./Media.js"
import Board, { addMediaToBoard, boardRightClickControl } from "./Board.js"

var btnAddMedia = document.getElementById("BtnAddMedia");
var btnSave = document.getElementById("BtnSave");
var btnLoad = document.getElementById("BtnLoad");
window.board = Board.init();

//==========================================================//
//Board Control

$('body').mousedown(function(e) {
    if(e.button==1) {
        return false;
    }
});

window.addEventListener("mousewheel", function(e) {
    e.preventDefault();

    return false;
}, {passive:false});

board.element.addEventListener("wheel", function(e) {
    var scaledAmount = e.deltaY / 10;
    
    e.preventDefault;

    if((parseInt(board.element.style.zoom.split("%")[0]) - scaledAmount) + "%" != "0%" && (parseInt(board.element.style.zoom.split("%")[0]) - scaledAmount) + "%" != "310%") {
        board.element.style.zoom = (parseInt(board.element.style.zoom.split("%")[0]) - scaledAmount) + "%";
    }

    board.scaleAmount = (parseFloat(board.element.style.zoom.split("%")[0])) / 100;

    document.getElementById("ControlPanelZoomAmount").value = board.element.style.zoom.split("%")[0];
}, { passive:false });

boardRightClickControl(board);

//==========================================================//
//Adding Media

board.element.addEventListener("drop", function(e) {
    e.preventDefault();
  
    const file = e.dataTransfer.files[0];
    var media = new Media(file);

    addMediaToBoard(media, board);
});

btnAddMedia.addEventListener("click", function(e) {
    var file;
    
    var input = $(document.createElement("input"));
    input.attr("type", "file");
    input.change(function() {
        file = this.files[0];
        var media = new Media(file);

        addMediaToBoard(media, board);
    });

    input.trigger("click");
    
    return false;
});

//==========================================================//

btnSave.addEventListener("click", function() {
    var arr = [];
    for(var media of board.mediaItems) {
        arr.push(media.serializableFileObject);
    }

    localStorage["data"] = JSON.stringify(arr);
});

btnLoad.addEventListener("click", function() {

});