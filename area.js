areaChart = {
  init: function (h, w) {
    var svg = d3.select("svg"),
        margin = {top: 20, right: 0, bottom: 10, left: 50},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom;
        // g = svg.append("g").attr("transform", "translate(" + margin.left + "," + (+svg.attr('height') - h) + ")");

    var
      g = svg.append('g'),
      segments = g.append('g').attr('class', 'segments'),
      xAxis = g.append('g').attr('class', 'axis axis--x'),
      countryGroup = g.append('g').attr('class', 'country'),
      timeRange = d3.range(2004, 2015),
      formatYear = d3.timeFormat('%Y'),
      parseYear = d3.timeParse('%Y'),
      series = [],
      parsedData = [],
      schemes = ['Greens','YlOrRd','PuBu'],
      dimension = 0, // 0 = annual loss, 2 = accumulated loss
      x,
      y,
      color = d3.scaleSequential(d3.interpolateWarm).domain([-4, 9]), // -4 to skip the lighter end of the scale
      area,
      keysList = [],
      colorKeysList,
      persistentKeysList,
      keyOrder,
      legend
    ;

    d3.queue()
      .defer(d3.csv, 'non_brazil_deforestation.csv', parseRow)
      .await(parse);


    function parse (error, data) {
      parsedData = aggregateData('', data);

      timeRange.forEach( function(y) {
        var row = { year: parseYear(y) };
          for (var d in parsedData[dimension]) {
            row[d] = parsedData[dimension][d][y];
          }
        series.push(row);
      });

      keysList = Object.keys(parsedData[dimension]);
      colorKeysList = keysList.slice().reverse(); // to ensure we insert at correct position
      persistentKeysList = keysList.slice();
      createLegend();
      update();
    }

  function createLegend() {

        // labels
    var legend = g.selectAll('.label')
      .data(colorKeysList)
      .enter()
      .append('text')
      // .attr('x', 0)
      // // .attr('dy', '0.35em')
      // .attr('transform', 'translate(' + (width - 50) + ')')
      .style('fill', function(d, index) {
        return color(index);
      })
      .text(function(d) {
        return d;
      })
      .on('click', function (d, index, list) {
        toggleKey(d, list[index]);
      })
      // .transition().duration(850).ease(d3.easeCubicInOut)
        .style('opacity', 1 )
        .attr('transform', function(d, index, list) {
          return 'translate(' + (width - 100) + ',' + ((list.length * 20) - (index * 20)) + ')';
        });

    // labels = legend.selectAll('text');
    // labels.enter()
    //       .append('text')
    //       .attr('class', 'label')
    //       .merge(labels);
    // labels.exit().remove();

  }
  /**
   * Updates stack, layers, segments and layers on datachange
   */
  function update() {


    // ref:https://github.com/d3/d3-shape/blob/master/README.md#stack
    stack = d3.stack()
      .keys(keysList)
      .order(d3.stackOrderReverse)
      .offset(d3.stackOffsetWiggle);

    legend = // create the legend here

    layers = stack(series);

    // Ref: https://github.com/d3/d3-selection#joining-data
    segment = segments.selectAll('path').data(layers);
    segment.enter()
           .append('path')
           .attr('class', 'segment')
           // .on('mouseover', mouseOver)
           // .on('mouseout', mouseOut)
           // .on('mousemove', mouseMove)
           .merge(segment);
    segment.exit().remove();



    render();
  }

    /**
   * render
   */
  function render() {

    setDimensions(window.innerWidth);

    // scales
    x = d3.scaleTime()
          .domain([parseYear(2004), parseYear(2014)])
          .range([0, width]);

    y = d3.scaleLinear()
          .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
          .range([height, 0]);

    area = d3.area()
          .x(function(d) {return x(d.data.year); })
          .y0(function(d) {
            return y(d[0]) - 0.2; }) // .2 spacing, ref: https://bl.ocks.org/HarryStevens/c893c7b441298b36f4568bc09df71a1e
          .y1(function(d) {
            return y(d[1]) + 0.2; })
          // .curve(d3.curveBasis);
          .curve(d3.curveCardinal);

    // draw
    svg.attr('width', (width + margin.left + margin.right ))
       .attr('height', (height + margin.top + margin.bottom));

    g.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // layers
    segments.selectAll('.segment')
      .transition().duration(850).ease(d3.easeCubicInOut)
        .attr('d', function(d) { return area(d); })
        .attr('fill', function(d) {
          return color(d.index);
        });

    // segments.selectAll('.label')
    //   .attr('x', 13)
    //   .attr('dy', '0.35em')
    //   .attr('transform', 'translate(' + width + ')')
    //   .style('fill', function(d) { return color(d.index); })
    //   .style('opacity', 0 )
    //   .text(function(d) { return lang(d.key); })
    //   .transition().duration(850).ease(d3.easeCubicInOut)
    //     .style('opacity', 1 )
    //     .attr('transform', function(d) {
    //       return 'translate(' + width + ',' + y(d[17][1] - (d[17][1] - d[17][0])/2) + ')';
    //     });

    xAxis.attr('transform', 'translate(0,' + 0 + ')')
        .call(
          d3.axisBottom(x)
          .ticks(d3.timeYear.every(2))
          .tickSizeInner(height)
          .tickSizeOuter(0)
          .tickPadding(- (height / 2) - 10)
        )
        .select('.tick:last-of-type text')
          .attr('dx', -5)
          .style('text-anchor', 'end');


    // govGroup.selectAll('line')
    //         .attr('x1', function (d) { return x(d.start); })
    //         .attr('y1', 28)
    //         .attr('x2', function (d) { return x(d.start)+3; })
    //         .transition().duration(350).ease(d3.easeCubicInOut)
    //         .attr('y2', function (d, i) {
    //           var modifier = showPercentage ? 0.25 : -1;
    //           return height + (( i%2 ? 50 : 25 ) * modifier) ;
    //         })
    //         .attr('stroke-width', function (d, i) { return i ? 1 : 0; });

    // govGroup.selectAll('.label')
    //         .attr('text-anchor', function (d, i) { return i === 0 ? 'end' : 'start'; })
    //         .transition().duration(350).ease(d3.easeCubicInOut)
    //         .attr('transform', function(d, i) {
    //           var modifier = showPercentage ? 0.75 : -1;
    //           var xPos = i === 0 ? x(d.end) : x(d.start);
    //           var yPos = height + (( i%2 ? 40 : 15 ) * modifier);
    //           return 'translate(' + xPos + ',' + yPos + ')';
    //         });

    // govGroup.selectAll('tspan').remove();
    // govGroup.selectAll('.label').append('tspan')
    //          .text(function(d) { return d.pm; })
    //          .attr('x', function (d, i) { return i === 0 ? -10 : -1; })
    //          .attr('dy', '0.35em');

    // govGroup.selectAll('.label').append('tspan')
    //          .text(function(d) { return '(' + d.parties + ')'; })
    //          .attr('x', function (d, i) { return i === 0 ? -10 : -1; })
    //          .attr('dy', '1.35em')
    //          .style('font-size', '10px');
  }

  function parseRow(input) {
    var output = {};
    for (var k in input) {
      if(isNaN(k)) {
        output[k] = input[k];
      } else {
        output[k] = +input[k];
      }
    }
   return output;
  }

  function stackMax(layer) {
    return d3.max(layer, function(d) { return d[1]; });
  }

  function stackMin(layer) {
    return d3.min(layer, function(d) { return d[0]; });
  }

  function toggleKey(value, item) {
    var kIndex = keysList.indexOf(value);
    var clicked = d3.select(item);
    if (kIndex === -1) {
      clicked.style('fill', color(colorKeysList.indexOf(value)));
      insertIfPossible(value);
    } else {
      clicked.style('fill', '#63595C');
      keysList.splice(kIndex,1);
    }
    update();
  }

  function aggregateData(dimension, data) {
    var totals,
        sumTotals = {},
        accummulated
      ;

    totals = d3.nest()
      .key(function(d) {
        return d.Country;
      })
      .rollup(function(v) {
            var row = {};
            timeRange.forEach( function(y) {
               row[y] = Math.round(d3.sum(v, function(d) {return d[y];}));
            });
          return row;
      })
      .object(data);

    accummulated = d3.nest()
      .key(function(d) {
        return d.Country;
      })
      .rollup(function(v) {
            var row = {};
            var prevVal = 0;
            var currentVal;
            timeRange.forEach( function(y) {
               currentVal = Math.round(d3.sum(v, function(d) {return d[y];}));
               row[y] = currentVal + prevVal;
               prevVal = row[y];
            });
          return row;
      })
      .object(data);

    timeRange.forEach( function(y) {
      sumTotals[y] = d3.nest()
        .rollup(function(values) { return d3.sum(values, function(d) { return d[y]; }); })
        .object(data);
    });

    return [totals, sumTotals, accummulated];
  }

  /**
   * Attempts to insert the value into the position it was earlier
   */
  function insertIfPossible(value) {
    var originalIndex = persistentKeysList.indexOf(value);
    var previousItems = persistentKeysList.slice(0,Math.min(originalIndex, keysList.length));
    var itemsAfter = persistentKeysList.slice(Math.min(originalIndex+1, keysList.length));
    var index = 0;
    for (var i = 0; i < previousItems.length; i++) {
      if (keysList.indexOf(previousItems[i]) != -1) {
        index ++;
      }
    }

    keysList.splice(index,0,value);
  }

    function setDimensions(window) {
      isMobileIsh = window <= 470;
      if (isMobileIsh) {
        margin = {top: 20, right: 20, bottom: 10, left: 10 };
      } else {
        margin = {top: 30, right: 200, bottom: 50, left: 20 };
      }

      width = Math.min(window, 970) - margin.left - margin.right;
      height = width/1  - margin.top - margin.bottom;

  }
}

};
