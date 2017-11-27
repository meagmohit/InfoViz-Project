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
    d3.selectAll("svg#map path").transition()
        .delay(100)
        .call(fillMap, color, data);

    // update path titles
    d3.selectAll("svg#map path title")
        .call(setPathTitle, data);

    // update headline
    d3.select("h2").text(headline + d3.select("#year").node().value);
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
        .text(function(d, i) {
            return d;
        });

    d3.select("svg#map g.legend_title text")
        .text("Legend (quintile ranges)")
        .attr("x", 30)
        .attr("y", 286);
}

function renderPaths(d){
  var line = backLayer.append("path")
    .datum(data)
    .attr({
      d: lineGenerator(data),
      fill: 'none',
      stroke: "red",
      "stroke-width": "3px",
      "shape-rendering": "geometricPrecision"
    });

  var totalLength = line.node().getTotalLength();

  line.attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(2000)
    .ease("linear")
    .attr("stroke-dashoffset", 0);

	
	console.log(d);
}


function renderCircles(color, data) {
    var simulation = d3.forceSimulation()
        .velocityDecay(0.1)
        .force("x", d3.forceX(960 / 2).strength(.05))
        .force("y", d3.forceY(100 / 2).strength(.05))
        .force("charge", d3.forceManyBody().strength(-240))
        .force("link", d3.forceLink().distance(50).strength(1));


    var arr = Object.keys(data).map(function(key) {
        return data[key];
    });
    var min = Math.min.apply(null, arr);
    var max = Math.max.apply(null, arr);

    array = [];
    let rscale = d3.scaleLinear().domain([min, max]).range([5, 50]);
    let xscale = d3.scaleLinear().domain([min, max]).range([5, 910]);

    for (let key of Object.keys(data)) {
        array.push({
            'id': key,
            'value': data[key]
        })
    }

    // sort by country on value : edit this code for takin
    array = sortArrObj(array, 'value');

    let bubbles = d3.select("svg#bubbles").selectAll("circle").data(array);
    bubbles.exit().remove();

    bubbles.enter().append("circle")
        .merge(bubbles)
        .attr("cx", function(d) {
            return xscale(d.value);
        })
        .attr("cy", function(d) {
            return 50;
        })
        .attr("r", function(d) {
            return rscale(d.value);
        })
        .style("fill", function(d) {
            return color(d.value);
        })
		.attr("id", function(d) {
			return d.id;
        });
}

function renderBars(color, data) {

    // turn data into array of objects
    array = [];
    for (let key of Object.keys(data)) {
        array.push({
            'id': key,
            'value': data[key]
        })
    }

    // sort by country id
    array = sortArrObj(array, 'id');

    x.domain(array.map(function(d) {
        return d.id;
    }));
    y.domain([0, d3.max(Object.values(data), function(d) {
        return d;
    })]);

    d3.select("svg#bars g.axis").remove();
    let axis = d3.select("svg#bars").append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(" + 30 + "," + (svgBarsHeight + margin.top) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    let bars = d3.select("svg#bars g.bars").selectAll("rect").data(array);
    bars.exit().remove();
    bars.enter().append("rect")
        .merge(bars)
        .attr("fill", function(d) {
            return color(d.value);
        })
        .attr("x", function(d) {
            return x(d.id);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d) {
            return y(d.value);
        })
        .attr("height", function(d) {
            return svgBarsHeight - y(d.value);
        });

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