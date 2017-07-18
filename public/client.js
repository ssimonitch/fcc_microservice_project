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
    
    var result = $.post(url, { date: date}, 'json');
    
    $.post('/api/timestamp', { date: date }, function(data) {
      console.log(data)
    }, "json");
  });

});
