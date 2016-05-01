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
            .addMethod('GET', '_getVouchers')
            .addMethod('POST', '_addVoucher', 'createNew')
            .addMethod('POST', '_saveDetails', 'title')
            .defaultView(views.templateView('/theme/apps/unifiHotspot/manageUnifiSite.html'))
            .addPathResolver('site', '_resolveSite')
            .title(function (page) {
                return 'UniFi Hotspot: ' + page.attributes.site.title;
            })
            .build();

    controllerMappings
            .adminController()
            .path('/unifiHotspot/(?<site>[^/]*)/(?<voucher>[^/]*)$')
            .enabled(true)
            .addMethod('DELETE', '_deleteVoucher')
            .addPathResolver('site', '_resolveSite')
            .addPathResolver('voucher', '_resolveVoucher')
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
                                "value": _config.RECORD_TYPES.VOUCHER
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

        var result = db.search(JSON.stringify(voucherQuery));
        log.info('result {}', result);

        var vouchers = formatter.newArrayList();

        var vResult = JSON.parse(result.toString());
        var hits = vResult.hits.hits;

        for (var i in hits) {
            var h = hits[i];

            var json = h._source;
            json.id = h._id;

            if (!json.macs) {
                json.macs = [];
            }

            json.status = 'Valid';
            if (json.devices && json.macs.length >= json.devices) {
                json.status = 'Used';
            }

            vouchers.add(json);
        }

        page.attributes.vouchers = vouchers;
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

    g._saveDetails = function (page, params) {
        var db = _getOrCreateUrlDb(page);
        var site = page.attributes.site;

        var siteJson = JSON.parse(site.json);

        var newId = safeString(params.id);
        var newTitle = safeString(params.title);
        var newNotes = safeString(params.notes);

        if (isBlank(newId)) {
            var jr = views.jsonResult(false);
            jr.addFieldMessage('name', 'This field is required.');
            return views.jsonObjectView(jr);
        }

        var nameChanged = (newId != siteJson.id);

        siteJson.id = newId;
        siteJson.title = newTitle;
        siteJson.notes = newNotes;

        var newHref = null;

        if (nameChanged) {
            var siteName = _config.RECORD_NAMES.SITE(newId);

            newHref = '/unifiHotspot/' + newId + '/';
            site.delete();
            site = db.createNew(siteName, JSON.stringify(siteJson), _config.RECORD_TYPES.SITE);
        } else {
            site.update(JSON.stringify(siteJson));
        }

        return page.jsonResult(true, 'Successfully saved', newHref);
    };

    g._deleteVoucher = function (page) {
        page.attributes.voucher.delete();
    };
})(this);