ajax请求blob格式的数据是获取图片的最佳方案，但是blob object在chrome.extension.sendRequest后会failed, 所以只能传string， ajax获得的image的string为utf8编码，需要转为二进制码


---------------------------------
╮(╯-╰)╭  


chrome extension 似乎无法向 filesystem:chrome-extension://.../... 页面插入js， 无法实现编辑后保存功能.
