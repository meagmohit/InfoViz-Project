function fillMap(selection, color, data) {

    // TODO: minor fix, sometimes d gets a -99, why?
    //console.log("selection",selection);
    selection
 
        .attr("fill", function(d) {
            return typeof data[d.id] === 'undefined' ? color_na :
                d3.rgb(color(data[d.id]));
        });
}

function setPathTitle(selection, data) {
    selection
        .attr("title",function(d) {
            return "" + d.id + ", " +
                (typeof data[d.id] === 'undefined' ? 'N/A' : data[d.id]);
        })
    /*   .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html(d.id + "<br/>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
       .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
        })   */
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
    d3.selectAll("h5").text(headline + init_year + '-' + init_year2);//d3.select("#year").node().value);
    console.log()
    //d3.selectAll("#yeartext").text(headline + init_year + '-' + init_year2);
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
            return  legendmargin + 10 + 25 * i;
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
            return legendmargin +25+ 25 * i;
        })
        .attr("x", 60)
        .attr("transform", "translate(" + (-1*marginMap.left) + ", " + marginMap.top + ")")
        .text(function(d, i) {
            return d;
        });

    d3.select("svg#map g.legend_title text")
        .text("Color Legend")
        .attr("x", 30)
        .attr("transform", "translate(" + (-1*marginMap.left) + ", " + marginMap.top + ")")
        .attr("y", legendmargin);
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
        return pair.id == d.id
      });
      return (rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale;
        })
        .attr("cy", function(d) {
      var index = array.findIndex(function(pair) {
        return pair.id == d.id
      });
            return (125-yscaleEllipse((rscaleSum(rscale,index-1))*svgBubbleWidth/sumRscale));
        })
        .attr("r", function(d) {
      var index = array.findIndex(function(pair) {
        return pair.id == d.id
      });
            return rscale(index)*svgBubbleWidth/sumRscale;
        })
        .attr("id", function(d) {
            return 'oc-bubble-'+d.id.toString();
        })
        .on("mouseover", function(d) {            // code for hover tooltip
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html(data_full['countryMapping']['1990'][d.id] + "<br/>" + "%GDP spent on health: "+Math.round(d.value * 1000) / 1000)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
        })  
        .on("click", function(arg1, i){
                        //d3.select(".selected").classed("selected", false);
                        onClickfunc(this,arg1,i);
                        //renderBoxPlot(dataTemp);
                    })
        .style("fill", function(d) {
            return colorBub(d.value);
        });
}


/*function renderBars(color, data) {

    // turn data into array of objects
    array = [];
 //   for (let key of Object.keys(data)) {
      for (let mkk in defaults) {
          let key = defaults[mkk];
          if (data[key] == null){
            console.log("yes baby -- undefined..");
            continue;
          }
          console.log("datakey",data[key])
          console.log(data[key]== null ? 0 : data[key])
          array.push({
              'id': key,
              'value': data[key]== null ? 0 : data[key] //,
              //'sortvalue': data_full['KAHPYP']['2014'][key]
          })
    }
    //console.log(array);

    // sort by country id
   // array = array.sort(function(a, b) {
   //   return a.sortvalue - b.sortvalue;
   // });

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
/*
}*/

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
        //.range(d3.schemeOranges[(quantiles_calc.length) - 1]);
        .range(colorcurr);
        //.range(["#FFF658", "#FFDD2C" , "#FFC500", "#E78200", "#D08300"]);  //Colour Scheme for HIV
        //.range(["#FF7E58", "#FF5D2C", "#FF3D00", "#CC1C00", "#9F0000"]); // Colour scheme for AIDS


    console.log(scale);
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


    let colorArea = d3.scaleOrdinal().domain(defaults).range(colorcurr.slice(0,defaults.length));
    //console.log("dom:",defaults);
    //function colorArea(country_index){
    //  return colorcurr[country_index];
    //}

