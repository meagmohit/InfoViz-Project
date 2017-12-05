function fillMap(selection, color, data) {

    // TODO: minor fix, sometimes d gets a -99, why?
    selection
        .attr("fill", function(d) {
            return typeof data[d.id] === 'undefined' ? color_na :
                d3.rgb(color(data[d.id]));
        });
}

function setPathTitle(selection, data) {
    selection
        .text(function(d) {
            return "" + d.id + ", " +
                (typeof data[d.id] === 'undefined' ? 'N/A' : data[d.id]);
        });
}

function updateMap(color, data) {

    // fill paths
    d3.selectAll("svg#map path").transition().duration(100)
        .delay(100)
        .call(fillMap, color, data);

    // update path titles
    d3.selectAll("svg#map path title")
        .call(setPathTitle, data);

    // update headline
    d3.select("h5").text(headline + init_year + '-' + init_year2);//d3.select("#year").node().value);
}

function renderLegend(color, data) {

    let svg_height = +d3.select("svg#map").attr("height");
    let legend_items = pairQuantiles(color.domain());

    let legend = d3.select("svg#map g.legend").selectAll("rect")
        .data(color.range());

    legend.exit().remove();


    legend.enter()
        .append("rect")
        .merge(legend)
        .attr("width", "20")
        .attr("height", "20")
        .attr("transform", "translate(" + (-1*marginMap.left) + ", " + marginMap.top + ")")
        .attr("y", function(d, i) {
            return (svg_height - 29) - 25 * i;
        })
        .attr("x", 30)
        .attr("fill", function(d, i) {
            return d3.rgb(d);
        })
        .on("mouseover", function(d) {
            legendMouseOver(d, color, data);
        })
        .on("mouseout", function() {
            legendMouseOut(color, data);
        });

    let text = d3.select("svg#map g.legend").selectAll("text");

    text.data(legend_items)
        .enter().append("text").merge(text)
        .attr("y", function(d, i) {
            return (svg_height - 14) - 25 * i;
        })
        .attr("x", 60)
        .attr("transform", "translate(" + (-1*marginMap.left) + ", " + marginMap.top + ")")
        .text(function(d, i) {
            return d;
        });

    d3.select("svg#map g.legend_title text")
        .text("Legend (quintile ranges)")
        .attr("x", 30)
        .attr("transform", "translate(" + (-1*marginMap.left) + ", " + marginMap.top + ")")
        .attr("y", 355);
}

