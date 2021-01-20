var court_height = 5.49;
var court_max_height = court_height + 8;
var court_width = 8.23;
var court_max_width = court_width + 9;
var width_side = (court_max_width - court_width) / 2;

var viewbox_width = 800;
var viewbox_height = viewbox_width * (court_max_height / court_max_width);
                      
var margins = {
  top: viewbox_height * 0.01,
  right: viewbox_width * 0.1,
  left: viewbox_width * 0.02,
  bottom: viewbox_height * 0.02,
  highlighter: viewbox_height * 0.08
};


function meters_to_pixels(x, minx, maxx, max_width){
  return (x - minx) / (maxx - minx) * max_width;
}

function distance(x, y){
  return Math.pow(Math.pow(x, 2) + Math.pow(y, 2), 0.5);
}

function filestr(defs){
  var str = '/js/returnimpact/data/' + defs[0] + "-" + defs[1] + "-" + defs[2] + "-" + defs[3] + ".csv";
return str;
}

var svg = d3.select("#court")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0" + " " + viewbox_width + " " + viewbox_height)
  .classed("svg-content", true);

var width = +d3.select('#court').style('width').slice(0, -2);
var height = width * (court_max_height / court_max_width);

var height_scale = d3.scaleLinear()
                  .domain([6.49, 6.49 + court_max_height])
                  .range([0, width * (court_max_height / court_max_width)]);

var width_scale = d3.scaleLinear()
                  .domain([0, -1 * court_max_width/2, court_max_width/2])
                  .range([0, width]);

var height_vb = d3.scaleLinear()
                  .domain([0, viewbox_height])
                  .range([0, height]);

var width_vb = d3.scaleLinear()
                  .domain([0, viewbox_width])
                  .range([0, width]);


svg
  .attr("width", "100%")
  .attr("height", "100%")
  //.attr("width", width + margins.right + margins.left)
  //.attr("height", width * (court_max_height / court_max_width) + margins.top + margins.bottom)
  .attr("transform", "translate(" + 0 + "," + 0 + ")");

svg.append("rect")
   .attr("class", "plotbg")
   .attr("width", "100%")
   .attr("height", "100%");

// Add the path using this helper function
var courtmap = svg.append('g')
  .attr("id", "courtmap")
  .attr('width', width)
  .attr('height', width * (court_max_height / court_max_width))
  .attr("transform", "translate(" + margins.left + "," + margins.top + ")");


courtmap.append('g')
  .append("rect")
  .attr('class', 'courtbg')
  .attr('width', width)
  .attr('height', width * (court_max_height / court_max_width));


courtmap.append('rect')
  .attr('class','courtrect')
  .attr('id','courtrect')
  .attr('x', width * ((court_max_width - court_width)/2 / court_max_width))
  .attr('y', 0)
  .attr('width', width * (court_width / court_max_width))
  .attr('height', width * (court_max_height / court_max_width) * (court_height / court_max_height));
  
courtmap.append('g')
  .attr('class', 'grid')
  .call(
      d3.axisLeft(height_scale)
      .tickSize(-width)
      .tickFormat(function(d) { return (d - 11.89).toFixed(0) + "m"; })
      .ticks(10)
  );

courtmap.selectAll("text")
      .attr("transform", "translate(+15,10)")      
      .style("text-anchor", "middle");

courtmap.append('line')
  .attr('class', 'courtline')
  .attr('x1', meters_to_pixels(width_side, 0, court_max_width, width))
  .attr('y1', 0)
  .attr('x2', meters_to_pixels(width_side, 0, court_max_width, width))
  .attr('y2', meters_to_pixels(court_height, 0, court_max_height, height));

courtmap.append('line')
  .attr('class', 'courtline')
  .attr('x1', meters_to_pixels(width_side + court_width, 0, court_max_width, width))
  .attr('y1', 0)
  .attr('x2', meters_to_pixels(width_side + court_width, 0, court_max_width, width))
  .attr('y2', meters_to_pixels(court_height, 0, court_max_height, height));

courtmap.append('line')
  .attr('class', 'courtline')
  .attr('x1', meters_to_pixels(width_side, 0, court_max_width, width) -4)
  .attr('y1', meters_to_pixels(court_height, 0, court_max_height, height))
  .attr('x2', meters_to_pixels(width_side + court_width, 0, court_max_width, width) +4)
  .attr('y2', meters_to_pixels(court_height, 0, court_max_height, height));

courtmap.append('line')
  .attr('class', 'gridline')
  .attr('x1', meters_to_pixels(width_side + court_width/2, 0, court_max_width, width))
  .attr('y1', 0)
  .attr('x2', meters_to_pixels(width_side + court_width/2, 0, court_max_width, width))
  .attr('y2', meters_to_pixels(court_max_height, 0, court_max_height, height));
      
