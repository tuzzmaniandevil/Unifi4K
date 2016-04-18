(function (g) {
    var UniFi = function (options) {
        var _self = this;

        _self._cookie = '';

        _self._options = $.extend({
            hostname: 'localhost',
            port: 8443,
            site: 'default',
            username: 'ubnt',
            password: 'ubnt',
            autoLogin: true
        }, options);
    };

    /**
     * Log into the UniFi controller, Returns true if login successfull or false otherwise
     * @param {Function} cb - Called when GET is finished, params (result {boolean})
     * @returns {Boolean}
     */
    UniFi.prototype.login = function (cb) {
        var _self = this;

        var params = {
            username: _self._options.username,
            password: _self._options.password
        };

        var xmlhttp = new XMLHttpRequest();

        var result = false;

        xmlhttp.open("POST", 'https://' + _self._options.hostname + ':' + _self._options.port + '/api/login', false);

        xmlhttp.onloadend = function () {
            var resp = xmlhttp.response;
            var statusCode = resp.statusCode;
            if (statusCode === 200) {
                _self._cookie = resp.getHeaders('set-cookie')[0];
                result = true;
            }
        };

        var data = JSON.stringify(params);

        xmlhttp.send(data);

        if (cb && typeof cb === 'function') {
            cb(result);
        }

        return result;
    };

    /**
     * Logs out of the UniFi controller;
     */
    UniFi.prototype.logout = function () {
        var _self = this;

        _self._doGet('/logout', null, false);
        _self._cookie = '';
    };

    /**
     * Get a list of connected clients for this site
     * @param {type} cb - Called when GET is finished, params (err {boolean}, data {json})
     * @returns {JSON}
     */
    UniFi.prototype.getClients = function (cb) {
        var _self = this;

        return _self._doGet('/api/s/' + _self._options.site + '/stat/sta', cb);
    };

    /**
     * Get a list of devices for this site
     * @param {type} site - the site name to use, if none specified the options default will be used
     * @param {type} cb
     * @returns {Array|Object|text}
     */
    UniFi.prototype.getDevices = function (site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        return _self._doGet('/api/s/' + s + '/stat/device', cb);
    };

    /**
     * Gets a list of sites
     * @param {type} cb
     * @returns {JSON}
     */
    UniFi.prototype.getSites = function (cb) {
        var _self = this;

        return _self._doGet('/api/self/sites', cb);
    };

    /**
     * Get a list of vouchers for this site
     * @param {type} cb - Called when GET is finished, params (err {boolean}, data {json})
     * @returns {JSON}
     */
    UniFi.prototype.getVouchers = function (cb) {
        var _self = this;

        return _self._doGet('/api/s/' + _self._options.site + '/stat/voucher', cb);
    };

    /**
     * Deletes a voucher with the specified ID
     * @param {type} id - The ID of the voucher to delete
     * @param {type} site - the site name to use, if none specified the options default will be used
     * @param {type} cb
     * @returns {JSON}
     */
    UniFi.prototype.deleteVoucher = function (id, site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        var params = {
            'cmd': 'delete-voucher',
            '_id': id
        };

        return _self._doPost('/api/s/' + s + '/cmd/hotspot', params, cb);
    };

    /**
     *
     * @param {String} path
     * @param {Function} cb - Called when GET is finished, params (err {boolean}, data {json})
     * @param {boolean} autologin - (optional) Overrides the auto login flag
     */
    UniFi.prototype._doGet = function (path, cb, autologin) {
        var _self = this;

        return _self._doHttpRequest(path, 'GET', null, cb, autologin);
    };

    /**
     * 
     * @param {type} path
     * @param {type} data - a String or JSON (which will be stringified) to send as the body
     * @param {type} cb - Called when POST is finished, params (err {boolean}, data {json})
     * @param {type} autologin - (optional) Overrides the auto login flag
     * @returns {JSON}
     */
    UniFi.prototype._doPost = function (path, data, cb, autologin) {
        var _self = this;

        return _self._doHttpRequest(path, 'POST', data, cb, autologin);
    };

    /**
     * 
     * @param {type} path
     * @param {type} type - The type of request to make, e.g. POST or GET
     * @param {type} data - a String or JSON (which will be stringified) to send as the body
     * @param {type} cb - Called when the request is finished, params (err {boolean}, data {json})
     * @param {type} autologin - (optional) Overrides the auto login flag
     * @returns {JSON}
     */
    UniFi.prototype._doHttpRequest = function (path, type, data, cb, autologin) {
        var _self = this;

        var al = autologin || _self._options.autoLogin;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open(type, 'https://' + _self._options.hostname + ':' + _self._options.port + path, false);
        xmlhttp.setRequestHeader('Cookie', _self._cookie);

        var result = null;

        xmlhttp.onloadend = function () {
            var resp = xmlhttp.response;
            var statusCode = resp.statusCode;
            var text = xmlhttp.responseText;
            if (text.length > 0) {
                try {
                    result = JSON.parse(xmlhttp.responseText);
                } catch (err) {
                    // TODO Handle error parsing JSON
                }
            }

            if (statusCode === 401 && al) { // Not logged in and auto login enabled.
                var result = _self.login();
                if (result) {
                    result = _self._doGet(path, cb);
                } else {
                    cb(true, result);
                }
            } else if (cb && typeof cb === 'function') {
                var err = false;
                if (statusCode !== 200) {
                    err = true;
                }
                cb(err, result);
            }
        };

        if (data !== null && typeof data !== 'undefined') {
            if (data.constructor === Object) {
                data = JSON.stringify(data);
            }
            xmlhttp.send(data);
        } else {
            xmlhttp.send();
        }

        return result;
    };

    UniFi.version = UniFi.prototype.version = '0.0.1';

    g.UniFi = UniFi;
})(this);