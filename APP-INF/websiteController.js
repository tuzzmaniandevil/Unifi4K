(function (g) {
    controllerMappings
            .websiteController()
            .path("/guest/s/(?<siteName>[^/]*)/")
            .enabled(true)
            .isPublic(true)
            .addMethod('GET', '_authClient')
            .addMethod('POST', '_authVoucher')
            .postPriviledge('READ_CONTENT')
            .build();

    g._authClient = function (page, params) {
        if (!params.containsKey('id') || !params.containsKey('ssid')) {
            return views.templateView('/theme/apps/unifiHotspot/missingParams.html');
        }
        var device_mac = safeString(params.id);
        var myDevice = null;

        var devices = g._unifi.getGuests(page.attributes.siteName);

        if (devices.status) {
            for (var i in devices.data.data) {
                var d = devices.data.data[i];
                if (d.mac == device_mac) {
                    myDevice = d;
                    break;
                }
            }
        }

        var response = http.response;
        response.setCookie('mac', device_mac);
        response.setCookie('ssid', safeString(params.ssid));
        response.setCookie('url', safeString(params.url));

        if (isNull(myDevice)) { // Not authorized
            return views.templateView('/theme/apps/unifiHotspot/notAuthorized.html');
        } else { // Authorized
            return views.templateView('/theme/apps/unifiHotspot/authorized.html');
        }
    };

    g._authVoucher = function (page, params) {
        var db = _getOrCreateUrlDb(page);
        var siteName = page.attributes.siteName;

        var voucherCode = safeString(params.voucherCode);
        var mac_cookie = http.request.getCookie('mac');

        if (isNull(mac_cookie) || isBlank(mac_cookie.value)) {
            return page.jsonResult(false, 'No MAC cookie found.');
        }

        voucherCode = voucherCode.replaceAll("[^\\d]", "").trim();
        var device_mac = safeString(mac_cookie.value);

        if (isBlank(voucherCode)) {
            return page.jsonResult(false, "Voucher can't be blank.");
        }

        log.info('Voucher Code: {} | Mac: {}', voucherCode, device_mac);

        var voucherName = _config.RECORD_NAMES.VOUCHER(voucherCode);

        var voucher = db.child(voucherName);

        if (isNull(voucher)) {
            return page.jsonResult(false, "Voucher code not found");
        }

        var voucherJson = JSON.parse(voucher.json);
        var createdById = voucher.createdBy;
        var createdBy = applications.userApp.findUserResourceById(createdById);

        if (isNull(voucherJson.macs)) {
            voucherJson.macs = [];
        }

        if (isNotNull(voucherJson.maxClients)) {
            if (voucherJson.macs.length >= voucherJson.maxClients) {
                return page.jsonResult(false, "This voucher has already been used.");
            }
        }

        voucherJson.macs.push(device_mac);

        securityManager.runAsUser(createdBy, function () {
            voucher.update(JSON.stringify(voucherJson));
        });

        var params = {
            mac: device_mac,
            minutes: voucher.minutes
        };
        if (isNotNull(voucher.upLimit)) {
            params.up = voucher.upLimit;
        }

        if (isNotNull(voucher.downLimit)) {
            params.down = voucher.downLimit;
        }

        if (isNotNull(voucher.bytesLimit)) {
            params.bytes = voucher.bytesLimit;
        }

        g._unifi.authorizeGuest(params, siteName);

        var redirectURL = null;
        var urlCookie = http.request.getCookie('url');
        if (isNotNull(urlCookie) && isNotBlank(urlCookie.value)) {
            redirectURL = urlCookie.value;
        }

        return page.jsonResult(true, 'Successfully authorized', redirectURL);
    };
})(this);