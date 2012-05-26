//filesystem 直接放后台？
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
var handle = {
    //嵌入js，存储到fs
    savePage: function(res, sender, callback){
        console.log('do js');
        var info = JSON.stringify(res);
        console.log(info);
        console.log(res.tab.id);
    },
    /**
     *  @res.name {string} name of file full path
     *  @res.content {string} content of file, full path
     *  @sender ingore
     *  @callback 
     *  **/
    saveFile: function(res, sender, callback){
        //console.log('do save file', '');
        window.requestFileSystem(window.TEMPORARY, 1000*1000*10, function(fs){
            if(!fs){
                alert('no fs')
                return;
            }
            console.log('name: ' + fs.name);

            fs.root.getFile(res.name, {
                create: true
                //, exclusive: true
            }, function(fileEntry){
                alert('getFileEntry');
                console.log(fileEntry);
                fileEntry.createWriter(function(fileWriter) {

                    console.log(fileWriter);
                    fileWriter.onwriteend = function(e) {
                        console.log('Write completed.');
                    };

                    fileWriter.onerror = function(e) {
                        console.log('Write failed: ' + e.toString());
                    };

                    // Create a new Blob and write it to log.txt.
                    var bb = new window.BlobBuilder(); // Note: window.WebKitBlobBuilder in Chrome 12.
                    alert('bb created')
                    bb.append(res.content);
                    console.log(bb); //test bb
                    alert(bb)
                    fileWriter.write(bb.getBlob('text/plain'));

                    callback || callback(fileEntry.toURL);
                    alert(fileEntry.toURL());
                }, errorHandler);
                //TODO: fix bug
                alert(fileEntry.toURL());

            }, errorHandler);
        }, errorHandler);
    },
    readFile: function(res, sender, callback){
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
    }
};


chrome.extension.onRequest.addListener(function(res, sender, callback){
    if(!res.type){return;}
    handle[res.type](res, sender, callback);
});

