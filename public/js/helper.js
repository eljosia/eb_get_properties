const env = $('meta[name="env"]').attr('content');
var target = document.querySelector("#kt_app_body");
var blockUI = new KTBlockUI(target, {
    message: '<div class="blockui-message"><span class="spinner-border text-primary"></span> Cargando...</div>',
});
moment.locale('es');

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toastr-top-center",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "400",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

if ($.fn.dataTable && $.fn.dataTable.defaults) {
    $.extend(true, $.fn.dataTable.defaults, {
        responsive: true,
        searchDelay: 500,
        language: {
            paginate: {
                previous: "<",
                next: '>',
            },
            search: 'Buscar:',
            info: 'Mostrando _START_ al _END_ de _TOTAL_ registros',
            loadingRecords: 'Cargando datos...',
        },
        dom: 'rt<"bottom row"<"col-12 d-flex justify-content-center"i><"col-12 d-flex justify-content-center"p>>',
    });
}

h = {
    getPetition: (path, params, type = 'POST', async = true) => {
        return getPetition = new Promise((resolve, reject) => {
            let token = $('meta[name="csrf-token"]').attr('content');
            let user_id = $('meta[name="data-user"]').attr('content');
            let activeBusiness = $('meta[name="activeBusiness"]').attr('content');
            let _token = { '_token': token, 'api': true, 'by_user_id': user_id, 'business_id': activeBusiness };
            $.extend(true, params, _token);

            console.log("type: " + type)
            $.ajax({
                type: type,
                async: async,
                url: path,
                dataType: 'json',
                data: params,
                headers: {
                    'X-CSRF-TOKEN': token,
                    'Authorization': 'Bearer ' + $('meta[name="auth-key"]').attr('content'),
                },
                success: (data) => {
                    resolve(data);
                },
                error: (err) => {
                    if (err.status == 422) {
                        if (err.message)
                            toastr.warning(err.message);
                    } else if (err.status == 404) {
                        toastr.error('No se encuentra el ID', 'error');
                    } else if (err.status === 401) {
                        toastr.error('Ocurrió un error de autorización, recarge la pagina', 'error')
                    } else {
                        reject(err);
                    }
                },
                beforeSend: function () {
                    blockUI.block();
                },
                complete: function () {
                    blockUI.release();
                }
            });
        });
    },
    sendForm: (id) => {
        return sendForm = new Promise(function (resolve, reject) {
            var idform = id;
            var url = $(idform).attr('action');
            var errors = document.querySelectorAll('.error');
            var submit = $('button[type=submit]', idform);
            // 
            var textSubmit = submit.html();
            let user_id = $('meta[name="data-user"]').attr('content');
            let activeBusiness = $('meta[name="activeBusiness"]').attr('content');
            $('.error').text('');

            $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Authorization': 'Bearer ' + $('meta[name="auth-key"]').attr('content'),
                }
            });
            let formData = new FormData(idform);
            formData.append('by_user_id', user_id);
            formData.append('business_id', activeBusiness);

            $.ajax({
                type: 'POST',
                url: url,
                data: formData,
                processData: false, // tell jQuery not to process the data
                contentType: false, // tell jQuery not to set contentType,
                success: function (data) {
                    resolve(data);
                },
                error: (err) => {
                    if (err.status == 422) {
                        if (err.message)
                            toastr.warning(err.message);
                    } else if (err.status == 404) {
                        toastr.error('No se encuentra el ID', 'error');
                    } else if (err.status == 500) {
                        toastr.error(`ERROR: ${err.responseJSON.message}`, 'error')
                    } else {
                        reject(err);
                    }
                },
                beforeSend: function () {
                    submit.html('<i class="fas fa-spinner fa-spin"></i>');
                    submit.prop('disabled', true);
                    blockUI.block();
                },
                complete: function () {
                    submit.html(textSubmit);
                    submit.prop('disabled', false);
                    if (blockUI.isBlocked()) {
                        blockUI.release();
                    }
                }
            });
        })
    }
};

$('.auto-submit').on('submit', function (e) {
    e.preventDefault();
    var idform = this;
    var errors = document.querySelectorAll('.error');
    $('.error').text('');

    h.sendForm(idform).then(data => {
        if (data.success) {
            toastr.success(data.msg);

            if (data.action) {
                if (data.action == 'datatable') {
                    setTimeout(function () { $(`#${data.table_id}`).DataTable().ajax.reload() }, 1001)
                } else if (data.action == "reload") {
                    location.reload();
                } else {
                    setTimeout(function () {
                        location.href = data.action;
                    }, 2000)
                }
            }
            if (data.modal_id) {
                $(`#${data.modal_id}`).modal('hide');
            }
        } else {
            toastr.error("Ops... " + data.msg);
            if (data.errors) {
                console.log(data.errors)
                errors.forEach(function (span) {
                    var name = $(span).data('name');
                    $(`[data-name="${name}"]`).text(data.errors[name])
                })
            }
        }
    });
});

