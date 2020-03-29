function drawgraph(data) {
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 40, left: 120},
    width = 800 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  var x = d3.scaleLinear()
    .domain([1900, 1960])
    .range([ 0, width]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(d3.format(".0f")))
    .selectAll("text")
      .attr("transform", "translate(10,0)")
      .style("text-anchor", "end");

// Y axis
var y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(function(d) { return d.name; }))
  .padding(1);
svg.append("g")
  .call(d3.axisLeft(y).tickSizeOuter(0))

var tooltip = d3.select("#my_dataviz")
      .append("div")
      .attr("id", "tooltip")
      .attr("class", "tooltip")
      .append("p")
      .append("strong")
      .append("span")
      .attr("id", "age");

    d3.select("#tooltip")   
      .append("p") 
      .append("span")
      .attr("id", "slams");


// Legend
svg.append("circle").attr("cx",x(1953)).attr("cy",0).attr("r", 4).style("fill", "#fde233");
svg.append("circle").attr("cx",x(1953)).attr("cy",0+20).attr("r", 4).style("fill", "#ff7d78");
svg.append("circle").attr("cx",x(1953)).attr("cy",0+40).attr("r", 4).style("fill", "#4e8f00");
svg.append("circle").attr("cx",x(1953)).attr("cy",0+60).attr("r", 4).style("fill", "#0096ff");
svg.append("path").attr("transform", 'translate(' + x(1953.1) + "," +  100 + ')').attr('d', d3.symbol().type(d3.symbolStar).size(80)).style("fill", "black");


svg.append("text").attr("x", x(1954)).attr("y", 0).text("Australian Open").attr("font-family", "Helvetica").style("font-size", "12px").attr("alignment-baseline","middle");
svg.append("text").attr("x", x(1954)).attr("y", 0+20).text("French Open").attr("font-family", "Helvetica").style("font-size", "12px").attr("alignment-baseline","middle");
svg.append("text").attr("x", x(1954)).attr("y", 0+40).text("Wimbledon").attr("font-family", "Helvetica").style("font-size", "12px").attr("alignment-baseline","middle");
svg.append("text").attr("x", x(1954)).attr("y", 0+60).text("US Open").attr("font-family", "Helvetica").style("font-size", "12px").attr("alignment-baseline","middle");
svg.append("text").attr("x", x(1954)).attr("y", 0+100).text("Death").attr("font-family", "Helvetica").style("font-size", "12px").attr("alignment-baseline","middle");


var gTimeframe = svg.append("g").attr("class", "timeframe");

gTimeframe.append("rect")
    .attr("x", x(1915))
    .attr("y", 0)
    .attr("width", x(1920) - x(1915))
    .attr("height", height)
    .style("opacity", .5)
    .style("fill", "lightgrey");

gTimeframe.append("rect")
    .attr("x", x(1940))
    .attr("y", 0)
    .attr("width", x(1946) - x(1940))
    .attr("height", height)
    .style("opacity", .5)
    .style("fill", "lightgrey");

gTimeframe.append("text")
    .attr("x", x(1915 - 1))
    .attr("y", height - 10)
    .text("World War I")
    .attr("font-family", "Helvetica")
    .attr("font-size", "14px");      

gTimeframe.append("text")
    .attr("x", x(1940 - 1))
    .attr("y", height - 10)
    .text("World War II")
    .attr("font-family", "Helvetica")
    .attr("font-size", "14px");    

// Circles
svg.selectAll("mycircle")
  .data(data)
  .enter()
  .append("circle")
  	.transition()
  	.delay(function(d, i){return i * 50;})
  	.duration(2000)
    .attr("cx", function(d) { return x(d.y); })
    .attr("cy", function(d) { return y(d.name); })
    .attr("r", "5")
    .style("opacity", 0.8)
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


svg.selectAll("mystars")
  .data(data)
  .enter()
  .append("path")
  	.transition()
  	.delay(function(d, i){return i * 50;})
  	.duration(2000)
  	.attr("transform", function(d){
  		if(d.ydeath < 1950)
  		return 'translate(' + x(d.ydeath) + "," +  y(d.name) + ')';
  	})
    .style("opacity", 0.5)
    .style("fill", "black")  
  	.attr('d', d3.symbol()
		.type(d3.symbolStar)
		.size(function(d){
			if(d.ydeath < 1950)
				return(80);
			else
				return(0);
		})
		);

 	
 	d3.selectAll("circle")
      .on("mouseover", function(d){

      	var age = d3.format(".1f")(d.eventage);

        d3.select(this)          
          .attr("r", 8);

        d3.select("#tooltip")
          .style("top", + event.pageY - 10 + "px")
          .style("left", + event.pageX + 10 + "px")              
          .style("visibility", "visible");

        d3.select("#age")
        .text("Age" + " " + age)        
        .style("visibility", "visible");

        d3.select("#slams")
        .text(function(z){        	
        	if(typeof d.wins == 'undefined')
        		return("Career Slams 1");
        	else
        		return("Career Slams" + " " + d.wins);
        })
        .style("visibility", "visible");
      })
      .on("mouseout", function(){

        d3.select(this)
          .transition()
          .duration(50)          
          .attr("r", 5);

        d3.select("#tooltip")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#age")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#slams")
          .transition()
          .duration(50)
          .style("visibility", "hidden");
      });  	

	d3.selectAll("path")
      .on("mouseover", function(d){

      	var age = d3.format(".1f")(d.agedeath);

        d3.select(this)          
          .attr('d', d3.symbol()
			.type(d3.symbolStar)
			.size(120));

        d3.select("#tooltip")
          .style("top", + event.pageY - 10 + "px")
          .style("left", + event.pageX + 10 + "px")              
          .style("visibility", "visible");

        d3.select("#age")
        .text("Age" + " " + age)        
        .style("visibility", "visible");

        d3.select("#slams")
        .text(function(z){        	
        	if(typeof d.wins == 'undefined')
        		return("Career Slams 1");
        	else
        		return("Career Slams" + " " + d.wins);
        })
        .style("visibility", "visible");
      })
      .on("mouseout", function(){

        d3.select(this)          
          .attr('d', d3.symbol()
			.type(d3.symbolStar)
			.size(80));

        d3.select("#tooltip")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#age")
          .transition()
          .duration(50)
          .style("visibility", "hidden");

        d3.select("#slams")
          .transition()
          .duration(50)
          .style("visibility", "hidden");
      });       


};

d3.json("/js/slams_prepost_war.json", drawgraph);
