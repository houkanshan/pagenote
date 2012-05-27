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
                window.close();
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
            file.name = file.name.substr(0, 20);
            li.innerHTML = 
                '<a data-link="' + file.path + '" targe="_blank">'+
                    file.name +
                '</a>';
            li.onclick = function(){
                var href = this.getElementsByTagName('a')[0].getAttribute('data-link');
                chrome.tabs.create({url: href}, function(tab){
                    console.log('tab created');
                    chrome.tabs.executeScript(tab.id, {
                        file: "/scripts/commenter.js"
                    }, function(){
                        console.log('commenter insert');
                        if (chrome.extension.lastError) {
                            console.log(chrome.extension.lastError);
                        }
                    });
                });
            }
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
    //chrome.extension.sendRequest({
        //type: 'createDir',
        //name: 'test'
    //}, function(res){
        //console.log(res);
        //if(res.err){ console.log(res.err); return;}
        //console.log(res.prefix);
    //})
    /* test end */
};
