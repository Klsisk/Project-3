var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var chart = d3.select("#scatter")
    .append('div')
    .classed('chart', true);

var svg = chart.append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "points_per_game";

// Function used for updating x-scale var upon click on axis label
function xScale(NBAData, chosenXAxis) {

    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(NBAData, d => d[chosenXAxis]) * 0.8,
        d3.max(NBAData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);

    return xLinearScale;

}

// Function used for updating y-scale var upon click on axis label
function yScale(NBAData, chosenYAxis) {

    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(NBAData, d => d[chosenYAxis]) * 0.8,
        d3.max(NBAData, d => d[chosenYAxis]) * 1.2
        ])
        .range([height, 0]);

    return yLinearScale;

}

// Function used for updating xAxis var upon click on  x-axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// Function used for updating yAxis var upon click on y-axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// Function used for updating circles group with a transition to new circles
function renderText(circleText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circleText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]))
        .attr("text-anchor", "middle");

    return circleText;
}

// // Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText) {
    var xLabel;

    if (chosenXAxis === "age") {
        xLabel = "Age:";
    }
    else {
        xLabel = "Games Started:";
    }

    var yLabel;

    if (chosenYAxis === "points_per_game") {
        yLabel = "Points per Game:";
    }
    else {
        yLabel = "Minutes Played:";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([80, 80])
        .html(function (d) {
            return (`${d.player}<br>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d['points_per_game']}`);
        });

    // Circles tooltip in chart
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (stats) {
        toolTip.show(stats, this);
    })
        // .on(mouseout) event
        .on("mouseout", function (stats, index) {
            toolTip.hide(stats);
        });

    // Text tooltip in chart
    circleText.call(toolTip);

    circleText.on("mouseover", function (stats) {
        toolTip.show(stats, this);
    })
        // .on(mouseout) event
        .on("mouseout", function (stats, index) {
            toolTip.hide(stats);
        });

    return circlesGroup;
}

// Text tooltip in chart
// Retrieve data from the CSV file and execute everything below
//d3.csv("assets/data/stats.csv").then(function (NBAData, err) {
d3.json("http://127.0.0.1:5000/api/v1.0/bangforbuck").then(function (NBAData, err) {
    if (err) throw err;

    // console.log(NBAData.map(x => x['points_per_game']));
    // parse data
    NBAData.forEach(function (stats) {
        stats.salary= +stats.salary;
        stats.points_per_game = stats.points_per_game;
        stats.bangforbuck = +stats.bangforbuck;
    });

    // Create xLinearScale and yLinearScale function
    var xLinearScale = xScale(NBAData, chosenXAxis);
    var yLinearScale = yScale(NBAData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append the x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append the y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // Create and then append initial circles
    var circlesGroup = chartGroup.selectAll(".playerCircle")
        .data(NBAData)
        .enter()
        .append("circle")
        .attr("class", "playerCircle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", ".75");

    // Create a group for the text in circles
    var circleText = chartGroup.selectAll(".playerText")
        .data(NBAData)
        .enter()
        .append("text")
        .attr("class", "playerText")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis] * .98))
        .attr("font-size", "12px")
        .attr("dy", ".3em")
        .style("font-weight", "bold")
        .text(function (d) { return d.abbr });

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var salaryLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "salary") // value to grab for event listener
        .classed("active", true)
        .text("Salary");

    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var pointsPerGameLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 250)
        .attr("y", -465)
        .attr("dy", "1em")
        .attr("value", "points_per_game") // value to grab for event listener
        .classed("axis-text", true)
        .classed("active", true)
        .text("Points per Game");

    var bangForBuckLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 250)
        .attr("y", -485)
        .attr("dy", "1em")
        .attr("value", "bangforbuck") // value to grab for event listener
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Money Spent For Each Point Scored");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText);

    // X axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {

            // Get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // Replace chosenXAxis with value
                chosenXAxis = value;

                // Updates x scale for new data
                xLinearScale = xScale(NBAData, chosenXAxis);

                // Update x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Update circles with new values
                // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update text with new values
                circleText = renderText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circleText);

                // Changes classes to change bold text for x axis
                if (chosenXAxis === "salary") {
                    salaryLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                else {
                    salaryLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });

    // Y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {

            // Get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // Replace chosenYAxis with value
                chosenYAxis = value;

                // Updates y scale for new data
                yLinearScale = yScale(NBAData, chosenYAxis);

                // Update y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update text with new values
                circleText = renderText(circleText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update tooltips with new info
                // circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis, circleText);

                // Changes classes to change bold text for y axis
                if (chosenYAxis === "points_per_game") {
                    pointsPerGameLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    bangForBuckLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    pointsPerGameLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    bangForBuckLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
}).catch(function (error) {
    console.log(error);
});