var width_side_pixels = meters_to_pixels(width_side, 0, court_max_width, width);

courtmap.append("text")
      .attr("class", "highlighter-coordinate")
      .attr("x", margins.left + margins.highlighter)
      .attr("y", height + margins.highlighter)
      .attr("id", "coordinate-depth")
      .text("Depth:");

courtmap.append("text")
      .attr("class", "highlighter-coordinate")
      .attr("x", margins.left + margins.highlighter * 4)
      .attr("y", height + margins.highlighter)
      .attr("id", "coordinate-width")
      .text("Width:");

courtmap.append("text")
      .attr("class", "highlighter-coordinate")
      .attr("x", margins.left + margins.highlighter * 7)
      .attr("y", height + margins.highlighter)
      .attr("id", "coordinate-density")
      .text("Prob Density:");


  var legendWidth = margins.right * 0.4;
  var legendHeight = height;

  var legendsvg = svg.append("g")
     .attr("width", legendWidth)
     .attr("height", legendHeight)
     .attr("transform", "translate(" + (width + margins.left + 5) + "," + margins.top + ")");

  var gradient = legendsvg.append('defs')
            .append('linearGradient')
            .attr('id', 'gradient')
            .attr('x1', '0%') // bottom
            .attr('y1', '0%')
            .attr('x2', '0%') // to top
            .attr('y2', '100%')
            .attr('spreadMethod', 'pad');


// Initializing

Promise.all([
    d3.csv("/js/returnimpact/data/nadal.csv"),
    d3.csv("/js/returnimpact/data/returners.csv"),
]).then(function(files) {
    drawgraph(files[0], files[1])
}).catch(function(err) {
    // handle error here
})


function drawgraph(data, players) {

var players = d3.map(players, function(d){return d.player;}).keys();

const rect_width = +d3.map(data, function(d) {return width_vb(+d["px"]);}).keys()[1];
const rect_height = +d3.map(data, function(d) {return height_vb(+d["py"]);}).keys()[1];
const circle_radius = rect_width * 3;
const circle_area = 2 * Math.PI * Math.pow(circle_radius, 2);
const prob_adj = circle_area / (rect_width * rect_height);

// Set according to the max of dull dataset
var color = d3.scaleSequential(d3.interpolatePlasma).domain([0, d3.max(data.map(function(d) {return +d["p"];}))]);

//Append a defs (for definition) element to your SVG
var opacity = d3.scaleLinear()
  .domain([0, d3.max(data.map(function(d) {return +d["p"];}))])
  .range([0, 1]);

var hoveropacity = d3.scaleLinear()
  .domain([0, d3.max(data.map(function(d) {return +d["p"];}))])
  .range([0.5, 2]);  


courtmap.append('g')
    .append("circle")
      .attr("class", "highlighter-circle")
      .attr("cx", margins.left)
      .attr("cy", height + margins.highlighter - 10)
      .attr("r", circle_radius * .7);


courtmap.append('g')
    .append("circle")
      .attr("class", "hovercircle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", circle_radius)
      .attr("fill", "transparent")
      .attr("stroke", "transparent");

   var scaleN = 6;
   var maxColourScale = d3.max(data.map(function(d) {return +d["p"];}));
   var scale = d3.range(scaleN).map(function(d) {return color(maxColourScale * (d / (scaleN - 1)))});

   var pct = linspace(0, 100, scale.length).map(function(d) {
            return Math.round(d) + '%';
        });

   var pct_scaled = linspace(0, 100, scale.length).map(function(d) {
            return Math.round(d * maxColourScale * prob_adj) + '%';
        });   

   var colourPct = d3.zip(pct, scale);

   colourPct.forEach(function(d) {
            gradient.append('stop')
                .attr('offset', d[0])
                .attr('stop-color', d[1])
                .attr('stop-opacity', 1);
        });
      
  legendsvg.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(" + 1 + "," + 0 + ")");

  var xScale = d3.scaleLinear()
   .range([0, legendHeight * 0.9])
   .domain([0, 1]);

 legendsvg.append("g")
  .attr("class", "legendaxis")
  .call(
    d3.axisRight(xScale)
    .ticks(scaleN)
    .tickFormat(function(d,i){return pct_scaled[i];})
    .tickPadding(0)
    )
   .attr("transform", "translate(" + (legendWidth + 1) + "," + legendHeight * 0.05 + ")");

   legendsvg.selectAll(".tick")
      .attr("class", "legendtick")
      .attr("dy", 0);

    // Default selections
    var update_defaults = ["R. Nadal", "Ad", "Body", "Hard"];

    initial_plot(data, color, opacity, rect_width, rect_height);

    d3.selectAll("rect.rectgrid")
    .on("mouseover", function(d){

           var point = d3.select(this).data();
           var density = point[0]["p"] * prob_adj * 100;

           d3.select("#coordinate-width")
               .text("Width: " + (+point[0]["x"]).toFixed(1) + "m");

           d3.select("#coordinate-depth")
               .text("Depth: " + (point[0]["y"] - 11.89).toFixed(1) + "m");

           d3.select("#coordinate-density")
               .text("Prob Density: " + density.toFixed(1) + "%");

           d3.select(".hovercircle")
              .attr("cx", +width_vb(point[0]["px"]) + rect_width/2)
              .attr("cy", +height_vb(point[0]["py"]) + rect_height/2)
              .transition()
              .attr("fill", color(+point[0]["p"]))
              .attr("fill-opacity", opacity(+point[0]["p"]));
         })
      .on("mouseout", function(d){
           d3.select("#coordinate-width")
               .text("Width:");

           d3.select("#coordinate-depth")
               .text("Depth:");

           d3.select("#coordinate-density")
               .text("Prob Density:");

           d3.select(".hovercircle")
             .attr("fill", "transparent")
             .attr("fill-opacity", 0);
         });  


    //var players = d3.map(data, function(d) {return d["player"]}).keys();

   
    var player_input = d3.select("#players_list");

      player_input
        .on("input", function(){
          var selection = d3.select(this).property("value");
          update_defaults[0] = selection;
          var file = filestr(update_defaults);
        d3.csv(file, d3.autoType).then(function(d) {return update(d, color, opacity, rect_width, rect_height)})
       });

   // Datalist     
    var player_list = d3.select("#players")
                    .insert("select", "svg");

    
    player_list.selectAll("option")
                  .data(players)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });

    var serve_options = ["Ad Body", "Ad T", "Ad Wide", "Deuce Body", "Deuce T", "Deuce Wide"];

    var serve_list = d3.select("#serves")
                    .insert("select", "svg");

    var serve_input = d3.select("#serve_list");

        serve_input                   
              .on("input", function(){
        var selection = d3.select(this).property("value").split(" ");
        update_defaults[1] = selection[0];
        update_defaults[2] = selection[1];
        var file = filestr(update_defaults);
        d3.csv(file, d3.autoType).then(function(d) {return update(d, color, opacity, rect_width, rect_height)})
       });


    
    serve_list.selectAll("option")
                  .data(serve_options)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });

  var surface_options = ["Hard", "Grass", "Clay"];

  var surface_list = d3.select("#surfaces")
                    .insert("select", "svg");

  var surface_input = d3.select("#surface_list");

        surface_input
        .on("input", function(){
        var selection = d3.select(this).property("value");
        update_defaults[3] = selection;
        var file = filestr(update_defaults);
        d3.csv(file, d3.autoType).then(function(d) {return update(d, color, opacity, rect_width, rect_height)})
       });


    
    surface_list.selectAll("option")
                  .data(surface_options)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });                    

}
         
