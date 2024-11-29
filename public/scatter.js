export class ScatterPlot {
    constructor(initData, divID) {
        this.initData = initData;
        this.width = 928;
        this.height = 600;
        this.marginRight = 20;
        this.marginTop = 25;
        this.marginBottom = 35;
        this.marginLeft = 40;
        this.circleRadius = 6;
        this.formatTime = d3.utcFormat("%B %d, %Y");

        this.precipRange = d3.extent(this.initData, d => d.precipitation)
        this.x = d3.scaleLinear()
            .domain([this.precipRange[0], 20]).nice()
            .range([this.marginLeft, this.width - this.marginRight]);
        this.y = d3.scaleLinear()
            .domain(d3.extent(this.initData, d => d.temperature)).nice()
            .range([this.height - this.marginBottom, this.marginTop]);
        this.svg = d3.select(divID).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("style", "max-width: 100%; height: auto;");
        
        this.linePath = this.svg.append("path")
            .attr('stroke', '#f7a444')
            .attr('fill', 'none')
            .attr('stroke-width', 4)
            .attr("stroke-dasharray", "3,5");
        
        this.drawAxesAndInitData();
    }

    drawAxesAndInitData() {
        const filteredData = this.initData.filter((d) => d.month == "January" && d.year === 2000);
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.marginBottom})`)
            .call(d3.axisBottom(this.x).ticks(this.width / 80))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", this.width)
                .attr("y", this.marginBottom - 4)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text("Precipitation (inches) →"));

        this.svg.append("g")
            .attr("transform", `translate(${this.marginLeft},0)`)
            .call(d3.axisLeft(this.y))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", - this.marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Temperature"));

        this.svg.append("g")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .call(g => g.append("g")
                .selectAll("line")
                .data(this.x.ticks())
                .join("line")
                .attr("x1", d => 0.5 + this.x(d))
                .attr("x2", d => 0.5 + this.x(d))
                .attr("y1", this.marginTop)
                .attr("y2", this.height - this.marginBottom))
            .call(g => g.append("g")
                .selectAll("line")
                .data(this.y.ticks())
                .join("line")
                    .attr("y1", d => 0.5 + this.y(d))
                    .attr("y2", d => 0.5 + this.y(d))
                    .attr("x1", this.marginLeft)
                    .attr("x2", this.width - this.marginRight));

        this.svg.append("g")
            .attr("stroke", "none")
            .attr("fill", "steelblue")
        .selectAll("circle")
        .data(filteredData)
        .join("circle")
            .attr("cx", d => this.x(d.precipitation))
            .attr("cy", d => this.y(d.temperature))
            .attr("r", this.circleRadius)
            .attr("opacity", 0.35);

        this.drawRegressionLine(filteredData);
    }

    drawRegressionLine(inputData) {
        const line = d3.line().x(d => this.x(d.x)).y(d => this.y(d.y));
        const precipRange = d3.extent(inputData, (d) => d.precipitation);
        const linearRegression = ss.linearRegression(inputData.map(d => [d.precipitation, d.temperature]));
        const linearRegressionLine = ss.linearRegressionLine(linearRegression);
        const regressionPoints = [
            {x: precipRange[0], y: linearRegressionLine(precipRange[0])},
            {x: 20, y: linearRegressionLine(precipRange[1] <= 20 ? precipRange[1] : 20)},
        ];
        console.log(regressionPoints);

        const corr = ss.sampleCorrelation(Array.from(inputData.map(d => d.precipitation)),
                                          Array.from(inputData.map(d => d.temperature))).toFixed(2);
        d3.select("#correlation")
            .style("position", "relative")
            .text(`Correlation: ${corr}`);
        
        this.linePath
            .datum(regressionPoints)
            .transition()
            .duration(1000)
            .attr('d', line);
    }

    highlightDot(countyCode) {
        this.svg.selectAll("circle")
            .filter(d => d.county_code === countyCode)
            .transition()
            .duration(200)
            .attr("r", 40)
            .attr("fill", "red");
    }

    resetDotHighlight() {
        this.svg.selectAll("circle")
            .transition()
            .duration(200)
            .attr("r", this.circleRadius)
            .attr("fill", "steelblue");
    }

    updateScatter(filterDate) {
        const year = filterDate.getFullYear();
        const month = this.formatTime(filterDate).split(" ")[0];
        console.log(year);
        console.log(month);
        console.log("Calling updateScatter!");

        const inputData = this.initData.filter((d) => d.year === year && d.month === month);
        console.log(inputData);
        this.svg.selectAll("circle")
            .data(inputData)
            .transition()
                .duration(1000)
            .attr("cx", d => this.x(d.precipitation))
            .attr("cy", d => this.y(d.temperature))

        this.drawRegressionLine(inputData);
    }
};