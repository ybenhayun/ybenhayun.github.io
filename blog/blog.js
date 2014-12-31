$(document).ready(function(){
  /*$("a.euler").click(function(){
    $("div.euler").toggle();
    if($("a.euler").html() != "(less)"){
      $("a.euler").html("(less)");
    } else {
      $("a.euler").html("(more)");
    }
  });*/
   
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