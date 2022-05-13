// import * as d3 from "d3";
// import {test} from "./dataPreprocessing.js"
// console.log(test);
import { colorScheme, maximalWindowHeight } from "./constants.js";
import {
  guiConfig,
  gui,
  granularityController,
  windowSizeController,
  updateSquareCellSampleSizeController,
  // cellHeightController,
} from "./gui.js";
import { processData } from "./dataPreprocessing.js";
import { drawcharts } from "./drawing.js";

const data = await processData;
var yDom = computeYDomain(data, "perSentence");
yDom = [Math.min(...yDom.map((d) => d[0])), Math.max(...yDom.map((d) => d[1]))];

function computeYDomain(data, granularity) {
  var yDom = [];

  var x = (d) => d.id;
  var y = (d) => d.count;
  var z = (d) => d.type;

  // var xDomain = sampleRange;
  // var zDomain = data.types;

  for (const model of data.models) {
    var dataI = data.flatCounts[granularity][model];

    const X = d3.map(dataI, x);
    const Y = d3.map(dataI, y);
    const Z = d3.map(dataI, z);

    // Compute default x- and z-domains, and unique them.
    var xDomain = X;
    var zDomain = Z;

    // xDomain = xDomain.slice(0, sampleSize);
    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);
    var I = d3.range(X.length);
    I = I.filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]));

    const stack = d3
      .stack()
      .keys(zDomain)
      .value(([x, I], z) => Y[I.get(z)]);
    // .order(order)
    // .offset(offset);
    var series = stack(
      d3.rollup(
        I,
        ([i]) => i,
        (i) => X[i],
        (i) => Z[i]
      )
    );
    series.forEach((s) => {
      s.forEach((d) => {
        Object.assign(d, { i: d.data[1].get(s.key) });
      });
    });

    yDom.push(d3.extent(series.flat(2)));
  }
  return yDom;
}

// console.log(yDom);

var colorMap = {};
data.types.forEach(
  (key, i) => (colorMap[key] = colorScheme(data.types.length)[i])
);

var chartConfig = {};
chartConfig.yDom = yDom;

setChartConfig(chartConfig, guiConfig);

drawcharts(data, chartConfig);

gui.onFinishChange((_) => {
  onGuiChanges();
});
granularityController.onFinishChange((_) => {
  if (guiConfig.squareMode) {
    updateSquareCellSampleSizeController();
    onGuiChanges();
  }
});
windowSizeController.onFinishChange((_) => {
  if (guiConfig.squareMode) {
    updateSquareCellSampleSizeController();
    onGuiChanges();
  }
});
// cellHeightController.onFinishChange((_) => {
//   var windowHeight = window.innerHeight;
//   chartConfig.numRows = Math.max(1, Math.floor(windowHeight / guiConfig.cellHeight));
//
//   onGuiChanges();
// });

function setChartConfig(chartConfig, guiConfig) {
  var xOrderSelector = {
    byId: "byId",
    byTotal: "byTotal",
    byFlair: "byFlair",
    byRoberta: "byRoberta",
    byStanza: "byStanza",

  };
  chartConfig.xOrder = xOrderSelector[guiConfig.xOrder];

  var granularitySelector = {
    perText: "perText",
    perSentence: "perSentence",
  };
  chartConfig.granularity = granularitySelector[guiConfig.granularity];

  var bottomSeriesSelector = {
    default: d3.stackOrderNone,
    earliestMax: d3.stackOrderAppearance,
    smallestSum: d3.stackOrderAscending,
    largestSum: d3.stackOrderDescending,
  };
  chartConfig.bottomSeries = bottomSeriesSelector[guiConfig.bottomSeries];

  chartConfig.normalization = guiConfig.normalization
    ? d3.stackOffsetExpand
    : d3.stackOffsetNone;

  chartConfig.barType = guiConfig.barType;

  chartConfig.windowSize = guiConfig.windowSize;
  chartConfig.sampleSize = guiConfig.sampleSize;
  chartConfig.cellHeight = guiConfig.cellHeight;
  chartConfig.barsOpacity = guiConfig.barsOpacity;
  chartConfig.linesOpacity = guiConfig.linesOpacity;
  chartConfig.manualLayout = guiConfig.manualLayout;
  chartConfig.lines = guiConfig.lines;

  var windowHeight = window.innerHeight - 160;
  chartConfig.numRows = Math.max(
    1,
    Math.min(
      Math.floor(windowHeight / (data.models.length * guiConfig.cellHeight)),
      Math.floor(
        (data.dataSize[guiConfig.granularity] - 1) / guiConfig.sampleSize
      )
    )
  );
  // console.log(windowHeight);
  // console.log(chartConfig.numRows);

  chartConfig.catFilter = data.types.filter((t) => guiConfig[t]);
  chartConfig.colors = chartConfig.catFilter.map((c) => colorMap[c]);

  d3.json("/filters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filters: chartConfig.catFilter,
      granularity: chartConfig.granularity,
    }),
  });
}
function removeCharts() {
  d3.selectAll(".row").remove();
  // function removeElementsByClass(className) {
  //   var elements = document.getElementsByClassName(className);
  //   while (elements.length > 0) {
  //     elements[0].parentNode.removeChild(elements[0]);
  //   }
  // }
  // for (const model of models) {
  //   removeElementsByClass(model);
  // }
}
function onGuiChanges() {
  // removeCharts(data.models);
  removeCharts();
  setChartConfig(chartConfig, guiConfig);
  drawcharts(data, chartConfig);
}

// function aREffect(squareHeight, height) {
//   var heightScale = d3.scaleLinear();
//   heightScale.domain([0]);
//   heightScale.range([squareHeight, maximalWindowHeight]);
//   return heightScale();
// }
