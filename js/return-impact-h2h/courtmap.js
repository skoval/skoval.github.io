var court_height = 5.49;
var court_max_height = court_height + 9;
var court_width = 8.23;
var court_max_width = court_width + 9;
var width_side = (court_max_width - court_width) / 2;
var color1 = "#3bbb75";
var color2 = "#e78e0c";
var nbands = 20;
var side_options = ["Ad", "Deuce"];
var surface_options = ["Hard", "Grass", "Clay"];
var serve_options = ["First", "Second"];
      
var viewbox_width = 900;
var viewbox_height = viewbox_width * (court_max_height / court_max_width);
                      
var margins = {
  top: viewbox_height * 0.01 * 0,
  right: viewbox_width * 0,
  left: viewbox_width * 0.02 * 0,
  bottom: viewbox_height * 0.02,
  highlighter: viewbox_height * 0
};

function remove(x, j){
  return x.filter((item, i) => (i !== j));
}

function side_format(ad){
  if(ad === 'Ad')
      return 'ad';
  else
      return 'deuce';
}

function serve_format(first){
  if(first === 'First')
      return '1';
  else
      return '2';
}


function surface_format(hard){
  if(hard === 'Hard')
      return 'hard';
  else if (hard == 'Clay')
      return 'clay';
  else
      return 'grass';
}

function filestr(defs, players){

  const playeri = players.findIndex((element, index) => {if(element.player === defs[0]) return true;});
  const side = side_format(defs[1]);
  const serve = serve_format(defs[2]);
  const surface = surface_format(defs[3]);

  var str = '/js/return-impact-h2h/data/player_' + 'r' + (playeri + 1) + "_" + side + "_" + "s" + serve + "_" + surface + ".json";
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
                  .domain([court_height, -1 * (court_max_height - court_height)])
                  .range([0, width * (court_max_height / court_max_width)]);

var width_scale = d3.scaleLinear()
                  .domain([-1 * court_max_width/2, court_max_width/2])
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
  
svg.append('g')
  .attr('class', 'grid')
  .call(
      d3.axisLeft(height_scale).tickSize(-width).ticks(10)
  )
  .selectAll("text")
      .attr("transform", "translate(+10,-10)")      
      .style("text-anchor", "middle");

svg.append('g')
  .attr('class', 'top')
  .attr("transform", "translate(0," + (width * (court_max_height / court_max_width)) + ")")
  .call(
      d3.axisBottom(width_scale).tickSize(-width).ticks(6)
  )
  .selectAll("text")
  .attr("transform", "translate(+10,-20)");

svg.append('line')
  .attr('class', 'courtline')
  .attr('x1', width_scale(court_width / 2))
  .attr('y1', height_scale(0))
  .attr('x2', width_scale(court_width / 2))
  .attr('y2', height_scale(court_height));

svg.append('line')
  .attr('class', 'courtline')
  .attr('x1', width_scale(-1 * court_width / 2))
  .attr('y1', height_scale(0))
  .attr('x2', width_scale(-1 * court_width / 2))
  .attr('y2', height_scale(court_height));

svg.append('line')
  .attr('class', 'courtline')
  .attr('x1', width_scale(-1 * court_width / 2 - 1/14))
  .attr('y1', height_scale(0))
  .attr('x2', width_scale(court_width / 2 + 1/14))
  .attr('y2', height_scale(0));

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
    d3.json("/js/return-impact-h2h/data/player_r1_ad_s2_clay.json"),
    d3.json("/js/return-impact-h2h/data/player_r2_ad_s2_clay.json"),    
    d3.json("/js/return-impact-h2h/data/players.json"),
]).then(function(files) {
    drawgraph(files[0], files[1], files[2])
}).catch(function(err) {
    // handle error here
})

