export default class Board {
    
    constructor(element) {
        this.element = element;
        this.isMouseDown = false;
        this.activeMedia = null;
        this.isMediaResizing = false;
        this.scaleAmount = 1;

        this.element.addEventListener("dragover", (e) => {
            e.preventDefault();
            element.classList.add("drag-hover");
        });
          
        this.element.addEventListener("dragleave", () => {
            element.classList.remove("drag-hover");
        });

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
    wrapperElement.id = "MediaID_" + media.id;
    wrapperElement.style.left = 50 + "px";
    wrapperElement.style.top = 50 + "px";


    wrapperElement.addEventListener("mousedown", function(e) {
        board.isMouseDown = true;
        board.activeMedia = mediaElement;

        window.x = (e.x - mediaElement.getBoundingClientRect().left);
        window.y = (e.y - mediaElement.getBoundingClientRect().top);

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
    }

    var reader = new FileReader();
    reader.onload = (function(mediaElement) { 
        return function(e) {
            mediaElement.src = e.target.result;
        }; 
    })(mediaElement);
    reader.readAsDataURL(media.file);
    
    mediaElement.onload = (function() {
        
        mediaElement.style.maxWidth = "700px";
        mediaElement.style.maxHeight = "700px";

        wrapperElement.style.width = mediaElement.style.width;
        wrapperElement.style.height = mediaElement.style.height;
    
        wrapperElement.appendChild(mediaElement);
        wrapperElement.appendChild(deleteElement);
        wrapperElement.appendChild(resizeTopRightElement);
        wrapperElement.appendChild(resizeTopLeftElement);
        wrapperElement.appendChild(resizeBottomRightElement);
        wrapperElement.appendChild(resizeBottomLeftElement);
        board.element.appendChild(wrapperElement);
    })();

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