//    } 
    //console.log(colorArea(0));
    //.range(d3.schemeOranges[(quantiles_calc.length) - 1]);
    //let colorArea = d3.scaleQuantile().domain(defaults).range(["#FFF658", "#FFDD2C" , "#FFC500", "#E78200", "#D08300"]);
    //let colorArea = d3.scaleQuantile().domain(defaults).range(d3.schemeOranges[(5)]);
    let myKeys = d3.keys(data);
    let abc = d3.values(data);
    //console.log(temp);

    //var bottom = temp.map(function(d) { return d[defaults[0]]; });
    //console.log("Hello");
    //console.log(temp);
    temp = JSON.parse(JSON.stringify(abc));
    //var tempArray = JSON.parse(JSON.stringify(mainArray));
    for(let myX in myKeys){
        //console.log("checkhere:",temp[myX]["IND"]);
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

  //console.log("mydata:",stackArea(mydata));

  //d3.select("svg#area g.area").selectAll('g.axis').remove();
  svg_area.selectAll('g').remove();//.data(stackArea(mydata)).remove();



  //d3.selectAll("#areatext").remove();
  d3.selectAll("#areatext").text(fixtext+" over the years");
  var browser = svg_area.selectAll('.browser')
      .data(stackArea(mydata))
    .enter().append('g')
      .attr('class', function(d){ 
        //console.log(d.key);
        return 'browser ' + d.key; })
      .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          console.log("cr: ",computeranges(data_full[selected_dataset]))
          div.html(data_full['countryMapping']['1990'][d.key] + "<br/>" + fixtext+" for selected years: "+ Math.round(computeranges(data_full[selected_dataset])[d.key]*100)/100)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
      .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
       })          
     /*   selection
        .text(function(d) {
            return "" + d.id + ", " +
                (typeof data[d.id] === 'undefined' ? 'N/A' : data[d.id]);
        });*/
      .attr('fill-opacity', 0.5);
  
 /* browser.append("title")
        //.call(setPathTitle, computeranges(data_deaths));
        .attr("text", function(d){
          return d.key;
        })  ;
        */

  //svg_area.selectAll('path').remove();
  browser.append('path')
      .attr('class', 'area')
      .attr('d', area)
      .style('stroke',"white")
      .style('stroke-width',"1")
      .style('fill', function(d) { //console.log("thisval:",d.index) ;
        return colorArea(d.key); });


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

      //Milestones
  svg_area.append('rect')
      .attr('class', 'milestones')
      .attr('width', 10)
      .attr('height', heightDP*3/4)
      .attr('x', 50)
      .attr('y',heightDP/4)
      .attr('fill','#6CBA32')
      .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html("Milestone <br> 1992: FDA licenses a rapid HIV diagnostic test kit which gives results from a blood test in 10 minutes")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
      .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
       })         
  svg_area.append('rect')
      .attr('class', 'milestones')
      .attr('width', 10)
      .attr('height', heightDP*3/4)
      .attr('x', 105)
      .attr('y',heightDP/4)
      .attr('fill','#6CBA32')
      .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html("Milestone <br> 1994: The U.S. Public Health Service recommends that pregnant women be given the antiretroviral drug AZT to reduce the risk of perinatal transmission of HIV.")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
      .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
       })         
  svg_area.append('rect')
      .attr('class', 'milestones')
      .attr('width', 10)
      .attr('height', heightDP*3/4)
      .attr('x', 185)
      .attr('y',heightDP/4)
      .attr('fill','#6CBA32')
      .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html("Milestone <br> 1997: Highly active antiretroviral therapy (HAART ) becomes the new standard of HIV care.")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
      .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
       }) 
  svg_area.append('rect')
      .attr('class', 'milestones')
      .attr('width', 10)
      .attr('height', heightDP*3/4)
      .attr('x', 270)
      .attr('y',heightDP/4)
      .attr('fill','#6CBA32')
      .on("mouseover", function(d) {            // code for hover tooltip
          console.log("Mouseover activated");
          div.transition()
          .duration(200)
          .style("opacity", .9);
          div.html("Milestone <br> 2000: UNAIDS, WHO, and other global health groups announce a joint initiative with five major pharmaceutical manufacturers to negotiate reduced prices for HIV/AIDS drugs in developing countries.")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
       })
      .on("mouseout", function(d) {
          div.transition()
          .duration(500)
          .style("opacity", 0);
       }) 


  //svg_area.append("text")
  //  .attr("x", 0-margin.left)
  //  .text("Deaths")

  //Legend Code
  var legendRectSize = 10;
  var legendSpacing = 8;

  var legend = svg_area.selectAll('.legend')
  .data(defaults)
  .enter()
  .append('g')
  .attr('class', 'legendArea')
  .attr('transform', function(d, i) {
    var height = legendRectSize + legendSpacing;
    var offset =  -50 + height * defaults.length / 2;
    var horz = -2 * legendRectSize + 40;
    var vert = i * height - offset;
    return 'translate(' + (horz-30) + ',' + vert + ')';
  });

  legend.append('rect')
  .attr('width', legendRectSize)
  .attr('height', legendRectSize)
  .style('fill', colorArea)
  .style('stroke', colorArea);

  legend.append('text')
  .attr('x', legendRectSize + legendSpacing )
  .attr('y', legendRectSize - legendSpacing + 8)
 // .attr('text-color', black)
 // .attr('color', black)     //#c0c0c0
  .text(function(d) { return data_full['countryMapping']['1990'][d] ; });
  

}

