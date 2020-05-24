function drawgraph(data){
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 50, left: 70},
    width = 460 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

 var y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(["ATP", "WTA"])
    .padding(.4);

  svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  // Show the X scale
  var x = d3.scaleLinear()
    .domain([0, 190])
    .range([0, width])

  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(12))


  // Add X axis label:
  svg.append("text")
      .attr("class", "axis")
      .attr("text-anchor", "right")
      .attr("x", width * 2/5)
      .attr("y", height + margin.top + 30)
      .text("Total Games");

  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.tour;})
    .rollup(function(d) {
      q1 = d3.quantile(d.map(function(g) { return g.games;}).sort(d3.ascending),.25)
      median = d3.quantile(d.map(function(g) { return g.games;}).sort(d3.ascending),.5)
      q3 = d3.quantile(d.map(function(g) { return g.games;}).sort(d3.ascending),.75)
      interQuantileRange = q3 - q1
      cutoff = d3.quantile(d.map(function(g) { return g.games;}).sort(d3.ascending),.99)
      min = q1 - 1.5 * interQuantileRange
      max = q3 + 1.5 * interQuantileRange
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max, cutoff: cutoff})
    })
    .entries(data)


svg
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
        .attr("x", function(d){return(x(d.value.q1))}) // console.log(x(d.value.q1)) ;
        .attr("width", function(d){ ; return(x(d.value.q3)-x(d.value.q1))}) //console.log(x(d.value.q3)-x(d.value.q1))
        .attr("y", function(d) { return y(d.key); })
        .attr("height", y.bandwidth() )
        .attr("stroke", "#e7e8ea")
        .style("fill", "#f0eff2")
        .style("opacity", 0.5)

svg
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.value.min))})
      .attr("x2", function(d){return(x(d.value.max))})
      .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("stroke", "#e7e8ea")
      .style("width", 40)

  // rectangle for the main box

  // Show the median
  svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("y2", function(d){return(y(d.key))})
      .attr("x1", function(d){return(x(d.value.median))})
      .attr("x2", function(d){return(x(d.value.median))})
      .attr("stroke", "#e7e8ea")
      .style("width", 80)

  svg
    .selectAll("medianLines2")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
      .attr("y2", function(d){return(y(d.key) + y.bandwidth())})
      .attr("x1", function(d){return(x(d.value.median))})
      .attr("x2", function(d){return(x(d.value.median))})
      .attr("stroke", "#e7e8ea")
      .style("width", 80)


// create a tooltip
  var tooltip = d3.select("#my_dataviz")
    .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("font-size", "16px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {

    tooltip
      .transition()
      .duration(200)
      .style("opacity", 1)

    tooltip
        .html("<span style='color:#3bbb75;font-size:14px;'>" + d.player1 + " vs " + d.player2 + "<br>" + d.year + "<br>" + d.games + 
        " games" + "</span>")
        .style("left", (d3.mouse(this)[0]+300) + "px")
        .style("top", (d3.mouse(this)[1]+900) + "px")
  }

  var mousemove = function(d) {
    tooltip
      .style("left", (d3.mouse(this)[0]+300) + "px")
      .style("top", (d3.mouse(this)[1]+900) + "px")
  }

  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  // Add individual points with jitter
  var jitterWidth = 100

function update(group){    

  var newdata = data.filter(function(d) {return d.event == group & 
    ((d.tour == "ATP" & d.games > sumstat[0]["value"]["cutoff"]) | 
     (d.tour == "WTA" & d.games > sumstat[1]["value"]["cutoff"]));});

  // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
 
  // Color scale
  var myColor = d3.scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain([40,190])
  
  points = svg
    .selectAll("circle")
    .data(newdata)

  points
    .enter()
    .append("circle")
      .merge(points)      
      .transition()
      .duration(400)    
      .attr("cx", function(d){ return(x(d.games))})
      .attr("cy", function(d){ return( y(d.tour) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )})
      .attr("r", 4)  
      .style("fill", "#3bbb75")
      .style("opacity", 0.5);

  svg
    .selectAll("circle")
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)

  points.exit().remove();
}

d3.selectAll("#buttons").on("click", function(){
  update(this.value)
});

update("Wimbledon");
};

d3.json("/js/games.json", drawgraph);