function renderCircles(colorBub, data) {
  
//  console.log("Test")
//  console.log(data)
    var arr = Object.keys(data).map(function(key) {
        return data[key];
    });
    var min = Math.min.apply(null, arr);
    var max = Math.max.apply(null, arr);
  
    array = [];

    for (let key of Object.keys(data)) {
        array.push({
            'id': key,
            'value': data[key]
        })
    }

    // sort by country on value : edit this code for takin
  
  array = array.sort(function(a, b) {
    return a.value - b.value;
    });
//  console.log(array[45].value)
//  console.log(colorBub(array[45].value))
  var l = array.length;
  
  let rscale = d3.scalePow().exponent(6).domain([0, l]).range([20, 20000]);
//  let rscale = d3.scaleLinear().domain([0, l]).range([0, l]);
  var sumRscale = rscaleSum(rscale,l);
  
  //console.log(sumRscale)
  //console.log(svgBubbleWidth)
//    let xscale = d3.scaleLinear().domain([0, 2*sumRscale]).range([5, 900]);
//  let rrscale = d3.scaleLinear().domain([0, array.length*(array.length+1)/2]).range([5, 50]);
  
//  console.log(rscale)
    let bubbles = d3.select("svg#bubbles").selectAll("circle").data(array);
    bubbles.exit().remove();

    bubbles.enter().append("circle")
        .merge(bubbles)
        .attr("cx", function(d) {
      var index = array.findIndex(function(pair) {
        return pair.value == d.value
      });
      return (rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale;
        })
        .attr("cy", function(d) {
      var index = array.findIndex(function(pair) {
        return pair.value == d.value
      });
            return (125-yscaleEllipse((rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale));
        })
        .attr("r", function(d) {
      var index = array.findIndex(function(pair) {
        return pair.value == d.value
      });
            return rscale(index)*svgBubbleWidth/sumRscale;
        })
        .style("fill", function(d) {
            return colorBub(d.value);
        });
}


function renderBars(color, data) {

    // turn data into array of objects
    array = [];
    for (let key of Object.keys(data)) {
          array.push({
              'id': key,
              'value': data[key],
              'sortvalue': data_full['KAHPYP']['2014'][key]
          })
    }
    console.log(array);

    // sort by country id
    array = array.sort(function(a, b) {
      return a.sortvalue - b.sortvalue;
    });

    xBars.domain(array.map(function(d, i) {
        return d.id;
    }));
    yBars.domain([0, d3.max(Object.values(data), function(d) {
        return d;
    })]);


    d3.select("svg#bars g.axis").remove();
    let axis = d3.select("svg#bars").append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 30 + "," + (svgBarsHeight + margin.top) + ")")
        .call(d3.axisBottom(xBars))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-size","0pt")
        .attr("transform", "rotate(-65)");

    d3.select("svg#bars g.axis--y").remove();
    let axis2 = d3.select("svg#bars").append("g")
        .attr("class", "axis--y")
        .attr("transform", "translate(" + margin.left + "," + (0 + margin.top) + ")")
        .call(d3.axisLeft(yBars))

    let bars = d3.select("svg#bars g.bars").selectAll("rect").data(array);
    bars.exit().remove();
    bars.enter().append("rect")
        .merge(bars)
        .attr("fill", function(d) {
            return color(d.value);
        })
        .attr("x", function(d) {
            return xBars(d.id) - 20;
        })
        .attr("width", xBars.bandwidth())
        .attr("y", function(d) {
            return yBars(d.value);
        })
        .attr("height", function(d) {
            return svgBarsHeight - yBars(d.value);
        });
    /*
    let annot = d3.select("svg#bars g.bars").selectAll("text").data(array);
    annot.exit().remove();
    annot.enter().append("text")
        .merge(annot)
        .text(function(d) {
            return d3.format(",")(d.value);
        })
        .attr("class", "barlabel")
        .attr("x", function(d) {
            return x(d.id) + x.bandwidth() / 2;
        })
        .attr("y", function(d) {
            return y(d.value) - 5;
        });
        */

}

function calcColorScale(data) {

    // TODO: minor, check how many data poins we've got
    // with few datapoints the resulting legend gets confusing

    // get values and sort
    let data_values = Object.values(data).sort(function(a, b) {
        return a - b;
    });

    quantiles_calc = quantiles.map(function(elem) {
        return Math.ceil(d3.quantile(data_values, elem));
    });

    let scale = d3.scaleQuantile()
        .domain(quantiles_calc)
        .range(d3.schemeReds[(quantiles_calc.length) - 1]);

    return scale;
}

/// event handlers /////

function legendMouseOver(color_key, color, data) {

    // cancels ongoing transitions (e.g., for quick mouseovers)
    d3.selectAll("svg#map path").interrupt();

    // TODO: improve, only colored paths need to be filled

    // then we also need to refill the map
    d3.selectAll("svg#map path")
        .call(fillMap, color, data);

    // and fade all other regions
    d3.selectAll("svg#map path:not([fill = '" + d3.rgb(color_key) + "'])")
        .attr("fill", color_na);
}

function legendMouseOut(color, data) {

    // TODO: minor, only 'colored' paths need to be refilled
    // refill entire map
    d3.selectAll("svg#map path").transition()
        .delay(100)
        .call(fillMap, color, data);
}

/// helper functions /////

// sorts an array of equally structured objects by a key
// only works if sortkey contains unique values
// TODO: minor, shorten
function sortArrObj(arr, sortkey) {

    sorted_keys = arr.map(function(elem) {
        return elem[sortkey];
    }).sort();

    newarr = [];
    for (let key of sorted_keys) {
        for (i in arr) {
            if (arr[i][sortkey] === key) {
                newarr.push(arr[i]);
                continue;
            }
        }
    }

    return newarr;
}

// pairs neighboring elements in array of quantile bins
function pairQuantiles(arr) {

    new_arr = [];
    for (let i = 0; i < arr.length - 1; i++) {

        // allow for closed intervals (depends on d3.scaleQuantile)
        // assumes that neighboring elements are equal
        if (i == arr.length - 2) {
            new_arr.push([arr[i], arr[i + 1]]);
        } else {
            new_arr.push([arr[i], arr[i + 1] - 1]);
        }
    }

    new_arr = new_arr.map(function(elem) {
        return elem[0] === elem[1] ?
            d3.format(",")(elem[0]) :
            d3.format(",")(elem[0]) + " - " + d3.format(",")(elem[1]);
    });

    return new_arr;
}

function renderArea(data) {



    let myKeys = d3.keys(data);
    let abc = d3.values(data);
    //console.log(temp);

    //var bottom = temp.map(function(d) { return d[defaults[0]]; });
    //console.log("Hello");
    //console.log(temp);
    temp = JSON.parse(JSON.stringify(abc));
    //var tempArray = JSON.parse(JSON.stringify(mainArray));
    for(let myX in myKeys){
        temp[myX]['date'] = parseTime(myKeys[myX]);
    };
    mydata = temp;

  var maxDateVal = d3.max(mydata, function(d){
  var vals = defaults.map(function(key){ return key !== 'date' ? d[key] : 0 });
    //console.log(vals);
    return d3.sum(vals);
  });
  //console.log(maxDateVal);
  // scale the range of the data
  xArea.domain(d3.extent(mydata, function(d) { return d.date; }));
  yArea.domain([0, maxDateVal]);

  stackArea.keys(defaults);

  stackArea.order(d3.stackOrderNone);
  stackArea.offset(d3.stackOffsetNone);

  //console.log(stackArea(mydata));

  //d3.select("svg#area g.area").selectAll('g.axis').remove();
  svg_area.selectAll('g').remove();//.data(stackArea(mydata)).remove();
  var browser = svg_area.selectAll('.browser')
      .data(stackArea(mydata))
    .enter().append('g')
      .attr('class', function(d){ 
        //console.log(d.key);
        return 'browser ' + d.key; })
      .attr('fill-opacity', 0.5);

  //svg_area.selectAll('path').remove();
  browser.append('path')
      .attr('class', 'area')
      .attr('d', area)
      .style('fill', function(d) { return colorArea(d.key); });

    // add the area
    /*
 browser.append('text')
      .datum(function(d) { return d; })
      .attr('transform', function(d) { return 'translate(' + xArea(mydata[13].date) + ',' + yArea(d[13][1]) + ')'; })
      .attr('x', -6) 
      .attr('dy', '.35em')
      .style("text-anchor", "start")
      .text(function(d) { return d.key; })
      .attr('fill-opacity', 1);*/

  //svg_area.selectAll('g#yaxis').remove(); 

  svg_area.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + heightArea + ')')
      .call(xAreaAxis);

  svg_area.append('g')
      //.attr('id', 'yaxis');
      .attr('class', 'y axis')
      .attr("transform", "translate(" + widthArea + ",0)")
      .call(yAreaAxis);

  //svg_area.append("text")
  //  .attr("x", 0-margin.left)
  //  .text("Deaths")

  //Legend Code
  var legendRectSize = 10;
  var legendSpacing = 8;

  var legend = svg_area.selectAll('.legend')
  .data(colorArea.domain())
  .enter()
  .append('g')
  .attr('class', 'legendArea')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  -50 + height * colorArea.domain().length / 2;
    var horz = -2 * legendRectSize + 40;
    var vert = i * height - offset;
    return 'translate(' + horz + ',' + vert + ')';
  });

  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', colorArea)
  .style('stroke', colorArea);

  legend.append('text')
  .attr('x', legendRectSize + legendSpacing )
  .attr('y', legendRectSize - legendSpacing + 8)
  .text(function(d) { return d; });
  

}