function renderBoxPlot(dataTemp) {
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
  
  console.log("Temp:",dataTemp);
  
  var rowHeight = heightBP/4;
  
  function getFontSize(text,space,max) {
    max = max || -1;
    len = text.length;
    size = space/len * 2;
    if (max !== -1 && size > max) {
      size = max;
    }
    return 10
  }
  //console.log("TempSet",dataTemp);
  //create a scale for each column
  var colKeys = [];
  var sizeScales = [];
  var colorScales = [];
  for (var key in dataTempset[0])
  {
    if ((key !== "id") && (key !== "name")) {
      colKeys.push(key);
      var maxValue = d3.max(dataTempset, function(d){ return +d[key]; });
      console.log("maxval",maxValue);
      var sizeScale = d3.scaleSqrt()
        .domain([0,maxValue])
        .range([0,(rowHeight - rowPadding)-10]);
      sizeScales.push(sizeScale);
      var colorScale = d3.scaleLinear()
        .domain([0,maxValue])
        .range(['honeydew','darkgreen']);
      colorScales.push(colorScale);
    }
  }
  //console.log("colkeys",colKeys);

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
    .text(function(d) { console.log("myyy:", d.indexOf("-")); return d.substr(0,d.indexOf("-")) })
  .attr("font-size", function(d) { return String(getFontSize(d,marginBP.top*1.5,24))+"px" })
    .attr("y",-20)
  .attr("x", columnWidth/2-55)
  .style("text-anchor","left")
    .attr("transform", "translate(20)");

      columnLabels.append("text")
    .text(function(d) { console.log("myyy:", d.indexOf("-")); return d.substr(1+d.indexOf("-"),d.length) })
  .attr("font-size", function(d) { return String(getFontSize(d,marginBP.top*1.5,24))+"px" })
    .attr("y",-5)
  .attr("x", columnWidth/2-55)
  .style("text-anchor","left")
    .attr("transform", "translate(20)");
  
  /*var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
  .style("opacity","0.8")
    .style("background", "white")
  .style("color","black");*/
    
    dataTempset.forEach(function(d) {
  
    //console.log(d3.values(d).slice(2));
      //console.log("ryan: ",d);
      var rowNumber = defaults.indexOf(d.id);


      var rowG = chart.append("g")
      .attr("transform", "translate(0," + (rowNumber * rowHeight) + ")");
      
      rowG.append("text")
      .text(d.name)
    .attr("font-size", String(getFontSize(d.name,marginBP.left-20,24)) +"px")
      .attr("x", -rowPadding)
      .attr("y", rowHeight/2 + getFontSize(d.name,marginBP.left-20,24)/3)
      .style("text-anchor", "end");

    var boxes =  rowG.selectAll("g")
    .data(d3.values(d).slice(2))
    .enter()
    .append("g")
    .attr("class", "box")
    .attr("transform", function(d, i) {return "translate(" + (columnWidth * i) +",0)"; });
    
    //boxes.selectAll('rect').remove();
    boxes.append("rect")
    .attr("x", function(d,i) { return (columnWidth - sizeScales[i](d))/2; })
    .attr("y", function(d,i) { return (rowHeight - sizeScales[i](d))/2; })
    .attr("width", function(d,i) { return sizeScales[i](d); })
    .attr("height", function(d,i) { return sizeScales[i](d); })
    .on("mouseover", function(d) {            // code for hover tooltip
      div.transition()
      .duration(200)
      .style("opacity", .9);
      div.html(d)
      .style("left", (d3.event.pageX) + "px")
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    }) 
    .style("fill", function(d,i){ return colorScales[i](d); });
    /*.on("mouseover", function(d){tooltip.text(d); return tooltip.style("visibility", "visible");})
      .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});*/
    
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
   console.log("T1",overMin)
   console.log("T2",overMax)

  let color = d3.scaleLinear().domain([overMin,overMax])
       .range(colorcurr);
	   
  let colorS =d3.scaleLog().base(1)
				.domain([overMin+1,overMax+1])
				.range([d3.rgb(colorcurr[0]), d3.rgb(colorcurr[4])])
				.interpolate(d3.interpolateHcl);
  //let  colorScale = d3.scaleSequential(d3.interpolateInferno).domain([9365166,78870119013703]).range(colorcurr);  
//  let colorS = d3.scaleLog().base(2).domain([overMin,overMax])
    //.interpolate(d3.interpolateHslLong)
 //      .range(colorcurr);
//  console.log(colorScale(1911600970))
    
  return colorS;
//  let scale = d3.scalePow().exponent(6)
//          .domain([overMin,overMax])
//          .range(d3.schemeBuPu[tot]);
}

function onClickfunc(myobj, arg1, i){
                          //console.log(defaults.some(function(entry) { return entry == arg1.id; }));

                          console.log("defaults:",defaults);
  if(noselect.some(x => x == arg1.id)){
    return;
  }
  console.log("defaults:",defaults);

  if(defaults.some(function(entry) { return entry == arg1.id; })) {
    let myindex = defaults.indexOf(arg1.id);
    console.log(myindex);
    if (myindex !== -1) {
      defaults.splice(myindex, 1);
      d3.select("#"+arg1.id).classed("selected", false);
      d3.select("#oc-bubble-"+arg1.id).classed("selected", false);
    }
    if(defaults.length==0){
      defaults.push("Total");
      flag_countryselect = false;
    }
  }
  else{
    if (!flag_countryselect){
      defaults[0] = arg1.id;
      d3.select("#"+arg1.id).classed("selected", true);
      d3.select("#oc-bubble-"+arg1.id).classed("selected", true);
      flag_countryselect = true;
    }
    else{
      if(defaults.length<5){
        defaults.push(arg1.id);
        d3.select("#"+arg1.id).classed("selected", true);
        d3.select("#oc-bubble-"+arg1.id).classed("selected", true);
      }
    };        
  };
  renderArea(data_full[selected_dataset]);
  renderBoxPlot(dataRyan);
  //renderBars(calcColorScale(computeranges(data_full['DHSFS']['2013'])), data_full['DHSFS']['2013']);
  if (selected_dataset=="LWHT"){
    renderDP(computeranges(data_full['LWHM']), computeranges(data_full['LWHW']), computeranges(data_full['LWHC']));
  };
  if (selected_dataset=="Deaths"){
    renderDP(computeranges(data_full['DeathsMale']), computeranges(data_full['DeathsFemale']), computeranges(data_full['DeathsChildren']));
  };
}

function renderDP(dataM, dataF, dataC){
  let totalM=0, totalF=0, totalC=0;
  for (var i = 0; i < defaults.length; i++) {
        if (dataM[defaults[i]] >=0 && dataF[defaults[i]] >=0 && dataC[defaults[i]] >=0){ 
          totalM = totalM + dataM[defaults[i]];
          totalF = totalF + dataF[defaults[i]];
          totalC = totalC + dataC[defaults[i]];
        }
    };
  console.log("dataM: ",dataM);

  hratio = (totalM+totalF)/(totalM+totalF+totalC);
  wratio = totalM/(totalM+totalF);

  console.log("hratio: ",hratio);
  
  if (isNaN(hratio) || isNaN(wratio)){
    return;
  }
  //hratio = 0.6;
  //wratio=0.8;
  
  svg_DP.selectAll('rect').remove();
  svg_DP.selectAll('text').remove();
  svg_DP.append('rect') //men
  .attr('width', (widthDP-10)*(wratio))
  .attr('height', (heightDP-10)*(hratio))
  .attr('x',0)
  .attr('fill',colorcurr[0])
  .on("mouseover", function(d) {            // code for hover tooltip
    div.transition()
    .duration(200)
    .style("opacity", .9);
    div.html(Math.round(totalM*100)/100)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  }) 
  .attr('y',0);

  svg_DP.append('text')
  .text("Men")
  .attr("x", (widthDP)*(wratio/2))
  .attr("y", (heightDP)*(hratio/2))
  .style("text-anchor", "middle");

  svg_DP.append('rect') // women
  .attr('width', (widthDP-10)*(1-wratio))
  .attr('height', (heightDP-10)*(hratio))
  .attr('x',widthDP*(wratio))
  .attr('fill',colorcurr[0])
  .on("mouseover", function(d) {            // code for hover tooltip
    div.transition()
    .duration(200)
    .style("opacity", .9);
    div.html(Math.round(totalF*100)/100)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  }) 
  .attr('y',0);

  svg_DP.append('text')
  .text("Women")
  .attr("x", (widthDP)*(wratio) + (widthDP-10)*(1-wratio)/2)
  .attr("y", (heightDP)*(hratio/2))
  .style("text-anchor", "middle");

  svg_DP.append('rect') // children
  .attr('width', (widthDP))
  .attr('height', (heightDP-10)*(1-hratio))
  .attr('x',0)
  .attr('fill',colorcurr[0])
  .on("mouseover", function(d) {            // code for hover tooltip
    div.transition()
    .duration(200)
    .style("opacity", .9);
    div.html(Math.round(totalC*100)/100)
    .style("left", (d3.event.pageX) + "px")
    .style("top", (d3.event.pageY - 28) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
    .duration(500)
    .style("opacity", 0);
  }) 
  .attr('y',heightDP*hratio);

  svg_DP.append('text')
  .text("children")
  .attr("x", widthDP*(1/2))
  .attr("y", 5 +(heightDP)*(hratio) + (heightDP)*(1-hratio)/2)
  .style("text-anchor", "middle");



}