

//
// This is teh list of all forests and their position
//
var forests = [
  {id: 'americas', translate: 'translate(110,-300), scale(1.8)'},
  {id: 'africa', translate: 'translate(-650,-300), scale(2.3)'},
  {id: 'asia', translate: 'translate(-1300,-250), scale(2.1)'}
];

var previousLink = null;

d3.selectAll('.button').each(function(whatever,index,list) {
  var i = index;
  d3.select(this).on('click', function () {

    //
    // Toggle the selected for this and the prevoius, storing the latter
    //
    d3.select(this).classed('selected', true);
    zoomToItem(i);

    if (previousLink) {
      d3.select(previousLink).classed('selected', false);
    }
    previousLink = this;
  });
});

// console.log(btn);

var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var projection = d3.geoMercator()
                    .scale(210)
                    .translate([width/2.2 , height/2.2]);

// americas
// var projection = d3.geoMercator()
//                     .scale(350)
//                     .translate([width , height / 3]);

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


//insert the current forest, before the original
// svg.insert('path', '.map')
//     .attr('class', 'forest_americas forest');

// svg.insert('path', '.map')
//     .attr('class', 'forest_asia forest');

// svg.insert('path', '.map')
//     .attr('class', 'forest_africa forest');

// //create the original forest layer, before the land
// svg.insert('path', '.forest_americas')
//     .attr('class', 'forest_original_americas forest_original');

// svg.insert('path', '.forest_africa')
//     .attr('class', 'forest_original_africa forest_original');

// svg.insert('path', '.forest_asia')
//     .attr('class', 'forest_original_asia forest_original');
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
      .attr('transform', item.translate)


    //
    // Transform the styles
    //
    d3.timeout(function () {
      var t = d3.transition()
          .duration(100)
          .ease(d3.easeLinear);

    d3.select('.forest_original_' + item.id)
        .transition(t)
        .style('fill','#F6F1EB');

    }, 1000);


  }
}

