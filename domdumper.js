var string = {
	startsWith: function(str, prefix) {
		return str.lastIndexOf(prefix, 0) === 0;
	},
	endsWith: function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
};

function escapeURL(str) {
	return str.replace(/[^\w.]+/g, '-');
}
function extractFileName(pathStr) {
	var sep = pathStr.lastIndexOf('/');
	var ret = pathStr.substring(sep + 1);
	if (ret.length === 0) {
		// empty string, use "index" instead
		ret = 'index';
	}
	return ret;
}
function splitFileName(filename) {
	var dot = filename.lastIndexOf('.');
	var ret = {};
	if (dot != -1) {
		ret.name = filename.substring(0, dot);
			ret.ext = filename.substring(dot + 1);
	} else {
		ret.name = filename;
		ret.ext = '';
	}
	return ret;
}

function Page(url) {
	var that = this;
	this.finishCallback = null;

	// mutex
	this.waitcount = 0;
	this.incWait = function() {
		this.waitcount++;
	};
	this.decWait = function() {
		this.waitcount--;
		if (this.waitcount === 0 && this.canFinish) {
			this.finishCallback();
		}
	};
	this.canFinish = false;

	this.url = url;
	this.pathPrefix = "/" + escapeURL(url); // TODO: chrome.extension.requestPrefix
	console.log('prefix = ' + this.pathPrefix);
	this.names = {};
	/**
	 * name: string
	 */
	this.availableName = function(name) {
		if (this.names[name] === undefined) {
			return name;
		} else {
			var nameParts = splitFileName(name);
			var i = 1;
			while(this.names[nameParts.name + '.' + i + '.' + nameParts.ext] !== undefined) {
				i++;
			}
			return nameParts.name + '.' + i + '.' + nameParts.ext;
		}
	};
	this.saveAsFile = function(url, callback) {
		if (!string.startsWith(url, 'http://') && !string.startsWith(url, 'https://')) {
			callback(url);
			return;
		}

		// not a data url, we must download it
		var req = new XMLHttpRequest();
		req.overrideMimeType('text/plain; charset=x-user-defined');
		req.onreadystatechange = function() {
			if (req.readyState == 4) {
				if (req.status == 200) {
					var filename = that.availableName(escapeURL(extractFileName(url)));
					/*chrome.extension.sendRequest({
						type: 'saveFile',
						name: this.pathPrefix + '/' + filename,
						content: req.responseText
					});*/
					callback(that.pathPrefix + '/' + filename);

					console.log("'" + url + "' saved as " + that.pathPrefix + '/' + filename);
				} else {
					console.error("Ajax error HTTP " + req.status + " when downloading: '" + url + "'");
				}
			}
			that.decWait();
		};
		req.onerror = function() {
			console.error("can not download: '" + url + "'");
		};
		req.open('GET', url);
		this.incWait();
		req.send();
	};
	this.saveHTML = function(html, finishCallback) {
		this.finishCallback = finishCallback;
		this.incWait();
		function convertURL(node) {
			var nodeName = node.nodeName.toLowerCase();
			if (nodeName === 'img' || nodeName === 'script') {
				that.saveAsFile(node.src, function(newurl) {
					node.src = newurl;
					node.setAttribute('src', newurl);
				});
			} else if (nodeName === 'link') {
				that.saveAsFile(node.href, function(newurl) {
					node.href = newurl;
					node.setAttribute('href', newurl);
				});
			}
			var childs = node.children;
			for (var i = 0; i < childs.length; i++) {
				convertURL(childs[i]);
			}
		}
		convertURL(html);
		this.canFinish = true;
		this.decWait();
	};
}

function escapeHTML(s) {
	s = s.replace(/&/g, '&amp;');
	s = s.replace(/</g, '&lt;');
	s = s.replace(/>/g, '&gt;');
	return s;
}

var html = document.getElementsByTagName('html')[0].cloneNode(true);

var page = new Page(location.href);
page.saveHTML(html, function() {
	setTimeout(function() {
		var newwin = window.open('');
		newwin.document.write('<pre>' + escapeHTML(html.innerHTML) + '</pre>');
		// newwin.document.write('<pre>' + escapeHTML(new XMLSerializer().serializeToString(html)) + '</pre>');
	}, 1000);
});
