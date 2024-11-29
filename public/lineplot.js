export class LinePlot {
    constructor(inputData, divID, scatterplot, map) {
        this.width = 928;
        this.height = 100;
        this.marginTop = 20;
        this.marginRight = 30;
        this.marginBottom = 30;
        this.marginLeft = 40;
        // this.scatterplot = scatterplot;
        // this.map = map;

        const tooltip = d3.select("#timeline")
                    .append("div")
                    .attr("class", "tooltip");

        const initData = this.rollupTimeData(inputData);
        const svg = d3.select(divID)
            .append("svg")
                .attr("width", this.width + this.marginLeft + this.marginRight)
                .attr("height", this.height + this.marginTop + this.marginBottom)
            .append("g")
                .attr("transform", `translate(${this.marginLeft},${this.marginTop})`)
    
        const x = d3.scaleTime()
            .domain(d3.extent(initData, function(d) { return d.date; }))
            .range([ 0, this.width ]);

        svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .domain([0, d3.max(initData, function(d) { return d.temperature; })])
            .range([ this.height, 0 ]);
        
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("path")
            .datum(initData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.temperature) }));

        // Add a circle element
        const circle = svg.append("circle")
            .attr("r", 0)
            .attr("fill", "steelblue")
            .style("stroke", "white")
            .attr("opacity", .70)
            .style("pointer-events", "none");

        // create a listening rectangle
        const listeningRect = svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .on("mousemove", function (event) {
                const [xCoord] = d3.pointer(event, this);
                const bisectDate = d3.bisector(d => d.date).left;
                const x0 = x.invert(xCoord);
                const i = bisectDate(initData, x0, 1);
                const d0 = initData[i - 1];
                const d1 = initData[i];
                const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                const xPos = x(d.date);
                const yPos = y(d.temperature);
                // Update the circle position
                circle.attr("cx", xPos)
                    .attr("cy", yPos)
                    .attr("fill", "steelblue");

                // Add transition for the circle radius
                circle.transition()
                    .duration(50)
                    .attr("r", 5);

                tooltip
                    .style("display", "block")
                    .style("left", event.x + "px")
                    .style("top", event.y - 100 + "px")
                    .html(`<strong>Date:</strong> ${d.date.toLocaleDateString()}<br><strong>Temperature:</strong> ${d.temperature !== undefined ? (d.temperature).toFixed(2) + "\u00b0 F" : 'N/A'}`)
            })
            .on("mouseleave", function () {
                circle.transition()
                  .duration(50)
                  .attr("r", 0);
            
                tooltip.style("display", "none");
            })
            .on("click", function(event) {
                circle.transition()
                    .duration(500)
                    .attr("r", 15)
                    .attr("fill", "red");

                const [xCoord] = d3.pointer(event, this);
                const bisectDate = d3.bisector(d => d.date).left;
                const x0 = x.invert(xCoord);
                const i = bisectDate(initData, x0, 1);
                const d0 = initData[i - 1];

                scatterplot.updateScatter(d0.date);
                map.updateMap(d0.date);
            });
    };

    rollupTimeData(inputData) {
        const dataMap = d3.rollup(inputData, (v) => d3.mean(v, (d) => d.temperature),
                                            (d) => d.date);
        const dataArray = [];
        for (const [key, val] of dataMap.entries()) {
            dataArray.push({"date": key, "temperature": val});
        }

        return dataArray;
    };

    setupToltip() {
    };
};