
<style>
svg {
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
  font-size: 12px;
}

path.line {
  fill: none;
  stroke: #666;
  stroke-width: 1.5px;
}

path.area {
  fill: #e7e7e7;
}

.axis {
  shape-rendering: crispEdges;
}

.x.axis line {
  stroke: #000;
}

.x.axis .minor {
  stroke-opacity: .5;
}

.x.axis line, 
.x.axis path {
  fill: none;
  stroke: #000;
}

.y.axis line,
.y.axis path {
  fill: none;
  stroke: #000;
}

.legend rect{
  fill:white;
  stroke: black;
}


.grid line{
  stroke-width: 3;
  stroke-opacity: 0.2;
  stroke: black;
}

#tooltip {
    position: absolute;
    width: 200px;
    height: auto;
    padding: 10px;
    background-color: white;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    box-shadow: 4px 4px 10px rgba(0, 100, 100, 0.4);
    pointer-events: none;
   }
   
#tooltip.hidden {
    display: none;
   }
   
#tooltip p {
    margin: 0;
    font-family: sans-serif;
    font-size: 16px;
    line-height: 20px;
 }
</style>
  <script src="http://d3js.org/d3.v3.min.js"></script>
  <script src="http://dimplejs.org/dist/dimple.v2.0.0.min.js"></script>
    <script type="text/javascript">
      function draw(data) {
      
      /*
        D3.js setup code
      */

          "use strict";
          var margin = 75,
              width = 1400 - margin,
              height = 600 - margin;

          var radius = 5;

          var colors = ["#52b6ae"];

          var title = d3.select("body")
            .append("h2")
            .style("font-family", '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif')
            .style("text-align", "left")            
            .style("margin-left", "5%")
            .style("margin-bottom", "-1%")
            .text("Age Trends of Men Reaching Grand Slam Finals");

          var svg = d3.select("body")
            .append("svg")
              .attr("width", width + margin)
              .attr("height", height + margin)
            .append('g')
                .attr('class','chart');

          d3.select("svg")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle");
        

          var time_extent = d3.extent(data, function(d){
            return d['DATE'];
          });

          var count_extent = d3.extent(data, function(d){
            return d['Age'];
          });          

          var time_scale = d3.time.scale()
            .range([margin + 25, width])
            .domain(time_extent);

          var count_scale = d3.scale.linear()
            .range([height, margin])
            .domain([0, d3.max(count_extent)]);   


          var time_axis = d3.svg.axis()
            .scale(time_scale)
            .outerTickSize(0)
            .ticks(d3.time.years, 1);

          var count_axis = d3.svg.axis()
            .scale(count_scale)
            .outerTickSize(0)
            .tickValues(d3.range(16, 40, 2))
            .orient("left");

          
                //Line chart mouse over 
          var hoverLineGroup = svg.append("g")
                                    .attr("class", "hover-line");

          var hoverLine = hoverLineGroup
                    .append("line")
                        .attr("stroke", "orange");
    

          d3.select("svg")
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(time_axis);

          d3.select("svg")
            .append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin + ",0)")  
            .call(count_axis);                        

          d3.selectAll("circle")
            .attr("cx", function(d){
              return time_scale(d['DATE']);
            })
            .attr("cy", function(d){
              return count_scale(d['Age']);
            })
            .attr("r", radius)
            .attr("fill", colors[0])
            .attr("fill-opacity", 0.8)
            .on("mouseover", function(d){
              d3.selectAll("circle")
               .filter(function(z) {return z.Player === d.Player;})
               .attr("fill", "orange")
               .attr("r", radius * 2);

               var x = parseFloat(d3.select(this).attr("cx"));
               var y = parseFloat(d3.select(this).attr("cy"));

              hoverLine
              .attr("x1", x)
              .attr("x2", x)
              .attr("y1", height)
              .attr("y2", y)
              .attr("stroke-width", 2);

               d3.select("#tooltip")
                .style("left", x + "px")
                .style("top", y + "py")
                .select("#player")
                .text(d.Player);

               d3.select("#tooltip")
                .select("#age")
                .text(Math.floor(d.Age));

               d3.select("#tooltip")
                .select("#event")
                .text(d.Event + ' ' + d.DATE.getUTCFullYear());   

               d3.select("#tooltip")
                .select("#result")
                .text(d.Winner);                              

               d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function(d){
              d3.selectAll("circle")
               .transition()
               .duration(100)
               .attr("fill",  colors[0])
               .attr("r", radius);

              d3.select("#tooltip").classed("hidden", true);

              hoverLine
               .transition()
               .duration(100)
               .attr("stroke-width", 0);
            });

          var grid = svg.append("g")
            .attr("class", "grid")
            .selectAll("g")
            .data([18, 30])
            .enter()
            .append("g")    

            grid.append("line")
            .attr("y1", function(d){
              return count_scale(d);
            })
            .attr("y2", function(d){
              return count_scale(d);
            })
            .attr("x1", margin)
            .attr("x2", width);
          };
      </script>
  </head>
<body>
   <div id="tooltip" class="hidden">    
    <p><strong><span id="player"></span></strong></p>
    <p>Age: <span id="age"></span></p>
    <p><span id="event"></span></p> 
    <p><span id="result"></span></p>          
  </div>
  <script type="text/javascript">

  format = d3.time.format("%Y-%m-%d");

  d3.tsv("data/slam_ages_result.tsv", function(d){
    d['DATE'] = format.parse(d['DATE']);
    d['Age'] = +d['Age'];
  return d;
  }, draw);

  </script>