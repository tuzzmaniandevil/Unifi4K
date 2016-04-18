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
        password: 'Dylan3814'
    };

    var unifi = new UniFi(opt);

    var result = {};

    unifi.getVouchers('stzhb504', function (resp) {
        result = resp;
    });

    return views.textView(JSON.stringify(result));
}