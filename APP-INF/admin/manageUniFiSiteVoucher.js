(function (g) {
    controllerMappings
            .adminController()
            .path("/unifiHotspot/(?<site>[^/]*)/(?<voucher>[^/]*)$")
            .enabled(true)
            .addPathResolver('site', '_resolveSite')
            .addPathResolver('voucher', '_resolveVoucher')
            .addMethod('DELETE', '_deleteVoucher')
            .build();

    g._deleteVoucher = function (page) {
        var record = page.attributes.voucher;

        record.delete();
    };
})(this);