import Media from "./Media.js"
import Board, { addMediaToBoard } from "./Board.js"

var btnAddMedia = document.getElementById("BtnAddMedia");
var board = new Board(document.getElementById("Board"));

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

//==========================================================//

board.element.addEventListener("drop", function(e) {
    e.preventDefault();
  
    const file = e.dataTransfer.files[0];
    var media = new Media(file);

    addMediaToBoard(media, board);
});

//==========================================================//

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