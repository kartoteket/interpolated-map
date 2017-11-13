areaChart = {
  init: function (h, w) {
    var svg = d3.select("svg"),
        margin = {top: 20, right: 80, bottom: 10, left: 50},
        width = w - margin.left - margin.right,
        height = h - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + (+svg.attr('height') - h) + ")");

    var x = d3.scaleLinear()
        .rangeRound([0, width]);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var area = d3.area()
        .x(function(d) { return x(d.year); })
        .y1(function(d) {
          var yloss = y(d.loss_since_1970);
          return yloss;
        })
        .y0(y(0));

    d3.csv("forest_loss_amazon.csv", function(d) {
      d.year = +d.year;
      d.loss_since_1970 = +d.loss_since_1970;
      return d;
    }, function(error, data) {
      if (error) throw error;

      data = data.sort(function(x, y){
       return d3.descending(x.year, y.year);
      });
      x.domain(d3.extent(data, function(d) { return d.year; }));
      y.domain([300000, 800000]);
      // area.y0(300000);

      g.append("path")
          .attr('class', 'chart')
          .datum(data)
          .attr("fill", "#86311B")
          .attr('opacity', 0.5)
          .attr("d", function (d) {
            p = area(d);
            return p;
          });

      g.append("g")
          .attr('class', 'axis')
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      g.append("g")
          .attr('class', 'axis')
          .attr('transform', 'translate(' + width + ',0) ')
          .call(d3.axisRight(y).ticks(5))
        .append("text")
          .attr("fill", "#000")
          .attr("transform", 'rotate(-90)')
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "start")
          .text("loss (sqkm)");
    });
  }
};