function renderBoxPlot(dataTemp) {
        //creates a lookup table storing the index within the raw dataTemp array that corresponds to each country ID
    var lookupByID = {};
    for (var i = 0; i < dataTemp.length; i++) {
        lookupByID[dataTemp[i].id] = i;
    }
    
    //creates a dataTempset containing the information for countries whose IDs are currently selected
    dataTempset = [];
    for (var i = 0; i < defaults.length; i++) {
        dataTempset.push(dataTemp[lookupByID[defaults[i]]]);
    }
    var rows = dataTempset.length;

    var rowHeight = heightBP/rows;
    
    //create a scale for each column
    var colKeys = [];
    var sizeScales = [];
    var colorScales = [];
    for (var key in dataTempset[0])
    {
        if (key !== "id") {
            colKeys.push(key);
            var maxValue = d3.max(dataTempset, function(d){ return d[key]; });
            var sizeScale = d3.scaleSqrt()
                .domain([0,maxValue])
                .range([0,(rowHeight - rowPadding)/2]);
            sizeScales.push(sizeScale);
            var colorScale = d3.scaleLinear()
                .domain([0,maxValue])
                .range(['honeydew','darkgreen']);
            colorScales.push(colorScale);
        }
    }
    //console.log(colKeys);

    var columnWidth = widthBP/colKeys.length;
    
    svg.selectAll('g').remove();
    var chart = svg.append("g")
      .attr("transform", "translate(" + marginBP.left + "," + marginBP.top + ")");
    

    var columnHeader = chart.append("g")
      .attr("transform", "translate(0,0)");
    
    var columnLabels = columnHeader.selectAll("g")
      .data(colKeys)
      .enter()
      .append("g")
      .attr("transform", function(d, i) {return "translate(" + (columnWidth * i) +",0)"; });
    
    columnLabels.append("text")
    .text(function(d) { return d })
    .attr("y", -10)
    .attr("x", columnWidth/2)
    .style("text-anchor","middle");
    //.attr("transform", "translate(20)rotate(-45)")
    

    dataTempset.forEach(function(d) {
    
      //console.log(d,d.values);
      
      var rowNumber = defaults.indexOf(d.id);

      var rowG = chart.append("g")
      .attr("transform", "translate(0," + (rowNumber * rowHeight) + ")");
      
      rowG.append("text")
      .text(d.id)
      .attr("x", -rowPadding)
      .attr("y", rowHeight/2 + 6)
      .style("text-anchor", "end");

      var boxes =  rowG.selectAll("g")
      .data(d3.values(d).slice(0,-1))
      .enter()
      .append("g")
      .attr("class", "box")
      .attr("transform", function(d, i) {return "translate(" + (columnWidth * i) +",0)"; });
      
      boxes.append("rect")
      .attr("x", function(d,i) { return (columnWidth - sizeScales[i](d))/2; })
      .attr("y", function(d,i) { return (rowHeight - sizeScales[i](d))/2; })
      .attr("width", function(d,i) { return sizeScales[i](d); })
      .attr("height", function(d,i) { return sizeScales[i](d); })
      .style("fill", function(d,i){ return colorScales[i](d); });
      
      boxes.append("text")
      .text(function(d,i){ return d; })
      .attr("x", columnWidth/2)
      .attr("y", rowHeight/2 + 6)
      .style("text-anchor", "middle");
      //.attr("font-size",2pt);
      
    });
 
}

