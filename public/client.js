$(function() {
  console.log('hello world :o');
  
  // $.get('/dreams', function(dreams) {
  //   dreams.forEach(function(dream) {
  //     $('<li></li>').text(dream).appendTo('ul#dreams');
  //   });
  // });

  $('#timestamp-form').submit(function(event) {
    event.preventDefault();
    var date = $('input').val();
    $.post('/api/timestamp', { date: date }, function() {
      
    });
  });

});
