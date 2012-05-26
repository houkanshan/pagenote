window.onload = function(){
    //localStorage.clear();
    if(!localStorage.firstRun){
        localStorage.firstRun = true;
        window.open('./authorize.html');
        window.close();
    }
    
    var btn = document.getElementById('fs');
    btn.onclick = function(){
        
        //获得文件系统
        chrome.tabs.getSelected(function(tab){
            chrome.tabs.executeScript(tab.id, {
                file: "./scripts/content_script.js"
            }, function(){
                console.log('callend');
                if (chrome.extension.lastError) {
                    console.log(chrome.extension.lastError);
                }
                // Alert because a desktop notification window looks bad with so much text.
            });
        });
    };

    var btn2 = document.getElementById('listFile');
    btn2.onclick = function(){
        window.open("/fs.html");
    };
}
