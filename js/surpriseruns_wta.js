function drawgraph(data) {
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 40, left: 120},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz_wta")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y-%m-%d");

  // Add X axis
  var x = d3.scaleTime()
    .range([ 0, width])
    .domain([parseTime("1992-01-01"), parseTime("2020-01-01")]);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")).tickSizeOuter(0))
    .selectAll("text")
      .attr("transform", "translate(10,0)")
      .style("text-anchor", "end");
// Y axis
var y = d3.scaleLinear()
  .range([ height, 0 ])
  .domain([100, 300]);

svg.append("g")
  .call(d3.axisLeft(y).tickSizeOuter(0))

var tooltip = d3.select("#my_dataviz")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("max-width", "100px")
    .style("background-color", "#f0eff2")
    .style("position", "absolute")
    .style("padding", "1%")
    .style("border-radius", "1px")
    .style("visibility", "hidden");

    d3.select("#tooltip")
    .append("span")
    .attr("class", "tooltiptext")
    .attr("id", "player")
    .style("text-align", "center")
    .style("font-size", "12px")
    .style("font-family", "Roboto,sans-serif")
    .style("position", "relative")
    .style("visibility", "hidden");


// Circles
svg.selectAll("mycircle")
  .data(data)
  .enter()
  .append("circle")  
    .attr("cx", function(d) { return x(parseTime(d.date)); })
    .attr("cy", function(d) { return y(d.gain); })    
    .transition()
    .delay(function(d, i){return i * 100;})
    .duration(2000)            
    .attr("r", "6")     
    .style("opacity", 0.9)
    .style("fill", function(d){
    	if(d.event == "Australian Open")
    		return("#fde233")
    	else if(d.event == "French Open")
    		return("#ff7d78")
    	else if(d.event == "Wimbledon")
    		return("#4e8f00")
    	else
    		return("#0096ff")
    });

 	
 	d3.selectAll("circle")
      .on("mouseover", function(d){

        var current_event = d.event;
        var current_player = d.player;


        d3.select("#tooltip")
          .style("top", + event.pageY - 5 + "px")
          .style("left", + event.pageX - 50 + "px")              
          .style("visibility", "visible");

        d3.select("#player")
        .text(d.player + ": " + d.year + " " + d.result)      
        .style("visibility", "visible");

      d3.selectAll("circle")  
          .attr("r", function(d){
            if(d.event == current_event)
              return("10")
            else
              return("3")
          })
        .style("fill", function(d){
          if(d.event == "Australian Open" & d.event == current_event)
            return("#fde233")
          else if(d.event == "French Open" & d.event == current_event)
            return("#ff7d78")
          else if(d.event == "Wimbledon" & d.event == current_event)
            return("#4e8f00")
          else if(d.event == "U.S. Open" & d.event == current_event)
            return("#0096ff")
          else
            return("#e1e0e2")
          });                

      })
      .on("mouseout", function(){

        d3.selectAll("circle")  
          .transition()
          .duration(200)
          .attr("r", "6")
          .style("fill", function(d){
          if(d.event == "Australian Open")
            return("#fde233")
          else if(d.event == "French Open")
            return("#ff7d78")
          else if(d.event == "Wimbledon")
            return("#4e8f00")
          else
            return("#0096ff")
        });

        d3.select("#tooltip")
          .transition()
          .duration(200)            
          .style("visibility", "hidden");

        d3.select("#player")
          .transition()
          .duration(200)            
          .style("visibility", "hidden");       

      });  	 
}
;

d3.json("/js/surpriseruns_wta.json", drawgraph);