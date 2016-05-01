(function ($) {
    function initCreateVouchers() {
        var modal = $('#modal-add-site');
        var form = modal.find('form');

        form.forms({
            onSuccess: function (resp) {
                Msg.success(resp.messages);
                $('#voucher_table').reloadFragment();
            },
            onError: function () {
                Msg.error('Oh No! Something went wrong! Please try again :-)');
            }
        });
    }

    $(function () {
        initCreateVouchers();
    });
})(jQuery);