function computeranges(data){
  let trData = [];
  ckeys = d3.keys(d3.values(data)[0]);
  ykeys = d3.keys(data).filter(function(key){
    return key >= init_year && key <= init_year2;
  });

  for (ck in ckeys){
    let tempsum = 0;
    let count = 0;
    for (yk in ykeys){
      tempsum = tempsum+data[ykeys[yk]][ckeys[ck]];
      count = count+1;
    }
   // trData.push({
    //  'id': ckeys[ck],
    //  'value': tempsum/count
      trData[ckeys[ck]] = tempsum/count;
    //});
  }
  //console.log("Hello");
  //console.log(d3.keys(data_deaths[1990]));
  //console.log(trData);
  return trData;

}

function rscaleSum(rscale,l){
  var sum=0;
  for (var i=0;i<=l;i++){
    sum = sum + rscale(i);
    }
  return sum;
}

function yscaleEllipse(xVal){
  yVal = Math.sqrt((1 - Math.pow((xVal - svgBubbleWidth/2),2)/Math.pow(svgBubbleWidth/2,2))*Math.pow(svgBubbleHeight,2))
  return yVal
}


function calcColorScaleBubbles(data_GDP){
//  console.log(Object.keys(data_GDP))
  let overMin = 100000000;
  let overMax = 0;
  let tot = 0;
  for(var year in data_GDP){
    dt = data_GDP[year];
//    console.log(year)
    var min = d3.min(Object.values(data_GDP[year]));
    var max = d3.max(Object.values(data_GDP[year]));
//    console.log(overMin)
//    console.log(min)
    if (min < overMin){overMin = min;}
    if (max > overMax){overMax = max;}
    tot = tot + Object.values(data_GDP[year]).length
  }
  // console.log(overMin)
  // console.log(overMax)

  let color = d3.scaleLinear().domain([overMin,overMax])
       .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);
  let  colorScale = d3.scaleSequential(d3.interpolateInferno).domain([9365166,78870119013703]);  
  let colorS = d3.scaleLog().base(100000).domain([overMin,overMax])
    .interpolate(d3.interpolateHslLong)
       .range([d3.rgb("#ff0000"), d3.rgb("#00ffe5")]);
