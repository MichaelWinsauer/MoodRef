export default class Media {
    static count = 0;

    constructor(file){
        this.file = file;

        this.serializableFileObject  = {
            "lastModified" : this.file.lastModified,
            "lastModifiedDate" : this.file.lastModifiedDate,
            "name" : this.file.name,
            "size" : this.file.size,
            "type" : this.file.type
         };
        
        this.data = "";
        this.positionX = 0;
        this.positionY = 0;
        this.width = 0;
        this.height = 0;
        this.id = Media.count;
        Media.count++;
    }
}
