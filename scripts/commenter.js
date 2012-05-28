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
            type: 'saveReq',
            name: 'index.html',
            dir: pathPrefix,
            content: html
        }, function(){
            alert('save success');
        });
    };
    
    var toolbar = document.createElement('div');
    toolbar.id = 'pagenote-toolbar'; // you must remove it when saving the whole DOM
    //toolbar.setAttribute('style', '');
    
    //var buttonStyle = '';
    //buttonStyle += 'color: black; border:none; margin: 5px 10px;'
    var highlightBtn = document.createElement('button');
    highlightBtn.type = 'button';
    highlightBtn.textContent = '高亮';
    highlightBtn.onclick = highlightSelection;
    //highlightBtn.setAttribute('style', buttonStyle)
    toolbar.appendChild(highlightBtn);

    var saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = '保存';
    saveBtn.onclick = savePage;
    //saveBtn.setAttribute('style', buttonStyle)
    toolbar.appendChild(saveBtn);
    
    
    document.body.appendChild(toolbar);
}());