//  console.log(colorScale(1911600970))
    
  return colorS;
//  let scale = d3.scalePow().exponent(6)
//          .domain([overMin,overMax])
//          .range(d3.schemeBuPu[tot]);
}


function renderPaths(data){
	console.log(data_deaths)

	
	console.log(rect1.top);
	console.log(rect2.top);
	
	var arr = Object.keys(data).map(function(key) {
        return data[key];
    });
	console.log(Object.keys(arr[0]));
    array = [];

    for (let key of Object.keys(arr[0])) {
        array.push({
            'id': key,
            'x1': getMapX(key),
			'y1': getMapY(key),
			'x2': getBubbleX(key),
			'y2': getBubbleY(key),
			'x3': getBarX(key),
			'y3': getBarY(key)
        })
    }

	
	// let paths = d3.select("svg#paths").append("line")
					// .attr("x1", rect1.x)
					// .attr("y1", rect1.y)
					// .attr("x2", rect2.left +  window.scrollX)
					// .attr("y2", rect2.top + window.scrollY)
					// .attr("stroke-width", 2)
					// .attr("stroke", "black")
	
	// let paths = d3.select("svg#paths").selectAll("line").data(array);
    // paths.exit().remove();

    // paths.enter().append("line")
        // .merge(paths)
        // .attr("x1", function(d) {
      // var index = array.findIndex(function(pair) {
        // return pair.value == d.value
      // });
      // return (rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale;
        // })
        // .attr("y1", function(d) {
      // var index = array.findIndex(function(pair) {
        // return pair.value == d.value
      // });
            // return (125-yscaleEllipse((rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale));
        // })
        // .attr("x2", function(d) {
      // var index = array.findIndex(function(pair) {
        // return pair.value == d.value
      // });
      // return (rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale;
        // })
        // .attr("y2", function(d) {
      // var index = array.findIndex(function(pair) {
        // return pair.value == d.value
      // });
            // return (125-yscaleEllipse((rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale));
        // })
        // .attr("stroke-width", 2)
        // .attr("stroke", "black");	
}


function getMapX(key){
	a = document.getElementById("left-pane");
	b = a.getElementsByClassName("border-round");
//	map = $('.border-round','#map');
//	bu = $('.border-round','#bubble');
//	c = b["bubble"];
	d = b["map"];
	e = d.children["map"];
	f = e.children[2];
	p1 = f.children.key;
//	p2 = f.children.MEX;
	rect1 = p1.getBoundingClientRect();
//	rect2 = p2.getBoundingClientRect();
}
