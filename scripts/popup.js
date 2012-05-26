var $id = function( id ){
    return document.getElementById( id );
};

var PageNote = PageNote || {};

PageNote.DOM = (function(){
    var saveCurrentBtn;
    var delAllBtn;
    var btn2;
    var fileList;
    var doc = document;

    return {
        init: function(){

            saveCurrentBtn = $id('saveCurrent');
            delAllBtn = $id('delAll');
            btn2 = $id('listFile');
            fileList = $id('fileList');

            saveCurrentBtn.onclick = function(){
                //获得文件系统
                chrome.tabs.getSelected(null, function(tab){
                    chrome.tabs.executeScript(tab.id, {
                        file: "./scripts/content_script.js"
                    }, function(){
                        console.log('callend');
                        if (chrome.extension.lastError) {
                            console.log(chrome.extension.lastError);
                        }
                    });
                });
            };

            delAllBtn.onclick = function(){
                chrome.extension.sendRequest({
                    type: 'delAll'
                }, function(){});
            };

            btn2.onclick = function(){
                window.open("/fs.html");
            };

        },

        /**
         *  @file.name fileName
         *  @file.path full Path Of File
         *  **/
        addFileItem: function(file){
            var li = doc.createElement('li');
            li.innerHTML = 
                '<a href="' + file.path + '">'+
                    file.name +
                '</a>';
            fileList.appendChild(li);
        }
    };
}());


window.onload = function(){
    //localStorage.clear();
    if(!localStorage.firstRun){
        localStorage.firstRun = true;
        window.open('./authorize.html');
        window.close();
    }

    PageNote.DOM.init();

    chrome.extension.sendRequest({
        type: 'fileList'
    }, function(res){
        if(!res.fileList){return;}
        for(var i = 0, file; file = res.fileList[i]; ++i){
            PageNote.DOM.addFileItem(file);
        }
    });


    /* test */
    chrome.extension.sendRequest({
        type: 'createDir',
        name: 'test'
    }, function(res){
        console.log(res);
        if(res.err){ console.log(res.err); return;}
        console.log(res.prefix);
    })
    /* test end */
};
