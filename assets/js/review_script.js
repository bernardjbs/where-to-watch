function slideclick(event) {
    var rowe = $(event.target);
    var data_mode = rowe.attr("data-mode");
    var obbj = rowe.next(".panel");
    var icon = rowe.find("icon");
  
    if (data_mode == "down") {
     
      icon.removeClass("fa fa-angle-down").addClass("fa fa-angle-up");
      rowe.attr("data-mode", "up");
      obbj.slideDown();
  
    } else {
     
      icon.removeClass("fa fa-angle-up").addClass("fa fa-angle-down");
      rowe.attr("data-mode", "down");
      obbj.slideUp("slow");
    }
  }
  $(".row").on("click", slideclick);