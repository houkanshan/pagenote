(function(){
    var html = document.getElementsByTagName('html')[0];
    var html = html.innerHTML.toString();
    console.log(html);


    var testName = Math.random().toString().substr(2, 4);
    chrome.extension.sendRequest({
        type: 'saveFile',
        name: testName + '.html',
        content: html
    }, function(){

    });

    alert(2);

}());