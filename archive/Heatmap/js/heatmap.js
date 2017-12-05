
var itemSize = 30,
    cellSize = itemSize - 1,
    margin = {top: 200, right: 20, bottom: 20, left: 200};
      
var width = 800 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

var countryID = 'CN'

d3.csv("data/comparison.csv", function (rawdata) {

    var selectedData = d3.nest()
        .key(function(d) { return d.id == countryID; })
        .entries(rawdata);

    var dataCases = selectedData[1].values;

    var data = dataCases.map(function(item) {
    var newItem = {};
    newItem.country = item.x;
    newItem.attribute = item.y;
    newItem.value = item.value;
    return newItem;
    })
    
    var x_elements = d3.set(data.map(function( item ) { return item.attribute; } )).values(),
        y_elements = d3.set(data.map(function( item ) { return item.country; } )).values();

    var xScale = d3.scale.ordinal()
        .domain(x_elements)
        .rangeBands([0, x_elements.length * itemSize]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("top");

    var yScale = d3.scale.ordinal()
        .domain(y_elements)
        .rangeBands([0, y_elements.length * itemSize]);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .tickFormat(function (d) {
            return d;
        })
        .orient("left");

    var colorScale = d3.scale.threshold()
        .domain([0, 72])
        .range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

    var svg = d3.select('.heatmap')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cells = svg.selectAll('rect')
        .data(data)
        .enter().append('g').append('rect')
        .attr('class', 'cell')
        .attr('width', cellSize)
        .attr('height', cellSize)
        .attr('y', function(d) { return yScale(d.country); })
        .attr('x', function(d) { return xScale(d.attribute); })
        .attr('fill', function(d) { return colorScale(d.value); });

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .selectAll('text')
        .attr('font-weight', 'normal');

    svg.append("g")
        .attr("class", "x axis")
        .call(xAxis)
        .selectAll('text')
        .attr('font-weight', 'normal')
        .style("text-anchor", "start")
        .attr("dx", ".8em")
        .attr("dy", ".5em")
        .attr("transform", function (d) {
            return "rotate(-65)";
        });

});

//This should be the interaction parts
function selectCountry(){
  var node = d3.select('#id').node();
  var i = node.selectedIndex;
  countryID = node[i].value;
}