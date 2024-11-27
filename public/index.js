class ScatterPlot {
    constructor(initData, divID) {
        this.initData = initData;
        this.width = 928;
        this.height = 600;
        this.marginRight = 20;
        this.marginTop = 25;
        this.marginBottom = 35;
        this.marginLeft = 40;
        this.circleRadius = 6;

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
        const filteredData = this.initData.filter((d) => d.month == "January");
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

    updateScatter(inputData) {
        console.log("Calling updateScatter!");
        this.svg.selectAll("circle")
            .data(inputData)
            .transition()
                .duration(1000)
            .attr("cx", d => this.x(d.precipitation))
            .attr("cy", d => this.y(d.temperature))

        this.drawRegressionLine(inputData);
    }
};

class LinePlot {
    constructor(initData, divID) {
        this.initData = this.rollupTimeData(initData);
        this.width = 928;
        this.height = 250;
        this.marginTop = 20;
        this.marginRight = 30;
        this.marginBottom = 30;
        this.marginLeft = 40;

        const svg = d3.select(divID)
            .append("svg")
                .attr("width", this.width + this.marginLeft + this.marginRight)
                .attr("height", this.height + this.marginTop + this.marginBottom)
            .append("g")
                .attr("transform", `translate(${this.marginLeft},${this.marginTop})`)
    
        const x = d3.scaleTime()
            .domain(d3.extent(this.initData, function(d) { return d.date; }))
            .range([ 0, this.width ]);

        svg.append("g")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x));

        const y = d3.scaleLinear()
            .domain([0, d3.max(this.initData, function(d) { return d.temperature; })])
            .range([ this.height, 0 ]);
        
        svg.append("g")
            .call(d3.axisLeft(y));
        console.log("data call inside line chart");
        console.log(this.initData);
        svg.append("path")
            .datum(this.initData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) { return x(d.date) })
                .y(function(d) { return y(d.temperature) }));
    }

    rollupTimeData(inputData) {
        const dataMap = d3.rollup(inputData, (v) => d3.mean(v, (d) => d.temperature),
                                            (d) => d.date);
        const dataArray = [];
        for (const [key, val] of dataMap.entries()) {
            dataArray.push({"date": key, "temperature": val});
        }

        return dataArray;
    }
};

const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
const parseDate = d3.utcParse("%Y-%m-%d");

(async () => {
    async function getClimateData(dataPath) {
        const parseTime = d3.utcParse("%B %d, %Y");
        const sentData = await d3.csv(dataPath, function(d) {
            let stringDate = `${d.month} 10, ${d.year}`;
            return {
                ...d,
                year: +d.year,
                temperature: Number(d.temperature),
                precipitation: Number(d.precipitation),
                county_code: String(d.county_code),
                stringDate: stringDate,
                date: parseTime(stringDate),
            }
        });
        return sentData;
    }

    function processGeoData(geoData) {
        const newGeoData = Object.create(geoData);
        newGeoData.objects.states = {
            type: "GeometryCollection",
            geometries: newGeoData.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
        }
        return newGeoData;
    }

    async function getGeoData() {
        const geoData = fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json")
            .then(jsonData => jsonData.json())
            .then(data => processGeoData(data))

        return geoData;
    }

    const getMeanTemp = (tempArray) => {
        let total = 0;
        for (let i=0; i < tempArray.length; i++) {
            total = total + tempArray[i];
        }

        return total / tempArray.length;
    }
    
    const climateData = await getClimateData("./data/climate.csv");
    console.log(climateData);
    const us = await getGeoData();
    const countymap = new Map(climateData.map(d => [d.county_code, +d.temperature]));
    const temps = Array.from(climateData.map(d => d.temperature));
    console.log("Average temp:");
    const meanTemp = getMeanTemp(temps);
    console.log(meanTemp);
    const extent = d3.extent(climateData, d => d.temperature);
    console.log(extent);
    const color = d3.scaleDiverging(d3.interpolateRdBu)
        .domain([extent[1], meanTemp, extent[0]])
        
    const colorLegend = Legend(d3.scaleSequential([extent[1], extent[0]], d3.interpolateRdBu), {
        title: "Temperature (fahrenheit)",
    });
    /* const path = d3.geoPath();

    const svg = d3.select("#map").append("svg")
        .attr("width", 975)
        .attr("height", 610)
        .attr("viewBox", [0, 0, 975, 610])
        .attr("style", "max-width: 100%; height: auto;");
    
    d3.select("#text-container").node().appendChild(colorLegend);

    const countyMesh = svg.append("g")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .join("path")
            .attr("fill", "#d3d3d3")
            .attr("d", path)
        .on("mouseover", (e, d) => tooltip.style("opacity", 1))
        .on("mousemove", (e, d) => {
            tooltip
                .html("County Code: " + d.county_code + "<br>" + "Temperature: " + d.temperature + "<br>" + "Precip: " + d.precipitation)
                .style('left', e.x + "px")
                .style('top', e.y + "px")
        })
        .on("mouseleave", (e, d) => tooltip.style("opacity", 0));

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path); */

    const tooltip = d3.select("#map")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

    // const scatterplot = new ScatterPlot(climateData, "#scatter");
    const lineplot = new LinePlot(climateData, "#timeline");
    console.log('Creating slider');
    const slider = new Slider(climateData, "#slider-range");
    
    const dropdown = document.getElementById("month-selector");
    dropdown.addEventListener('change', function() {
        let month = this.value;   
        console.log("Selecting map for:");
        console.log(month);          
        let filteredData = climateData.filter(d => d.month === month);

        console.log(filteredData);
        countyMesh.data(filteredData)
            .transition()
            .duration(1000)
            .attr("fill", d => color(d.temperature));
        scatterplot.updateScatter(filteredData);
    })
})();