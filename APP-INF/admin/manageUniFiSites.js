(function (g) {
    controllerMappings
            .adminController()
            .path("/unifiHotspot$")
            .enabled(true)
            .defaultView(views.redirectView('/unifiHotspot/'))
            .build();

    controllerMappings
            .adminController()
            .path("/unifiHotspot/$")
            .enabled(true)
            .addMethod('GET', '_getBackup', 'backup')
            .addMethod('GET', '_getSites')
            .addMethod('POST', '_addSite', 'createNew')
            .defaultView(views.templateView('/theme/apps/unifiHotspot/manageUnifiSites.html'))
            .build();

    g._getSites = function (page, params) {
        var db = _getOrCreateUrlDb(page);

        var sites = db.findByType(_config.RECORD_TYPES.SITE);

        var voucherCountQuery = {
            "size": 0,
            "query": {
                "type": {
                    "value": "VOUCHER"
                }
            },
            "aggs": {
                "sites": {
                    "terms": {
                        "field": "siteId"
                    }
                }
            }
        };

        var result = db.search(JSON.stringify(voucherCountQuery));

        var resultJson = JSON.parse(result.toString());

        var m = formatter.newMap();

        for (var i in resultJson.aggregations.sites.buckets) {
            var b = resultJson.aggregations.sites.buckets[i];
            m.put(b.key, b.doc_count);
        }

        var json = [];

        for (var i in sites) {
            var j = sites[i].json;
            var jp = JSON.parse(j);
            var voucherC = 0;
            if (m.containsKey(jp.id)) {
                voucherC = m.get(jp.id);
            }

            jp.voucherCount = voucherC;

            json.push(jp);
        }

        page.attributes.sites = json;
    };

    g._getBackup = function () {
        var result = g._unifi.backupDownload();

        if (result) {
            var hash = fileManager.upload(result);
            return views.textView(hash);
        }
    };

    g._addSite = function (page, params) {
        var db = _getOrCreateUrlDb(page);

        var newTitle = safeString(params.title);
        var newId = safeString(params.id);

        if (isBlank(newId)) {
            return page.jsonResult(false, 'a Site ID is required');
        }

        if (isBlank(newTitle)) {
            newTitle = newId;
        }

        var siteName = _config.RECORD_NAMES.SITE(newId);

        if (isNotNull(db.child(siteName))) {
            return page.jsonResult(false, 'a Site with that ID already exists');
        }

        var curUser = securityManager.currentUser;

        var d = {
            id: newId,
            title: newTitle,
            createdBy: curUser.thisProfile.id,
            createdDate: formatter.formatDateISO8601(formatter.now),
            notes: ''
        };

        db.createNew(siteName, JSON.stringify(d), _config.RECORD_TYPES.SITE);

        return page.jsonResult(true, 'Site successfully added');
    };
})(this);