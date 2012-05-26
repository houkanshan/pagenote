function highlightSelection() {
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
}

var toolbar = document.createElement('div');
toolbar.id = 'pagenote-toolbar'; // you must remove it when saving the whole DOM
toolbar.setAttribute('style', 'position: fixed; left: 10%; top: 80%; width: 80%; border: 1px solid Black; background-color: #ccc; padding: 0.5em');

var highlightBtn = document.createElement('input');
highlightBtn.type = 'button';
highlightBtn.value = 'Highlight';
highlightBtn.onclick = highlightSelection;
toolbar.appendChild(highlightBtn);

document.body.appendChild(toolbar);
