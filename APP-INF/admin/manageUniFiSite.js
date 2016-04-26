(function (g) {
    controllerMappings
            .adminController()
            .path("/unifiHotspot/(?<site>[^/]*)$")
            .enabled(true)
            .addMethod('GET', '_checkRedirect')
            .build();

    controllerMappings
            .adminController()
            .path("/unifiHotspot/(?<site>[^/]*)/$")
            .enabled(true)
            .addMethod('POST', '_addVoucher', 'createNew')
            .addPathResolver('site', '_resolveSite')
            .build();

    controllerMappings
            .adminController()
            .path("/unifiHotspot/(?<site>[^/]*)/site.json$")
            .enabled(true)
            .addMethod('GET', '_getVouchers')
            .addPathResolver('site', '_resolveSite')
            .build();

    g._getVouchers = function (page) {
        var db = _getOrCreateUrlDb(page);
        var site = page.attributes.site;

        var voucherQuery = {
            "size": 10000,
            "query": {
                "bool": {
                    "must": [
                        {
                            "type": {
                                "value": "VOUCHER"
                            }
                        },
                        {
                            "term": {
                                "siteId": site.id
                            }
                        }
                    ]
                }
            }
        };

        var siteJson = JSON.parse(site.json);

        var result = db.search(JSON.stringify(voucherQuery));
        log.info('result {}', result);

        var vouchers = [];

        var vResult = JSON.parse(result.toString());
        var hits = vResult.hits.hits;
        
         for (var i in hits) {
         var h = hits[i];
         
         var json = h._source;
         json.id = h._id;
         
         vouchers.push(json);
         }
         
         siteJson.vouchers = vouchers;

        return views.textView(JSON.stringify(siteJson), 'application/json');
    };

    g._addVoucher = function (page, params) {
        var db = _getOrCreateUrlDb(page);
        var site = page.attributes.site;
        var siteId = site.id;
        var curUser = securityManager.currentUser;

        var createdDate = formatter.formatDateISO8601(formatter.now);
        var createdBy = curUser.thisProfile.id;

        var quantity = safeInt(params.quantity);
        params.remove('quantity');

        for (var i = 0; i < quantity; i++) {
            var d = populateFields(params, {
                createdDate: createdDate,
                createdBy: createdBy,
                siteId: siteId,
                macs: []
            });
            var newCode = generateRandomCode(10);
            while (isNotNull(db.child(_config.RECORD_NAMES.VOUCHER(newCode)))) {
                newCode = generateRandomCode(10);
            }
            d.code = newCode;

            db.createNew(_config.RECORD_NAMES.VOUCHER(newCode), JSON.stringify(d), _config.RECORD_TYPES.VOUCHER);
        }

    };
})(this);