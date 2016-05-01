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

    function initSaveDetails() {
        var form = $('#details_form');

        form.forms({
            onSuccess: function (resp) {
                if (resp.status) {
                    if (resp.nextHref) {
                        window.location = resp.nextHref;
                    } else {
                        Msg.success(resp.messages);
                    }
                }
            }
        });
    }

    function initDelVoucher() {
        $('body').on('click', '.btn-del-voucher', function (e) {
            e.preventDefault();

            var btn = $(this);
            var tr = btn.closest('tr');
            var code = tr.data('code');

            if (confirm('Are you sure you want to delete this voucher?')) {
                $.ajax({
                    url: code,
                    type: 'DELETE',
                    success: function (data, textStatus, jqXHR) {
                        tr.remove();
                    }
                });
            }
        });
    }

    $(function () {
        initCreateVouchers();
        initSaveDetails();
        initDelVoucher();
    });
})(jQuery);