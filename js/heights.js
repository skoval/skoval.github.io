
function drawgraph(data) {

// set the dimensions and margins of the graph
var margin = {top: 50, right: 30, bottom: 10, left: 50},
    width = 480 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#height_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Initialize the X axis
var x = d3.scaleLinear()
	.domain(d3.extent(data, d => d.weight_kgs)).nice()
  .range([ 0, width ]);

var xAxis = svg.append("g")
  .attr("transform", "translate(0," + (height - margin.bottom) + ")")

// Initialize the Y axis
var y = d3.scaleLinear()
	.domain(d3.extent(data, d => d.height_cms)).nice()
  .range([height - margin.bottom, 0]);

var yAxis = svg.append("g")
  .attr("class", "myYaxis")

// Add titles for the axes
svg.append("text")
  .attr("transform", "translate(" + (width/2 + margin.left/3) + "," + (height + margin.bottom/2) + ")")
  .attr("class", "axis-title")
  .text("Weight (kg)");  

svg.append("text")
  .attr("transform", "translate(-10, -15)")
  .attr("class", "axis-title")
  .text("Height (cm)");

  xAxis.call(d3.axisBottom(x).tickSizeOuter(0));

  yAxis.call(d3.axisLeft(y).tickSizeOuter(0));

  // Create the u variable
  var u = svg.selectAll("circle")
    .data(data)  

  u
    .enter()
    .append("circle") 
    .merge(u) 
      .attr("cx", function(d) { return x(d.weight_kgs); })
      .attr("cy", function(d) { return y(d.height_cms); })
      .attr("r", 6)
      .attr("opacity", 0.5)
      .attr("fill", function(d){
        if(d.group == "Current")
          return "#00AEEF"
        else if(d.group == "2000")
          return "#3bbb75"
        else
            return "red"
      });

    svg.append("ellipse").attr("cx",width/4).attr("cy",-30).attr("rx", 6).attr("ry", 6).style("fill", "#00AEEF");
    svg.append("ellipse").attr("cx",width * 2/3).attr("cy",-30).attr("rx", 6).attr("ry", 6).style("fill", "#3bbb75");
    svg.append("text").attr("x", width/4 + 10).attr("y", -30).text("Top 100 Current").style("font-size", "12px").attr("alignment-baseline","middle");
    svg.append("text").attr("x", width * 2/3 + 10).attr("y", -30).text("Top 100 2000").style("font-size", "12px").attr("alignment-baseline","middle");


    var tooltip = d3.select("#height_viz")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .append("p")
      .append("strong")
      .append("span")
      .attr("id", "player");

    d3.select("#tooltip")   
      .append("p") 
      .append("span")
      .attr("id", "label");

    d3.selectAll("circle")
      .on("mouseover", function(d){

        d3.select(this)          
          .attr("r", 10);

        d3.select("#tooltip")
          .style("top", + event.pageY -10 + "px")
          .style("left", + event.pageX + 10 + "px")              
          .style("visibility", "visible");

        d3.select("#player")
        .text(d.player)
        .style("visibility", "visible");

        d3.select("#label")
        .text(d.label)
        .style("visibility", "visible");
      })
      .on("mouseout", function(){

        d3.select(this)
          .transition()
          .duration(50)          
          .attr("r", 6);

        d3.select("#tooltip")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#label")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#player")
          .transition()
          .duration(50)
          .style("visibility", "hidden");
      });

  u
};

d3.json("/js/atp_heights.json", drawgraph);
