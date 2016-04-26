(function ($) {
    function initCreateSite() {
        var modal = $('#modal-add-site');
        var form = modal.find('form');

        form.forms({
            onSuccess: function (resp) {
                Msg.success(resp.messages);
                $('#site_table').reloadFragment();
            },
            onError: function () {
                Msg.error('Oh No! Something went wrong! Please try again :-)');
            }
        });
    }

    $(function () {
        initCreateSite();
    });
})(jQuery);