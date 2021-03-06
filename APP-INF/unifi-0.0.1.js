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
     * @param {type} cb - Called when GET is finished, params (data {json})
     * @returns {JSON}
     */
    UniFi.prototype.getClients = function (cb) {
        var _self = this;

        return _self._doGet('/api/s/' + _self._options.site + '/stat/sta', cb);
    };

    /**
     * Get's a list of authorized clients
     * @param {type} site
     * @param {type} cb
     * @returns {unifi-0.0.1_L1.UniFi.prototype._doHttpRequest.result|JSON}
     */
    UniFi.prototype.getGuests = function (site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        return _self._doGet('/api/s/' + s + '/stat/guest', cb);
    };

    /**
     * Get a list of unifi devices for this site
     * @param {type} site - the site name to use, if none specified the options default will be used
     * @param {type} cb - Called when GET is finished, params (data {json})
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
     * @param {String} site - the site name to use, if none specified the options default will be used
     * @param {type} cb - Called when GET is finished, params (data {json})
     * @returns {JSON}
     */
    UniFi.prototype.getVouchers = function (site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        return _self._doGet('/api/s/' + s + '/stat/voucher', cb);
    };

    /**
     * Deletes a voucher with the specified ID
     * @param {String} id - The ID of the voucher to delete
     * @param {String} site - the site name to use, if none specified the options default will be used
     * @param {Function} cb
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
     * Authorize a guest
     *
     * @param {JSON} params - The params for the guest,
     * {
     *  mac: (String - Required) - The mac address of the client,
     *  minutes: (Number - Required) - The number of minutes the client is authorized for
     *  up: (Number - Optional) - The max upload speed in kbps
     *  down: (Number - Optional) - The max download speed in kbps
     *  bytes: (Number - Optional) - The max data they can use in MB
     * }
     * @param {String} site - the site name to use, if none specified the options default will be used
     * @param {Function} cb
     * @returns {JSON}
     */
    UniFi.prototype.authorizeGuest = function (params, site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        var opts = $.extend({}, params);
        opts.cmd = 'authorize-guest';

        return _self._doPost('/api/s/' + s + '/cmd/stamgr', opts, cb);
    };

    /**
     * Unauthorize a guest
     * 
     * @param {type} mac - The mac address of the client to unauthorize (Required)
     * @param {type} site - the site name to use, if none specified the options default will be used
     * @param {type} cb
     * @returns {unifi-0.0.1_L1.UniFi.prototype._doHttpRequest.result|JSON}
     */
    UniFi.prototype.unauthorizeGuest = function (mac, site, cb) {
        var _self = this;

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        var params = {
            'cmd': 'unauthorize-guest',
            'mac': mac
        };

        return _self._doPost('/api/s/' + s + '/cmd/stamgr', params, cb);
    };

    /**
     * Queries the controller to do a backup and returns the URL of the file
     *
     * @param {Integer} days
     * @param {String} site
     * @param {Function} cb
     * @returns {JSON}
     */
    UniFi.prototype.backup = function (days, site, cb) {
        var _self = this;

        if (typeof days === 'function') {
            cb = days;
            days = -1;
        }

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        var params = {
            cmd: "backup",
            days: "-1"
        };

        return _self._doPost('/api/s/' + s + '/cmd/system', params, cb);
    };

    /**
     *
     * @param {Integer} days
     * @param {String} site
     * @param {Function} cb
     * @returns {JSON}
     */
    UniFi.prototype.backupDownload = function (days, site, cb) {
        var _self = this;

        if (typeof days === 'function') {
            cb = days;
            days = -1;
        }

        if (typeof site === 'function') {
            cb = site;
            site = null;
        }

        var s = site || _self._options.site;

        var params = {
            cmd: "backup",
            days: "-1"
        };

        var result = _self._doPost('/api/s/' + s + '/cmd/system', params);
        if (result.status) {
            var url = result.data.data[0].url;
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open('GET', 'https://' + _self._options.hostname + ':' + _self._options.port + url, false);
            xmlhttp.setRequestHeader('Cookie', _self._cookie);

            var data = null;

            xmlhttp.onloadend = function () {
                data = xmlhttp.response.responseBodyAsBytes;
            };

            xmlhttp.send();

            return data;
        } else {
            return null;
        }
    };

    /**
     *
     * @param {String} path
     * @param {Function} cb - Called when GET is finished, params (data {json})
     * @param {boolean} autologin - (optional) Overrides the auto login flag
     */
    UniFi.prototype._doGet = function (path, cb, autologin) {
        var _self = this;

        return _self._doHttpRequest(path, 'GET', null, cb, autologin);
    };

    /**
     * 
     * @param {String} path
     * @param {JSON|String} data - a String or JSON (which will be stringified) to send as the body
     * @param {Function} cb - Called when POST is finished, params (data {json})
     * @param {boolean} autologin - (optional) Overrides the auto login flag
     * @returns {JSON}
     */
    UniFi.prototype._doPost = function (path, data, cb, autologin) {
        var _self = this;

        return _self._doHttpRequest(path, 'POST', data, cb, autologin);
    };

    /**
     * 
     * @param {String} path
     * @param {String} type - The type of request to make, e.g. POST or GET
     * @param {JSON|String} data - a String or JSON (which will be stringified) to send as the body
     * @param {Function} cb - Called when the request is finished, params (data {json})
     * @param {boolean} autologin - (optional) Overrides the auto login flag
     * @returns {JSON}
     */
    UniFi.prototype._doHttpRequest = function (path, type, data, cb, autologin) {
        var _self = this;

        var al = autologin || _self._options.autoLogin;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open(type, 'https://' + _self._options.hostname + ':' + _self._options.port + path, false);
        xmlhttp.setRequestHeader('Cookie', _self._cookie);

        var result = {
            status: false,
            code: null,
            data: null
        };

        xmlhttp.onloadend = function () {
            var resp = xmlhttp.response;
            var statusCode = resp.statusCode;
            var text = xmlhttp.responseText;

            if (text.length > 0) {
                try {
                    result.data = JSON.parse(xmlhttp.responseText);
                } catch (ex) {
                    result.error = ex;
                }
            }

            if (statusCode === 401 && al) { // Not logged in and auto login enabled.
                var lg = _self.login();
                if (lg) {
                    result = _self._doHttpRequest(path, type, data, cb, autologin);
                }
            } else if (statusCode === 200) {
                result.code = statusCode;
                result.status = true;
            } else {
                result.code = statusCode;
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

        if (cb && typeof cb === 'function') {
            cb(result);
        }

        return result;
    };

    UniFi.version = UniFi.prototype.version = '0.0.1';

    g.UniFi = UniFi;
})(this);