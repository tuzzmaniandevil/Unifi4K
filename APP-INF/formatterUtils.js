function isNotBlank(val) {
    return trimToNull(val) !== null;
}

function isBlank(s) {
    return !isNotBlank(s);
}

function trimToNull(s) {
    if (s !== null) {
        s = s.toString().trim();
        if (s.length === 0) {
            return null;
        }
    }
    return s;
}

function isNull(s) {
    return s === null || typeof (s) === 'undefined';
}

function isNotNull(s) {
    return s !== null && typeof (s) !== 'undefined';
}

function replaceYuckyChars(s) {
    s = s.toLowerCase().replace("/", "");
    s = s.replace(/[^A-Za-z0-9]/g, "-");
    while (s.indexOf("--") > -1) {
        s = s.replace("--", "-");
    }

    if (s.endsWith("-")) {
        s = s.substring(0, s.length - 1);
    }

    return s;
}

function safeString(val) {
    if (typeof val === "undefined") {
        return "";
    }
    return formatter.format(val);
}

function safeInt(val) {
    if (typeof val === "undefined") {
        return 0;
    }
    return parseInt(val, 10);
}

function safeBoolean(val) {
    if (typeof val === "undefined" || val === null) {
        return false;
    }
    var b = formatter.toBool(val);
    if (b === null) {
        return false;
    }
    return b.booleanValue();
}

function safeArray(val) {
    if (typeof val === "undefined" || val === null) {
        return [];
    }
    return val.split(",");
}

function joinArray(arr, p) {
    var a = "";
    for (var s in arr) {
        a = a + arr[s] + p;
    }
    return a;
}

function removeAt(arr, at) {
    var a = [];
    for (var i in arr) {
        if (i != at) {
            a.push(arr[i]);
        }
    }
    return a;
}

function fileSize(bytes, si) {
    var thresh = si ? 1024 : 1000;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
            ? ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
            : ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

function removeKeys(params) {
    for (var i = 0; i < arguments.length; i++) {
        var key = arguments[i];
        params.remove(key);
    }
}

function removeArrayEntry(params) {
    for (var i = 1; i < arguments.length; i++) {
        var key = arguments[i];
        params.remove(key);
    }
}

function populateExtraFields(params, bean) {
    var paramsArray = params.entrySet().toArray();
    for (var i = 0; i < paramsArray.length; i++) {
        var result = paramsArray[i];
        var key = result.getKey();
        var val = result.getValue();
        if (isNotBlank(val)) {
            bean[key] = val;
        }
    }

    return bean;
}

function populateFields(params, bean) {
    var newBean = cleanBean(bean);

    var paramsArray = params.entrySet().toArray();
    for (var i = 0; i < paramsArray.length; i++) {
        var result = paramsArray[i];
        var key = result.getKey();
        var val = result.getValue();
        newBean[key] = val;
    }

    return cleanBean(newBean);
}

function cleanBean(bean) {
    var newBean = {};

    for (var i in bean) {
        var val = bean[i];
        if (isNotBlank(val) && isNotNull(val)) {
            newBean[i] = val;
        }
    }

    return newBean;
}

var addHttp = function (url) {
    var urlRegExp = new RegExp('^(?:[A-Za-z-\.]+):\/\/');

    if (!urlRegExp.test(url)) {
        url = url.replace('://', '');

        url = 'http://' + url;
    }

    return url;
};

var generateRandomCode = function (length) {
    length = length || 8;
    var possible = "0123456789";
    var text = "";

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

function extractDomain(url) {
    if (isBlank(url)) {
        return null;
    }
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function cropImage(name, params) {
    var hash = safeString(params.uploadedHref).replace('/_hashes/files/', '');
    var x = safeInt(params.x);
    var y = safeInt(params.y);
    var w = safeInt(params.w);
    var h = safeInt(params.h);

    var fileExt = formatter.fileExt(name);
    return fileManager.utils.cropImage(hash, x, y, w, h, fileExt);
}