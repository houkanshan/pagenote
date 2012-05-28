(function(){
    var highlightSelection = function() {
    	var selObj = window.getSelection();
    	if (selObj.toString().length > 0) {
    		if (selObj.anchorNode === selObj.focusNode) {
    			// start and end in the same node
    			var node = selObj.anchorNode;
    			if (node.nodeType == Node.TEXT_NODE) {
    				var start = selObj.anchorOffset;
    				var end = selObj.focusOffset;
    				if (end < start) {
    					var tmp = end;
    					end = start;
    					start = tmp;
    				}
    				var value = node.nodeValue;
    				var paren = node.parentNode;
    				var span = document.createElement('span');
    				span.className = '.pagenote-highlight'; // for you can delete all markers by selecting className
    				span.setAttribute('style', 'background-color: yellow');
    				span.innerHTML = value.substring(start, end);
    				paren.insertBefore(span, node);
    				paren.insertBefore(document.createTextNode(value.substring(0, start)), span);
    				node.nodeValue = value.substring(end);
    			}
    		} else {
    			// they are in different nodes, change the nodes between them
    		}
    	}
    };
    var savePage = function(){
        var toolbar = document.getElementById('pagenote-toolbar');
        var pathPrefix = window.location.pathname.split('/')[1];
        document.body.removeChild(toolbar);
        var html = document.getElementsByTagName('html')[0].innerHTML.toString();
        chrome.extension.sendRequest({
            type: 'reSaveFile',
            name: 'index.html',
            dir: pathPrefix,
            content: html
        }, function(){
            alert('save success');
        });
    };
    
    var toolbar = document.createElement('div');
    toolbar.id = 'pagenote-toolbar'; // you must remove it when saving the whole DOM
    toolbar.setAttribute('style', 'position: fixed; left: 10%; bottom: 0; height: 40px; width: 80%;  background-color: black; padding: 0.5em: z-index: 1000; opacity: 0.8; text-align: center;');
    
    var buttonStyle = 'display: inline-block; background: #07c; height: 30px; padding: 2px 5px';
    buttonStyle += 'color: black; border:none; margin: 5px 10px;'
    var highlightBtn = document.createElement('input');
    highlightBtn.type = 'button';
    highlightBtn.value = '高亮';
    highlightBtn.onclick = highlightSelection;
    highlightBtn.setAttribute('style', buttonStyle)
    toolbar.appendChild(highlightBtn);

    var saveBtn = document.createElement('input');
    saveBtn.type = 'button';
    saveBtn.value = '保存';
    saveBtn.onclick = savePage;
    saveBtn.setAttribute('style', buttonStyle)
    toolbar.appendChild(saveBtn);
    
    
    document.body.appendChild(toolbar);
}());
