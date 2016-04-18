controllerMappings
        .adminController()
        .path("/unifiTest$")
        .enabled(true)
        .addMethod('GET', 'testUniFi')
        .build();

function testUniFi() {
    var opt = {
        hostname: 'unifi.tuzza.co',
        username: 'admin',
        password: 'Dylan3814',
        site: 'stzhb504'
    };

    var unifi = new UniFi(opt);

    var d = unifi.getSites();

    return views.textView('Data: ' + JSON.stringify(d));
}