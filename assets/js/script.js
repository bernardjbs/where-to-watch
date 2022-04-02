// Global Selectors
var ratingfrom = $("#ratingfrom");
var ratingto = $("#ratingto");
var daterange = $("#date-range");
var titlesearch = $("#title-search");
var chkG = $("#chkG");
var chkPG_13 = $("#chkPG_13");
var chkR = $("#chkR");
var chkNC_17 = $("#chkNC_17");
const APIKEY = "k_fbuwj772";
var formEl = $("#form-input");
var loader = $("#loading");


// Display load icon
function displayLoading() {
  
  loader.removeClass("hideloading");
  loader.addClass("display");
  setTimeout(() => {
    loader.removeClass("display");
    loader.addClass("hideloading");
  }, 10000);
}
// Hide load icon
function HideLoading() {
  loader.removeClass("display");
  loader.addClass("hideloading");
}

// Handle Form Submission
var formSubmitHandler = function (event) {
  event.preventDefault();

  displayLoading();

  var resultDiv = $(".table_result");
  resultDiv.text("");
  var parameter = [];
  
  // Check for input on title
  if (!isEmpty(titlesearch.val())) {
    parameter.push("title=" + titlesearch.val());
  }
  // Check for input on date range
  if (!isEmpty(daterange.val())) {
    parameter.push("release_date=" + daterange.val());
  }

  // Add user rating
  parameter.push("user_rating=" + ratingfrom.val() + "," + ratingto.val());
  var certificates = [];

  // Add any certification
  if (chkG.is(":checked")) {
    certificates.push(chkG.val());

  } if (chkPG_13.is(":checked")) {
    certificates.push(chkG.val());

  } if (chkR.is(":checked")) {
    certificates.push(chkR.val());

  } if (chkNC_17.is(":checked")) {
    certificates.push(chkNC_17.val());

  } if (certificates.length > 0) {
    parameter.push("certificates=" + certificates.toString());

  } if (parameter.length > 0) {
    // Create url based on selection criteria
    var url = `https://imdb-api.com/API/AdvancedSearch/${APIKEY}?${parameter.join( "&" )}`;
    getMovieFromURL(url);

  } else {
    HideLoading();
  }
}

//Load table helper method
function LoadTable(data) {
  var table = $("<table>");
  var row = $("<tr>");
  var col1 = $("<td>").attr("rowspan", "3");
  var col2 = $("<td>").text(`Genres : ${data.genres} `);
  var img = $("<img>").addClass("row_image").attr("src", data.image);
  col1.append(img);
  row.append(col1);
  row.append(col2);
  table.append(row);
  var row1 = $("<tr>");

  var col3 = $("<td>").text(`Certificate : ${data.contentRating} `);

  row1.append(col3);
  table.append(row1);
  var row2 = $("<tr>").append($("<td>")).append($("<td>"));
  var col4 = $("<td>").attr("rowspan", "3");
  var alink = $("<a>")
    .addClass("lnkclass")
    .attr("href", `./review.html?id=${data.id}`)
    .text("More");
  col4.append(alink);
  row2.append(col4);
  table.append(row2);
  return table;
}

//Add search result to the div
function LoadGridMovieDetails(data) {
  let filmData = data;
  let newData = [];
  // Check if Feature Length Film
  for (let e = 0; e < filmData.length; e++) {
    if (filmData[e].runtimeStr && filmData[e].runtimeStr.replace(" min", "") > 80) {
      newData.push(filmData[e]);
    }
  }
  if (newData.length > 0) {
    var resultDiv = $(".table_result");
    var maxlength = newData.length > 30 ? 30 : newData.length;

    for (var i = 0; i < maxlength; i++) {
    
      var rowdiv = $("<div>")
        .addClass("row")
        .attr("data-mode", "down")
        .text(newData[i].title);

      var icon = $("<icon>").addClass("fa fa-angle-down");
      var toggdiv = $("<div>").addClass("panel");

      toggdiv.append(LoadTable(newData[i]));

      rowdiv.append(icon);
      rowdiv.append(toggdiv);
      rowdiv.on("click", rowclick);
      resultDiv.append(rowdiv);
    }
  }
  return;
}

//Matching titles: Display/hide info on click
function rowclick(event) {

  var rowe = $(event.target);
  var data_mode = rowe.attr("data-mode");
  var obbj = rowe.find(".panel");
  var icon = rowe.find("icon");

  if (data_mode == "down") {
    rowe.css("background-color", "hsl(6.39, 73.16%, 54.71%)");
    icon.removeClass("fa fa-angle-down").addClass("fa fa-angle-up");
    rowe.attr("data-mode", "up");
    obbj.slideDown();

  } else {
    rowe.css("background-color", "rgb(245, 140, 128)");
    icon.removeClass("fa fa-angle-up").addClass("fa fa-angle-down");
    rowe.attr("data-mode", "down");
    obbj.slideUp("slow");
  }
}

//Api call to get movies
function getMovieFromURL(apiUrl) {

  fetch(apiUrl).then(function (response) {

    if (response.ok) {
        response.json()
        .then(function (data) {
        LoadGridMovieDetails(data.results);
        HideLoading();
      });

    } else {
      HideLoading();
      document.location.replace("./index.html");
    }
  });
}
// Return falsy value if value is falsy
function isEmpty(value) {
  return value == undefined || value == null || value.length === 0;
}

// Date selection function
$(function () {
  $("#slider-range").slider({
    range: true,
    min: 1895,
    max: 2022,
    values: [2012, 2022],
    slide: function (event, ui) {
      // Date Range Input
      $("#date-range").val(ui.values[0] + "," + ui.values[1]);
    },
   
  });

  // Date Range Static
  $("#date-range").val(
    $("#slider-range").slider("values", 0) +
      "," +
      $("#slider-range").slider("values", 1)
  );
});

// Selection for user rating
function LoadSelectInput() {
  for (var i = 1; i <= 10; i = i + 0.1) {
    $("<option>")
      .val(i.toFixed(2))
      .text(i.toFixed(2))
      .appendTo(".select-group");
  }

  ratingto.val("10.00");
}
LoadSelectInput();

// Event Handlers
formEl.on("submit", formSubmitHandler);

