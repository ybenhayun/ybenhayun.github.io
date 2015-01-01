$(document).ready(function(){
   $(".prob a").click(function(){
    var myClass = $(this).attr('class');
    $('div').filter('.'+myClass).toggle();
    if($(this).html() != "(less)"){
      $(this).html("(less)");
    } else {
      $(this).html("(more)");
    }
  });
  $("div.1, div.2").hide();
 });