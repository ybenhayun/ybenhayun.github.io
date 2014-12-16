$(document).ready(function(){
  /*$("a.euler").click(function(){
    $("div.euler").toggle();
    if($("a.euler").html() != "(less)"){
      $("a.euler").html("(less)");
    } else {
      $("a.euler").html("(more)");
    }
  });*/
   
   $("a.1").click(function(){
    $("div.1").toggle();
    if($("a.1").html() != "(less)"){
      $("a.1").html("(less)");
    } else {
      $("a.1").html("(more)");
    }
  });

  $("a.2").click(function(){
    $("div.2").toggle();
    if($("a.2").html() != "(less)"){
      $("a.2").html("(less)");
    } else {
      $("a.2").html("(more)");
    }
  });

  $("div.1, div.2").hide();
 });