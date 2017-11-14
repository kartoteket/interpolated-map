

//
// This is teh list of all forests and their position
//
var forests = [
  {id: 'americas', translate: 'translate(110,-300), scale(1.8)'},
  {id: 'africa', translate: 'translate(-650,-300), scale(2.3)'},
  {id: 'asia', translate: 'translate(-1300,-250), scale(2.1)'}
];

var previousIndex = -1;

d3.selectAll('.button').each(function(whatever,index,list) {
  var i = index;
  d3.select(this).on('click', function () {



    //
    // Toggle the selected for this and the prevoius, storing the latter
    //
    d3.select(this).classed('selected', true);

    if (previousIndex != -1) {
      var previousItem = forests[previousIndex];
      d3.select('.button_' + previousItem.id).classed('selected', false);
      d3.select('.forest_original_' + previousItem.id).style('fill', '#099209');
      d3.select('.chart').remove();
      d3.selectAll('.axis').remove();
    }

    //
    // Reselecting a selected item, zoom back to start
    //
    if (previousIndex === i) {
      svg.selectAll('path')
          .transition().duration(1000)
          .attr('transform', '');
    } else {
      zoomToItem(i);
    }
    previousIndex = i;
  });
});

// console.log(btn);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoMercator()
                    .scale(210)
                    .translate([width/2.2 , height/2.2]);


var path = d3.geoPath()
            .projection(projection);



svg.append("defs").append("path")
    .datum({type: "Sphere"})
    .attr("id", "sphere")
    .attr("d", path);

svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

svg.append("use")
    .attr("class", "fill")
    .attr("xlink:href", "#sphere");

// create the country borders, before the land
svg.insert('path','.map')
    .attr('class', 'land');


//  world/110m.json
d3.json("https://unpkg.com/world-atlas@1/world/110m.json", function(error, world) {
  if (error) throw error;
  d3.select('.land')
      .datum(topojson.feature(world, world.objects.land))
      .attr("d", path);
});


//
// Load the original forest
//
d3.json("assets/original_forests.json", function(error, result) {
  if (error) throw error;

  for (var i = 0; i < forests.length; i++) {
    var id = forests[i].id;
    var datum = topojson.feature(result, result.objects[id]);
    createSVGItem(id, datum, '_original');
  }

  fetchCurrent();
});

//
// We run fetching synchronically as we want the overlapping original to load first
//
function fetchCurrent() {
  d3.json("assets/current_forests.json", function(error, result) {
    if (error) throw error;

    for (var i = 0; i < forests.length; i++) {
      var id = forests[i].id;
      var datum = topojson.feature(result, result.objects[id]);
      createSVGItem(id, datum, '');
    }

    // zoomToItem(0);
    // areaChart.init(200, width);
  });

}

function createSVGItem(id, datum, prefix) {
    svg.insert('path', '.forest_' + id)
      .datum(datum)
      .style('fill','#099209')
      .attr('class', 'forest' + prefix + '_' + id + ' forest' + prefix)
      .attr("d", path);
}

function zoomToItem(index) {
  var item;
  if (index != -1 && index < forests.length) {
    item = forests[index];
    //
    // Zoom it
    //
    svg.selectAll('path')
      .transition().duration(1000)
      .attr('transform', item.translate);


    //
    // Transform the styles
    //
    d3.timeout(function () {
      var t = d3.transition()
          .duration(100)
          .ease(d3.easeLinear);

      d3.select('.forest_original_' + item.id)
          .transition(t)
          .style('fill','#F6F1EB')
          .transition()
          .duration(2000)
          .style('fill', '#86311B' );
          // .on('end', function () {
          //     if (index === 0) {
          //       areaChart.init(200, width);
          //     }
          // });


    }, 1000);

  }

}


