(function (g) {
    var UniFi = function (options) {
        var _self = this;

        _self._cookie = '';

        _self._options = $.extend({
            hostname: 'localhost',
            port: 8443,
            site: 'default',
            username: 'admin',
            password: 'admin'
        }, options);
    };

    UniFi.prototype.login = function () {
        var _self = this;

        var params = {
            login: 'Login',
            username: _self._options.username,
            password: _self._options.password
        };

        var xmlhttp = new XMLHttpRequest();

        xmlhttp.open("POST", 'https://' + _self._options.hostname + ':' + _self._options.port + '/login', false);
        xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        xmlhttp.onloadend = function () {
            var resp = xmlhttp.response;
            var statusCode = resp.statusCode;
            log.info('Status Code', statusCode);
        };

        xmlhttp.send($.param(params));
    };

    UniFi.version = UniFi.prototype.version = '0.0.1';

    g.UniFi = UniFi;
})(this);