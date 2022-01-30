export default class Media {
    static count = 0;

    constructor(file){
        this.file = file;
        
        this.positionX = 0;
        this.positionY = 0;
        this.width = 0;
        this.height = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.id = Media.count;
        Media.count++;
    }
}