function initial_plot(plotdata, color, opacity, rect_width, rect_height) {

  var tiles = courtmap
    .append('g')
    .attr("class", "tiles")
    .selectAll("rect")    
    .data(plotdata);

  tiles
    .enter()
    .append("rect")
      .attr("class", "rectgrid")
      .attr("x", function(d) {return width_vb(d.px);})
      .attr("y", function(d) {return height_vb(d.py);})
      .attr("width", rect_width + 0.05)
      .attr("height", rect_height + 0.05)
      .attr("fill", function(d) {return color(+d.p)})
      .attr("fill-opacity", function(d) {return opacity(+d.p)})
      .attr("stroke", function(d) {return color(+d.p)})
      .attr("stroke-opacity", function(d) {return opacity(+d.p)})
      .attr("stroke-width", 0.05);
}    

 function update(plotdata, color, opacity, rect_width, rect_height) {
 
 tiles = courtmap
    .select("g.tiles")
    .attr("class", "tiles")    
    .selectAll("rect")
    .data(plotdata);

  tiles
    .enter()
    .append("rect")
    .merge(tiles)
      .transition()
      .duration(100)
      .attr("class", "rectgrid")
      .attr("x", function(d) {return width_vb(d.px);})
      .attr("y", function(d) {return height_vb(d.py);})
      .attr("width", rect_width + 0.05)
      .attr("height", rect_height + 0.05)
      .attr("fill", function(d) {return color(+d.p)})
      .attr("fill-opacity", function(d) {return opacity(+d.p)})
      .attr("stroke", function(d) {return color(+d.p)})
      .attr("stroke-opacity", function(d) {return opacity(+d.p)})
      .attr("stroke-width", 0.05);

    tiles.exit().remove();      
}                                      

function linspace(start, end, n) {
        var out = [];
        var delta = (end - start) / (n - 1);

        var i = 0;
        while(i < (n - 1)) {
            out.push(start + (i * delta));
            i++;
        }

        out.push(end);
 return out;
}
