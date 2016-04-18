(function (g) {
    var UniFi = function (options) {
        var _self = this;

        _self._cookie = '';
        _self._loginAttempt = 0;

        _self._options = $.extend({
            hostname: 'localhost',
            port: 8443,
            site: 'default',
            username: 'admin',
            password: 'admin',
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
        log.info('Data: {}', data);

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
     * Get a list of vouchers for this site
     * @param {type} cb - Called when GET is finished, params (err {boolean}, data {json})
     * @returns {JSON}
     */
    UniFi.prototype.getVouchers = function (cb) {
        var _self = this;

        return _self._doGet('/api/s/' + _self._options.site + '/stat/voucher', cb);
    };

    UniFi.prototype.deleteVoucher = function (id, cb) {
        var params = {
            'cmd': 'delete-voucher',
            '_id': id
        };
    };

    /**
     * Get a list of devices for this site
     * @param {type} cb
     * @param {type} site - the site name to use, if none specified the options default will be used
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
     *
     * @param {String} path
     * @param {Function} cb - Called when GET is finished, params (err {boolean}, data {json})
     */
    UniFi.prototype._doGet = function (path, cb, autologin) {
        var _self = this;

        var al = autologin || _self._options.autoLogin;

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", 'https://' + _self._options.hostname + ':' + _self._options.port + path, false);
        xmlhttp.setRequestHeader('Cookie', _self._cookie);

        var data = null;

        xmlhttp.onloadend = function () {
            var resp = xmlhttp.response;
            var statusCode = resp.statusCode;
            var text = xmlhttp.responseText;
            if (text != null && text.length > 0) {
                data = JSON.parse(xmlhttp.responseText);
            } else {
                data = text;
            }

            if (statusCode === 401 && al) { // Not logged in and auto login enabled.
                var result = _self.login();
                if (result) {
                    data = _self._doGet(path, cb);
                } else {
                    cb(true, data);
                }
            } else if (cb && typeof cb === 'function') {
                var err = false;
                if (statusCode !== 200) {
                    err = true;
                }
                cb(err, data);
            }
        };

        xmlhttp.send();

        return data;
    };

    UniFi.version = UniFi.prototype.version = '0.0.1';

    g.UniFi = UniFi;
})(this);