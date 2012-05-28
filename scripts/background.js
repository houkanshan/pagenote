window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
window.storageInfo = window.storageInfo || window.webkitStorageInfo;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
fs = null;

window.requestFileSystem(window.TEMPORARY, 1000*1000*10, function(thisFs){ 
    if(!thisFs){
        alert('no fs');
        return;
    }
    fs = thisFs;
}, errorHandler);


function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    console.log('Error: ' + msg);
}

// filessystem
var handle = (function(){
    var _createDir = function(rootDirEntry, folders, callback) {
        folders = folders.split('/');
        if (folders[0] == '.' || folders[0] == '') {
            folders = folders.slice(1);
        }
        rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
            if (folders.length) {
                _createDir(dirEntry, folders.slice(1), callback);
            }
            else{
                callback();
            }
        }, errorHandler);
    };
    

    //嵌入js，存储到fs
    return {
        /**
         *  @res.name {string} name of file full path
         *  @res.content {string} content of file, full path
         *  @sender ingore
         *  @callback 
         *  **/
        save: function(res, sender, callback, dirEntry, isCreate){
            fs.root.getDirectory(res.dir, {create: false}, function(dirEntry) {
                dirEntry.getFile(res.name, {
                    create: isCreate
                    , exclusive: true
                }, function(fileEntry){
                    fileEntry.createWriter(function(fileWriter) {
    
                        fileWriter.onwriteend = function(e) {
                            console.log('Write completed.');
                        };
    
                        fileWriter.onerror = function(e) {
                            console.log('Write failed: ' + e.toString());
                        };
    
                        fileType = res.fileType || 'text/plain';

                        var bb = new window.BlobBuilder(); 

                        if( fileType !== 'text/plain'){
                            var byteArray = new Uint8Array(res.content.length);
                            for (var i = 0; i < res.content.length; i++) {
                                byteArray[i] = res.content.charCodeAt(i) & 0xff;
                            }
                            bb.append(byteArray.buffer);
                        }
                        else {
                            bb.append(res.content);
                        }

                        //fileWriter.write(bb.getBlob(fileType));
                        fileWriter.write(bb.getBlob(fileType));
                        //console.log(res.name, bb.getBlob(fileType));
    
                        //callback && callback(fileEntry.toURL);
                    }, errorHandler);
                }, errorHandler);
            }, errorHandler);
        },
        saveFile: function(res, sender, callback){
            //console.log('do save file', '');
            var that = this;
            if(!fs || !res.name || !res.dir){return;}
            console.log('name: ' + fs.name);
    

            fs.root.getDirectory(res.dir, {create: false}, function(dirEntry) {
                that.save(res, sender, callback, dirEntry, true);
            }, errorHandler);
        },
        reSaveFile: function(res, sender, callback){
            var that = this;
            if(!fs || !res.name || !res.dir){return;}
            console.log('name: ' + fs.name);

            fs.root.getDirectory(res.dir, {create: false}, function(dirEntry) {
                that.save(res, sender, callback, dirEntry, false);
            }, errorHandler);
        },
        readFile: function(res, sender, callback){
            if(!fs){return;}
            fs.root.getFile(fileName, {}, function(fileEntry) {
            
                // Get a File object representing the file,
                // then use FileReader to read its contents.
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        //var txtArea = document.createElement('textarea');
                        //txtArea.value = this.result;
                        //document.body.appendChild(txtArea);
                        alert(this.result);
                    };
            
                    reader.readAsText(file);
                }, errorHandler);
            
            }, errorHandler);
        },
        delAll: function(res, sender, callback){
            if(!fs){return;}
            var dirReader = fs.root.createReader();
            dirReader.readEntries(function(entries){
                for(var i = 0, entry; entry = entries[i]; ++i){
                    if(entry.isDirectory){
                        entry.removeRecursively(function(){}, errorHandler);
                    }
                    else {
                        entry.remove(function(){}, errorHandler);
                    }
                }
            }, errorHandler);
        },
        fileList: function(res, sender, callback){
            if(!fs){return;}
            var fileList = [];
            var dirReader = fs.root.createReader();
            dirReader.readEntries(function(entries){
                //first level dir 
                for(var i = 0, entry; entry = entries[i]; ++i){
                    if( ! entry.isDirectory ){return;}
                    var dirReader = fs.root.createReader();
                    console.log(entry);
                    //TODO: show list
                    fileList.push({name: entry.name, path: entry.toURL() + '/index.html'});
                }
                callback({fileList:fileList});
            });
        },
        createDir: function(res, sender, callback){
            if(!fs){return;}
            var name = res.name.replace('[\/:]', ''); 
            //TODO: this maybe replaced
            fs.root.getDirectory(name, {create: true}, function(dirEntry) {
                callback({prefix: dirEntry.toURL()});
            }, errorHandler);
        }
    }
}());


chrome.extension.onRequest.addListener(function(res, sender, callback){
    if(!res.type){return;}
    handle[res.type](res, sender, callback);
});

