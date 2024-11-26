// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as d3 from "https://unpkg.com/d3@7";

class ScatterPlot {
    constructor(initData, divID) {
        this.initData = initData;
        this.width = 928;
        this.height = 600;
        this.marginRight = 20;
        this.marginTop = 25;
        this.marginBottom = 35;
        this.marginLeft = 40;
        this.x = d3.scaleLinear()
            .domain(d3.extent(this.initData, d => d.precipitation)).nice()
            .range([this.marginLeft, this.width - this.marginRight]);
        this.y = d3.scaleLinear()
            .domain(d3.extent(this.initData, d => d.temperature)).nice()
            .range([this.height - this.marginBottom, this.marginTop]);
        this.svg = d3.select(divID).append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
        // this.drawAxesAndGrid();
    }

    drawAxesAndGrid() {
        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.marginBottom})`)
            .call(d3.axisBottom(x).ticks(width / 80))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", this.width)
                .attr("y", this.marginBottom - 4)
                .attr("fill", "currentColor")
                .attr("text-anchor", "end")
                .text("Precipitation (inches) →"));

        this.svg.append("g")
            .attr("transform", `translate(${this.marginLeft},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.append("text")
                .attr("x", -this.marginLeft)
                .attr("y", 10)
                .attr("fill", "currentColor")
                .attr("text-anchor", "start")
                .text("↑ Temperature"));

        this.svg.append("g")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.1)
            .call(g => g.append("g")
                .selectAll("line")
                .data(x.ticks())
                .join("line")
                .attr("x1", d => 0.5 + x(d))
                .attr("x2", d => 0.5 + x(d))
                .attr("y1", this.marginTop)
                .attr("y2", this.height - this.marginBottom))
            .call(g => g.append("g")
                .selectAll("line")
                .data(y.ticks())
                .join("line")
                    .attr("y1", d => 0.5 + y(d))
                    .attr("y2", d => 0.5 + y(d))
                    .attr("x1", this.marginLeft)
                    .attr("x2", this.width - this.marginRight));
    }

    drawDots(inputData) {
        this.svg.append("g")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
        .selectAll("circle")
        .data(inputData)
        .join("circle")
            .attr("cx", d => x(d.precipitation))
            .attr("cy", d => y(d.temperature))
            .attr("r", 3);
    }
};

export default ScatterPlot;