const swalbs = Swal.mixin({
    customClass: {
        container: 'my-swal-container',
        htmlContainer: 'my-swal-container',
        popup: 'my-swal-popup',
        header: 'my-swal-header',
        title: 'my-swal-title',
        closeButton: 'my-swal-closeButton',
        content: 'my-swal-content',
        actions: 'my-swal-actions',
        footer: 'my-swal-footer',
        icon: 'my-swal-icon'
    }
});

$('body').on('click', '[data-action]', function (e) {
    e.preventDefault();

    var $this = this;
    var url = $($this).data('url');
    var account_id = $($this).data('id');
    var action = $($this).data('action');

    switch (action) {
        case 'delete':
            swalbs.fire({
                title: '¿Confirma eliminarlo?',
                text: "Una vez hecho esto, no podrás deshacer esta acción",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#f36',
                cancelButtonColor: '#cfd6df',
                confirmButtonText: 'Confirmar'
            }).then((result) => {
                if (result.isConfirmed) {
                    h.getPetition(url, { id: account_id }, 'DELETE', false).then(data => {
                        if (data.success == true) {
                            toastr.success(data.msg);
                            if (data.action) {
                                setTimeout(function () {
                                    location.href = data.action;
                                }, 2000)
                            } else {
                                $(`#${data.table_id}`).DataTable().ajax.reload();
                            }
                        } else {
                            toastr.error((data.msg) ? data.msg : 'Ha ocurrido un error', "Ops...",);
                            console.log(data)
                        }
                    });
                }
            })
            break;
            case 'restore':
                swalbs.fire({
                    title: '¿Confirma Restaurarlo?',
                    text: "Se activara este usuario",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#f36',
                    cancelButtonColor: '#cfd6df',
                    confirmButtonText: 'Confirmar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        h.getPetition(url, { id: account_id }, 'DELETE', false).then(data => {
                            if (data.success == true) {
                                toastr.success(data.msg);
                                if (data.action) {
                                    setTimeout(function () {
                                        location.href = data.action;
                                    }, 2000)
                                } else {
                                    $(`#${data.table_id}`).DataTable().ajax.reload();
                                }
                            } else {
                                toastr.error((data.msg) ? data.msg : 'Ha ocurrido un error', "Ops...",);
                                console.log(data)
                            }
                        });
                    }
                })
                break;            
        case 'active':

            h.getPetition('/api/clients', { account_id: account_id }, 'GET', true).then(response => {
                var data = response.data[0];

                if (response.data['length'] > 0) {
                    $('#name').html(data.name);
                    $('#account_id').val(data.account_id);

                    // bModal('active-account-modal-form')
                    $("#active-account-modal-form").modal("show");
                }
                else {
                    toastr.warning('No se encuentra el cliente.')
                }
            });
            break;

        case 'share':
            e.preventDefault();
            var title = $(this).data('share-title');
            var text = $(this).data('share-text');
            var url = ($(this).data('share-url')) ? $(this).data('share-url') : window.location.href;
            if (navigator.share) { // Comprobamos si el navegador soporta la API de compartir
                navigator.share({
                    title: title,
                    text: text,
                    url: url
                })
                    .then(() => console.log('Contenido compartido con éxito'))
                    .catch((error) => console.log('Error al compartir', error));
            } else {
                toastr.warning('Tu navegador no soporta la función de compartir.');
            }
            break;
    }
});

// Phone
if ($('#phone').length)
    Inputmask({
        'mask': '(999) 999-9999'
    }).mask('#phone');


///// UTILS /////
var utils = function () {
    var _currency = function (value, fixed, symbol = '$') {
        return symbol + parseFloat(value).toFixed(fixed).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    }
    var _format_date = function (date) {
        var datePart = date.match(/\d+/g),
            year = datePart[0].substring(2),
            month = datePart[1], day = datePart[2];
        return day + '/' + month + '/' + year;
    }
    var _number = function (value, fixed) {
        return parseFloat(value).toFixed(fixed).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1");
    }

    return {
        formatDate: function (date) {
            // yyyy-mm-dd to dd/mm/yyyy
            return _format_date(date);
        },
        format: function (value, fixed = 2, symbol = '$') {
            return {
                "currency": _currency(value, fixed, symbol),
                "number": _number(value, fixed)
            }
        },
    }
}();
