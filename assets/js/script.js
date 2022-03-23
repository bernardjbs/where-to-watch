// Used for index.html
$( function() {

    $( "#slider-range" ).slider({
      range: true,
      min: 1895,
      max: 2022,
      values: [ 2012, 2022 ],
      slide: function( event, ui ) {
        // Date Range Input
        $( "#date-range" ).val( ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });

    // Date Range Static
    $( "#date-range" ).val( $( "#slider-range" ).slider( "values", 0 ) +
      " - " + $( "#slider-range" ).slider( "values", 1 ) );
});
