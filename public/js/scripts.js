$(document).ready(function () {
    $('.l1').on('click', function () {
        var tag = $(this).attr('value');
        var back_link = "#layer" + tag;
        $('.nav-link').attr('href', back_link);
        $('.nav-link').attr('value', tag);
        $("#layer" + tag).removeClass('hide-menu');
        $("#layer" + tag).toggleClass('show-menu');
    });
});

$("body").delegate(".menu-icon", "click", function () {
    $(".sidebar").toggleClass("sidebar-open");
});
$("body").delegate(".navigation-link", "click", function () {
    $(".sidebar").removeClass("sidebar-open");
});

$("body").delegate(".file_multi_video", "change", function () {
    var $source = $('#video_here');
    $source[0].src = URL.createObjectURL(this.files[0]);
    $source.parent()[0].load();
});