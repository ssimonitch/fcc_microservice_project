$(function() {

  // timestamp handlers
  $('#timestamp-form').submit(function(event) {
    event.preventDefault();

    var $form = $(this),
      date = $form.find('input[name=\'date\']').val(),
      url = $form.attr('action');

    var post = $.post(url, JSON.stringify({date: date}), 'json');

    post.done(function(data) {
      $('#unix').text('UNIX: ' + data.unix);
      $('#natural').text('NATURAL: ' + data.natural);
      console.log(data);
    });

    $('input[name=\'date\']').val('');
  });

  // shorten handlers
  $('#shorten-form').submit(function(event) {
    event.preventDefault();

    var $form = $(this),
      long_url = $form.find('input[name=\'long_url\']').val(),
      endpoint = $form.attr('action');

    var post = $.post(endpoint, JSON.stringify({url: long_url}), 'json');

    post.done(function(data) {
      // grab the url
      var src = window.location.href + data.short_url;
      $('#short_url').prev().toggle();

      // add url and link and toggle hidden
      $('#short_url').append('<strong>' + src + '</strong>').wrap(function() {
        return '<a href="' + src + '" target="_blank"/>';
      });

      // fade in protip
      setTimeout(function() {
        $('#protip').fadeIn('slow');
      }, 1000);

      $('.killer').wrap(function() {
        return '<a href="' + src + '+' + '" target="_blank"/>';
      });
    });

    $('input[name=\'long_url\']').val('');
  });

});
