export default class Board {
    static ID_PREFIX = "MediaID_";
    
    constructor(element) {
        this.element = element;
        this.isMouseDown = false;
        this.activeMedia = null;
        this.isMediaResizing = false;
        this.scaleAmount = 1;
        this.mediaItems = [];

        this.element.addEventListener("dragover", (e) => {
            e.preventDefault();
            element.classList.add("drag-hover");
        });
          
        this.element.addEventListener("dragleave", () => {
            element.classList.remove("drag-hover");
        });
    }

    static init() {
        var boardElement = document.createElement("div");
        
        boardElement.id = "Board";
        boardElement.style.zoom = "100%";

        if(document.getElementById("Board")) {
            document.getElementById("Board").remove();
        }
        // document.insertBefore(boardElement, document.body.firstChild);
        document.body.appendChild(boardElement);
        
        return new Board(boardElement);
    }
}

export function addMediaToBoard(media, board) {
    if(media == null) {
        return;
    }

    var imageType = /^image\//;
    var videoType = /^video\//;
    var mediaElement;
    var wrapperElement;
    var resizeTopRightElement, resizeTopLeftElement, resizeBottomRightElement, resizeBottomLeftElement;
    var resizeElementArray;
    var deleteElement;

    deleteElement = document.createElement("div");
    deleteElement.classList.add("media-delete");
    deleteElement.innerHTML = "X";

    deleteElement.addEventListener("click", function(e) {
        board.mediaItems.splice(board.mediaItems.indexOf(getMediaByDomID(board, wrapperElement.id)), 1);
        wrapperElement.remove();
    });

    board.isMouseDown = false;

    resizeTopRightElement = document.createElement("div");
    resizeTopRightElement.classList.add("resize", "resize-top-right");

    resizeTopLeftElement = document.createElement("div");
    resizeTopLeftElement.classList.add("resize", "resize-top-left");

    resizeBottomRightElement = document.createElement("div");
    resizeBottomRightElement.classList.add("resize", "resize-bottom-right");   

    resizeBottomLeftElement = document.createElement("div");
    resizeBottomLeftElement.classList.add("resize", "resize-bottom-left");

    resizeElementArray = [resizeTopRightElement, resizeTopLeftElement, resizeBottomRightElement, resizeBottomLeftElement];

    wrapperElement = document.createElement("div");
    wrapperElement.classList.add("media-wrapper");

    if (imageType.test(media.file.type)) {
        mediaElement = document.createElement("img");
        
    } else if (videoType.test(media.file.type)){
        mediaElement = document.createElement("video");
        mediaElement.setAttribute("type", "video/mp4");
        mediaElement.muted = true;
        mediaElement.autoplay = true;
        mediaElement.loop = true;
    }

    mediaElement.file = media.file;
    mediaElement.classList.add("media");
    wrapperElement.id = Board.ID_PREFIX + media.id;
    wrapperElement.style.left = 50 + "px";
    wrapperElement.style.top = 50 + "px";
    media.positionX = wrapperElement.style.left;
    media.positionY = wrapperElement.style.top;

    wrapperElement.addEventListener("mousedown", function(e) {
        board.isMouseDown = true;
        board.activeMedia = mediaElement;

        window.x = (e.x - mediaElement.getBoundingClientRect().left) - window.scrollX;
        window.y = (e.y - mediaElement.getBoundingClientRect().top) - window.scrollY;

        window.addEventListener("mousemove", moveElement);

        window.addEventListener("mouseup", function() {
            board.isMouseDown = false;
            board.activeMedia = null;
            window.removeEventListener("mousemove", moveElement);
        });
    });

    function moveElement(moveEvent) {
        if(!board.isMouseDown || board.activeMedia == null || board.isMediaResizing) {
            return;
        }

        var x = (moveEvent.x - window.x) * (1 / board.scaleAmount);
        var y = (moveEvent.y - window.y) * (1 / board.scaleAmount);
       
        wrapperElement.style.left = x + "px";
        wrapperElement.style.top = y + "px";

        getMediaByDomID(board, wrapperElement.id).positionX = wrapperElement.style.left;
        getMediaByDomID(board, wrapperElement.id).positionY = wrapperElement.style.top;
        getMediaByDomID(board, wrapperElement.id).width = wrapperElement.getBoundingClientRect().width + "px";
        getMediaByDomID(board, wrapperElement.id).height = wrapperElement.getBoundingClientRect().height  + "px";
    }

    var reader = new FileReader();
    reader.onload = function(e) { 
        // return function(e) {
            mediaElement.onload = (function() {
                
                function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

                    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
                
                    return { width: srcWidth*ratio, height: srcHeight*ratio };
                }

                var maxWidth = 700;
                var maxHeight = maxWidth;

                var imageSize = calculateAspectRatioFit(e.target.width, e.target.height, maxWidth, maxHeight);

                // mediaElement.style.width = e.target.width + "px";
                // mediaElement.style.height = e.target.height + "px";

                mediaElement.style.maxWidth = "700px";
                mediaElement.style.maxHeight = "700px";

                wrapperElement.style.width = mediaElement.style.width;
                wrapperElement.style.height = mediaElement.style.height;
                
                media.width = wrapperElement.style.width;
                media.height = wrapperElement.style.height;
            
                wrapperElement.appendChild(mediaElement);
                wrapperElement.appendChild(deleteElement);
                wrapperElement.appendChild(resizeTopRightElement);
                wrapperElement.appendChild(resizeTopLeftElement);
                wrapperElement.appendChild(resizeBottomRightElement);
                wrapperElement.appendChild(resizeBottomLeftElement);
                board.element.appendChild(wrapperElement);
                board.mediaItems.push(media);

            })(e);
        
            mediaElement.src = e.target.result;
            media.data = e.target.result;
            window.blob = e.target.result;

        // }; 
    }
    reader.readAsDataURL(media.file);
    
    

    for(var resizer of resizeElementArray) {
        resizer.addEventListener("mousedown", mousedown); 

        var element = wrapperElement;

        function mousedown(e) {
            var currentResizer = e.target;

            var prevX = e.clientX;
            var prevY = e.clientY;

            board.isMediaResizing = true;
            mediaElement.classList.add("media-active");
            board.activeMedia = mediaElement;

            window.addEventListener("mousemove", mousemove);
            window.addEventListener("mouseup", mouseup);

            function mousemove(e) {
                const rect = element.getBoundingClientRect();

                if (currentResizer.classList.contains("resize-bottom-right")) {
                    element.style.width = rect.width - (prevX - e.clientX) + "px";
                    element.style.height = rect.height - (prevY - e.clientY) + "px";
                } else if (currentResizer.classList.contains("resize-bottom-left")) {
                    element.style.width = rect.width + (prevX - e.clientX) + "px";
                    element.style.height = rect.height - (prevY - e.clientY) + "px";
                    element.style.left = rect.left - (prevX - e.clientX) + "px";
                } else if (currentResizer.classList.contains("resize-top-right")) {
                    element.style.width = rect.width - (prevX - e.clientX) + "px";
                    element.style.height = rect.height + (prevY - e.clientY) + "px";
                    element.style.top = rect.top - (prevY - e.clientY) + "px";
                } else {
                    element.style.width = rect.width + (prevX - e.clientX) + "px";
                    element.style.height = rect.height + (prevY - e.clientY) + "px";
                    element.style.top = rect.top - (prevY - e.clientY) + "px";
                    element.style.left = rect.left - (prevX - e.clientX) + "px";
                }

                mediaElement.style.width = element.style.width;
                mediaElement.style.height = element.style.height;
                mediaElement.style.top = element.style.top;
                mediaElement.style.left = element.style.left;

                getMediaByDomID(board, wrapperElement.id).width = wrapperElement.style.width;
                getMediaByDomID(board, wrapperElement.id).height = wrapperElement.style.height;
                getMediaByDomID(board, wrapperElement.id).positionX = wrapperElement.style.left;
                getMediaByDomID(board, wrapperElement.id).positionY = wrapperElement.style.top;
                
                mediaElement.style.maxWidth = "";
                mediaElement.style.maxHeight = "";

                prevX = e.clientX;
                prevY = e.clientY;
                
            }

            function mouseup() {
                window.removeEventListener("mousemove", mousemove);
                window.removeEventListener("mouseup", mouseup);
                mediaElement.classList.remove("media-active");
                board.isMediaResizing = false;
            }
        }
    }
}

export function boardRightClickControl(board) {
    window.addEventListener("mousedown", function(e) {

        if(e.target.id !== "Board") {
            return;
        }

        if (e && (e.button == 2)) {
            var position = {
                x: e.pageX,
                y: e.pageY,
            };

            board.element.style.cursor = "grabbing";
            board.element.style.userSelect = "none";

            window.addEventListener("mousemove", rightClickMove);

            window.addEventListener("mouseup", rightClickUp);

            function rightClickMove(e) {
                $(window).scrollLeft($(window).scrollLeft() + (position.x - e.pageX));
                $(window).scrollTop($(window).scrollTop() + (position.y - e.pageY));
            }

            function rightClickUp(e) {
                if (e && (e.button == 2)) {
                    window.removeEventListener("mousemove", rightClickMove);
                    window.removeEventListener("mouseup", rightClickUp);

                    board.element.style.removeProperty('cursor');
                    board.element.style.removeProperty('user-select');
                }
            }
        }
    });
}

window.getMediaByDomID = function(board, domID) {
    
    var id = domID.substr(Board.ID_PREFIX.length);
   
    for(var item of board.mediaItems) {
        if(parseInt(id) === item.id) {
            return item;
        }
    }
}