import { ScatterPlot } from "./scatter.js";
import { LinePlot } from "./lineplot.js";
import { Map } from "./map.js";

const projection = d3.geoAlbersUsa().scale(1280).translate([480, 300]);
const parseDate = d3.utcParse("%Y-%m-%d");

(async () => {
    async function getClimateData(dataPath) {
        const parseTime = d3.utcParse("%B %d, %Y");
        const climateData = await d3.csv(dataPath, function(d) {
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
        const filteredData = climateData.filter(d => {
            return !((d.month === "December" || d.month === "November") && d.year === 2024);
        })
        return filteredData;
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
    
    const climateData = await getClimateData("./data/climate.csv");
    console.log(climateData);
    const us = await getGeoData();
    const extent = d3.extent(climateData, d => d.temperature);
        
    const colorLegend = Legend(d3.scaleSequential([extent[1], extent[0]], d3.interpolateRdBu), {
        title: "Temperature (Fahrenheit)",
    });

    d3.select("#text-container").node().appendChild(colorLegend);
    d3.select("#loader").remove();
    d3.select("#select-text").text("Displaying Data for: January 2000");

    const scatterplot = new ScatterPlot(climateData, "#scatter");
    const map = new Map(us, climateData, "#map", scatterplot);
    const lineplot = new LinePlot(climateData, "#timeline", scatterplot, map);
})();