class MapVis {
    constructor() {
        this.projection =  d3.geoAlbersUsa().scale(1280).translate([480, 300]);
        this.parseDate = d3.utcParse("%Y-%m-%d");
        this.path = path = d3.geoPath();
        this.svg = d3.select("#map").append("svg")
                    .attr("width", 975)
                    .attr("height", 610)
                    .attr("viewBox", [0, 0, 975, 610])
                    .attr("style", "max-width: 100%; height: auto;");
    }

    drawMap(usData) {
        this.svg.append("path")
            .datum(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .attr("d", path);
    }
}