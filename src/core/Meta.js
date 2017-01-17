
/**
* 元数据管理工具。
* @namespace
*/

var key = 'guid-' + Math.random().toString().slice(2, 6);
var guid$data = {};

module.exports = {
    'set': function (obj, data) {
        var guid = obj[key];
        if (!guid) {
            guid = obj[key] = Math.random().toString().slice(2);
        }

        guid$data[guid] = data;
        return data;
    },

    'get': function (obj) {
        var guid = obj[key];
        return guid ? guid$data[guid] : undefined;
    },

    'remove': function (obj) {
        var guid = obj[key];
        if (guid) {
            delete obj[key];
            delete guid$data[guid];
        }
    },
};


