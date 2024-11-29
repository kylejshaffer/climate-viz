export class Map {
    constructor(us, initData, divID, scatterplot) {
        this.initData = initData;
        this.path = d3.geoPath();
        this.formatTime = d3.utcFormat("%B %d, %Y");
        this.svg = d3.select(divID).append("svg")
            .attr("width", 975)
            .attr("height", 610)
            .attr("viewBox", [0, 0, 975, 610])
            .attr("style", "max-width: 100%; height: auto;");

        const temps = Array.from(this.initData.map(d => d.temperature));
        const meanTemp = this.getMeanTemp(temps);
        const extent = d3.extent(this.initData, d => d.temperature);
        this.color = d3.scaleDiverging(d3.interpolateRdBu)
            .domain([extent[1], meanTemp, extent[0]])

        const mapTooltip = d3.select(divID)
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 1);

        this.svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", this.path);

        this.countyMesh = this.svg.append("g")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .join("path")
                .attr("fill", "#d3d3d3")
                .attr("d", this.path)
            .on("mouseover", (e, d) => mapTooltip.style("opacity", 1))
            .on("mousemove", (e, d) => {
                mapTooltip
                    .html("County Code: " + d.county_code + "<br>" + "Temperature: " + d.temperature + "<br>" + "Precip: " + d.precipitation)
                    .style('left', e.x + "px")
                    .style('top', e.y + "px")
                
                scatterplot.highlightDot(d.county_code);
            })
            .on("mouseleave", (e, d) => {
                mapTooltip.style("opacity", 0)
                scatterplot.resetDotHighlight();
            });
    };

    updateMap(filterDate) {
        const year = filterDate.getFullYear();
        const month = this.formatTime(filterDate).split(" ")[0];
        const filteredData = this.initData.filter((d) => d.month === month && d.year === year);
        this.countyMesh.data(filteredData)
            .transition()
            .duration(1000)
            .attr("fill", d => this.color(d.temperature));
    };

    getMeanTemp = (tempArray) => {
        let total = 0;
        for (let i=0; i < tempArray.length; i++) {
            total = total + tempArray[i];
        }

        return total / tempArray.length;
    }
};
    
