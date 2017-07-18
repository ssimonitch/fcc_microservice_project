$(function() {
  console.log('hello world :o');
  
  // $.get('/dreams', function(dreams) {
  //   dreams.forEach(function(dream) {
  //     $('<li></li>').text(dream).appendTo('ul#dreams');
  //   });
  // });

  $('#timestamp-form').submit(function(event) {
    
    event.preventDefault();
    
    var $form = $( this ),
        date = $form.find( "input[name='date']" ).val(),
        url = $form.attr( "action" );
    
    var post = $.post(url, JSON.stringify({ date: date}), 'json');
    
    console.log(post);
    
    post.done(function(data) {
      $('#unix').text('UNIX: ' + data.unix);
      $('#native').text('NATIVE: ' + data.native);
    })
  });

});