function drawgraph(data1, data2, players) {

    var player_names = d3.map(players, function(d){return d.player;}).keys(); // Order of list

    // Default selections
    var update_defaults = ["R. NADAL", "", "Ad", "First", "Hard"];

    initialize(data1, color1);

    var player_input = d3.select("#players_list");

      player_input
        .on("change", function(){
          var selection = d3.select(this).property("value");   
          update_defaults[0] = selection;
           if(selection === ""){
                  player_noupdate();
           }                 
          else{ 
          var file = filestr(remove(update_defaults, 1), players);          
          d3.json(file, d3.autoType).then(function(d) {return player_update(d, color1)})
        }
       });

   // Datalist     
    var player_list = d3.select("#players")
                    .insert("select", "svg");

    
    player_list.selectAll("option")
                  .data(player_names)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });


    var opponent_input = d3.select("#opponents_list");

      opponent_input
        .on("input", function(){
          var selection = d3.select(this).property("value");          
          update_defaults[1] = selection;
           if(selection === ""){
                  opponent_noupdate();
           }
          else{
          var file = filestr(remove(update_defaults, 0), players);
        d3.json(file, d3.autoType).then(function(d) {return opponent_update(d, color2)})
        }
       });

   // Datalist     
    var opponent_list = d3.select("#opponents")
                    .insert("select", "svg");

    opponent_list.selectAll("option")
                  .data(player_names)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });

    var side_input = d3.select("#sides");

    side_input                   
              .on("change", function(){
              var selection = d3.select(this).select("input:checked").property("value");
              update_defaults[2] = selection;
            if(update_defaults[0] != ""){
              var file = filestr(remove(update_defaults, 1), players);
              d3.json(file, d3.autoType).then(function(d) {return player_update(d, color1)})
            }

            if(update_defaults[1] != ""){
              var file = filestr(remove(update_defaults, 0), players);
              d3.json(file, d3.autoType).then(function(d) {return opponent_update(d, color2)})
            }            
       });


    var surface_list = d3.select("#surfaces")
                    .insert("select", "svg");
    
    surface_list.selectAll("option")
                  .data(surface_options)
                  .enter().append("option")                  
                    .attr("value", function (d) { return d; })
                    .text(function (d) {return d; });

    var serve_list = d3.select("#serves");

    serve_list                   
              .on("change", function(){
                var selection = d3.select(this).select("input:checked").property("value");
                update_defaults[3] = selection;
               if(update_defaults[0] != ""){
                var file = filestr(remove(update_defaults, 1), players);
                d3.json(file, d3.autoType).then(function(d) {return player_update(d, color1)})
              }

              if(update_defaults[1] != ""){
                var file = filestr(remove(update_defaults, 0), players);
                d3.json(file, d3.autoType).then(function(d) {return opponent_update(d, color2)})
              }
          });

  
  var surface_input = d3.select("#surface_list");

  surface_input
        .on("change", function(){
                var selection = d3.select(this).property("value");
                update_defaults[4] = selection;
               if(update_defaults[0] != ""){
                var file = filestr(remove(update_defaults, 1), players);
                d3.json(file, d3.autoType).then(function(d) {return player_update(d, color1)})
              }

              if(update_defaults[1] != ""){
                var file = filestr(remove(update_defaults, 0), players);
                d3.json(file, d3.autoType).then(function(d) {return opponent_update(d, color2)})
              }            
          });                 

}
         
function initialize(plotdata, color) {

  var densityData = d3.contourDensity()
   .x(function(d) { return width_scale(d.Y); })   // x and y = column name in .json input data
   .y(function(d) { return height_scale(d.X); })
   .size([width, height])
   .bandwidth(nbands)    // smaller = more precision in lines = more lines
   (plotdata)
  
 courtmap
    .append("g")    
    .attr("class", "player-path")
    .selectAll("path");

 courtmap
    .append("g")    
    .attr("class", "opponent-path")
    .selectAll("path");
}    

function player_update(plotdata, color) {

  var densityData = d3.contourDensity()
   .x(function(d) { return width_scale(d.Y); })   // x and y = column name in .json input data
   .y(function(d) { return height_scale(d.X); })
   .size([width, height])
   .bandwidth(nbands)    // smaller = more precision in lines = more lines
   (plotdata)
  
 var contours = courtmap 
    .select("g.player-path")
    .selectAll("path")
    .data(densityData);


  contours
      .enter()
      .append("path") 
      .merge(contours)   
      .transition()
      .duration(500)                      
      .attr("d", d3.geoPath())  
      .delay(function(d, i) {return(i * 20);})  
      .attr("fill", color)     
      .attr("fill-opacity", 0.1)
      .attr("stroke", color) 
      .attr("stoke-opacity", 0.5)
      .attr("stroke-width", 2);

  contours.exit().remove();
}    

function opponent_update(plotdata, color) {

  
  var densityData = d3.contourDensity()
   .x(function(d) { return width_scale(d.Y); })   // x and y = column name in .json input data
   .y(function(d) { return height_scale(d.X); })
   .size([width, height])
   .bandwidth(nbands)    // smaller = more precision in lines = more lines
   (plotdata)
  
 var contours = courtmap 
    .select("g.opponent-path")
    .selectAll("path")
    .data(densityData);

  contours
      .enter()
      .append("path") 
      .merge(contours)
      .transition()          
      .duration(500)                      
      .attr("d", d3.geoPath())  
      .delay(function(d, i) {return(i * 20);})          
      .attr("fill", color)
      .attr("fill-opacity", 0.1)
      .attr("stroke", color)
      .attr("stoke-opacity", 0.5)
      .attr("stroke-width", 2);

  contours.exit().remove();
}   
   
function player_noupdate() {
   
 var contours = courtmap 
    .select("g.player-path")
    .selectAll("path")
    .data([]);

  contours
      .enter()
      .append("path") 
      .merge(contours)
      .transition()          
      .duration(100);

  contours.exit().remove();
}   
   

function opponent_noupdate() {
   
 var contours = courtmap 
    .select("g.opponent-path")
    .selectAll("path")
    .data([]);

  contours
      .enter()
      .append("path") 
      .merge(contours)
      .transition()          
      .duration(100);

  contours.exit().remove();
}   
   
