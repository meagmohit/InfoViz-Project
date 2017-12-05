$(function() {
  $( "#slider-range" ).slider({
    range: true,
    min: 1990,
    max: 2016,
    values: [ init_year, init_year2 ],
    slide: function( event, ui ) {
      //var begin = d3.min([ui.values[0], data.length]);
      //var end = d3.max([ui.values[1], 0]);
      //console.log("begin:", ui.values[0], "end:", ui.values[1]);

      //zoom(begin, end);
      dostuff(ui.values[0], ui.values[1]);
    }
  })
  .each(function() {

  /*
  var el = $('<label>' + (1990) + '</label>').css('left', 0 + '%');
  $("#slider-range").append(el);
  var el = $('<label>' + (2016) + '</label>').css('left', 100 + '%');
  $("#slider-range").append(el);
  */

    // Position the labels
    
    /*for (var i = 0; i <= 26; i++) {

        // Create a new element and position it with percentages
        //var el = $('<label2>' + '|' + '</label2>').css('left', (i/26*100) + '%');
        //var el = $('<hr width="2" size="100">').css('left', (i/26*100) + '%');
        var el = $("<div class='tick' style=margin-left:" + (i/26*100) + '%' +"></div>");
        // Add the element inside #slider
        $("#slider-range").append(el);

    };*/

  });
});

function dostuff(begin, end){
  init_year = begin;
  init_year2 = end;
  //console.log(init_year2);
  let upd_color = calcColorScale(computeranges(data_deaths));
  updateMap(upd_color, computeranges(data_deaths));
  renderLegend(upd_color, computeranges(data_deaths));
  //renderBars(upd_color, computeranges(data_full['DHSFS']));
  renderCircles(calcColorScaleBubbles(data_GDP), computeranges(data_GDP));
  console.log("sd:",selected_dataset)
  if (selected_dataset=="LWHT"){
    renderDP(computeranges(data_full['LWHM']), computeranges(data_full['LWHW']), computeranges(data_full['LWHC']));
  };
  if (selected_dataset=="Deaths"){
    renderDP(computeranges(data_full['DeathsMale']), computeranges(data_full['DeathsFemale']), computeranges(data_full['DeathsChildren']));
  };
}

//$(document).ready(function() {
//$("div.ui-slider").append("<div class='tick' id='percent25'></div><div class='tick' id='percent50'></div><div class='tick' id='percent75'></div><div class='number' id='number0'>0</div><div class='number' id='number25'>25</div><div class='number' id='number50'>50</div><div class='number' id='number75'>75</div><div class='number' id='number100'>100</div>");
//});