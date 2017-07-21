$(function() {

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

});
