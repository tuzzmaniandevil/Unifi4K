(function (g) {
    // init UniFi controller
    g._unifi = new UniFi({
        hostname: 'unifi.tuzza.co',
        username: 'admin',
        password: 'Dylan3814'
    });

    g._getOrCreateUrlDb = function (page) {
        var jsonDb = page.find('/jsondb');
        var db = jsonDb.child(_config.DB_NAME);
        log.info("jsonDb = {} db = {}", jsonDb, db);
        if (isNull(db)) {
            db = jsonDb.createDb(_config.DB_NAME, _config.DB_TITLE, _config.DB_NAME);

            _updateMappings(db);

            _setAllowAccess(db, true);
        }

        return db;
    }

    g._setAllowAccess = function (jsonDB, allowAccess) {
        transactionManager.runInTransaction(function () {
            jsonDB.setAllowAccess(allowAccess);
        });
    };

    g._checkRedirect = function (page, params) {
        var href = page.href;
        if (!href.endsWith('/')) {
            return views.redirectView(href + '/');
        }
    };

    g._updateMappings = function (db) {
        var b = formatter.newMapBuilder()
                .field(_config.RECORD_TYPES.SITE, JSON.stringify(siteMapping))
                .field(_config.RECORD_TYPES.VOUCHER, JSON.stringify(voucherMapping));

        log.info('Update mappings for {} | {}', db, b);

        db.updateTypeMappings(b);
    };

    /*==== Resolvers ====*/
    g._resolveSite = function (rf, groupName, groupVal) {
        var db = _getOrCreateUrlDb(rf);

        var siteName = _config.RECORD_NAMES.SITE(groupVal);
        return db.child(siteName);
    };
})(this);

var siteMapping = {
    "properties": {
        "id": {
            "type": "string",
            "index": "not_analyzed"
        },
        "title": {
            "type": "string"
        },
        "createdDate": {
            "type": "date"
        },
        "createdBy": {
            "type": "string",
            "index": "not_analyzed"
        }
    }
};

var voucherMapping = {
    "properties": {
        "siteId": {
            "type": "string",
            "index": "not_analyzed"
        },
        "ssid": {
            "type": "string",
            "index": "not_analyzed"
        },
        "code": {
            "type": "string",
            "index": "not_analyzed"
        },
        "createdDate": {
            "type": "date"
        },
        "createdBy": {
            "type": "string",
            "index": "not_analyzed"
        },
        "minutes": {
            "type": "long"
        },
        "upLimit": {
            "type": "long"
        },
        "downLimit": {
            "type": "long"
        },
        "bytesLimit": {
            "type": "long"
        },
        "maxClients": {
            "type": "long"
        },
        "macs": {
            "type": "string",
            "index": "not_analyzed"
        }
    }
};