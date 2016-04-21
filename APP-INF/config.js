(function (g) {

    function config() {
        var _self = this;

        _self.APP_ID = controllerMappings.appName;
        _self.DB_NAME = _self.APP_ID + '_db';
        _self.DB_TITLE = 'UniFi Hotspot DB';

        _self.RECORD_NAMES = {
            SITE: function (name) {
                return 'SITE_' + name;
            },
            VOUCHER: function (name) {
                return 'VOUCHER_' + name;
            }
        };

        _self.RECORD_TYPES = {
            SITE: 'SITE',
            VOUCHER: 'VOUCHER'
        };
    }

    g._config = new config();

    controllerMappings
            .dependencies()
            .add('KongoDB')
            .build();
})(this);