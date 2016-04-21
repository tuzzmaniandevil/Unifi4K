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

        if (isNull(myDevice)) { // Not authorized
            return views.templateView('/theme/apps/unifiHotspot/notAuthorized.html');
        } else { // Authorized
            return views.templateView('/theme/apps/unifiHotspot/authorized.html');
        }
    };

    g._authVoucher = function (page, params) {
        log.info('Params {}', params);

        return page.jsonResult(true);
    };
})(this);