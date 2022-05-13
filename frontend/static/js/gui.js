import { processData } from "./dataPreprocessing.js";
import {
  aRSteps,
  aRRange,
  squareCellSize,
  initialCellHeight,
  cellHeightRange,
  minWindowWidth,
  controlsWidth,
} from "./constants.js";

const data = await processData;

const guiConfig = {
  xOrder: "byFlair",
  normalization: false,
  bottomSeries: "default",
  barType: "stacked",
  granularity: "perSentence",
  // aspectRatio: 1,
  windowSize:
    // minWindowWidth + (window.innerWidth - controlsWidth - minWindowWidth) / 2,
    window.innerWidth - controlsWidth - 50,
  cellHeight: initialCellHeight,
  squareMode: false,
  barsOpacity: 1,
  linesOpacity: 1,
  manualLayout: false,
  lines: true,
  LOC: true,
  PER: true,
  ORG: true,
  MISC: true,
};

var squareCellSampleSizeRange = setSquareCellSampleSizeRange();

guiConfig.sampleSize = guiConfig.squareMode
  ? Math.ceil((squareCellSampleSizeRange[0] + squareCellSampleSizeRange[1]) / 2)
  : Math.floor(0.5 * data.dataSize[guiConfig.granularity]);

var gui = new lil.GUI({ width: controlsWidth });
gui.add(guiConfig, "xOrder", [
  "byId",
  "byFlair",
  "byRoberta",
  "byStanza",
  "byTotal",
]);
gui.add(guiConfig, "barType", ["stacked", "grouped"]);
var granularityController = gui.add(guiConfig, "granularity", [
  "perText",
  "perSentence",
]);
// gui.add(
//   guiConfig,
//   "aspectRatio",
//   aRRange[0],
//   aRRange[1],
//   (aRRange[1] - aRRange[0]) / aRSteps
// );
var windowSizeController = gui.add(
  guiConfig,
  "windowSize",
  minWindowWidth,
  window.innerWidth - controlsWidth - 50,
  10
);
var sampleSizeController = gui.add(
  guiConfig,
  "sampleSize",
  guiConfig.squareMode ? squareCellSampleSizeRange[0] : 7,
  guiConfig.squareMode
    ? squareCellSampleSizeRange[1]
    : data.dataSize[guiConfig.granularity],
  1
  // data.dataSize[guiConfig.granularity],
);
var cellHeightController = gui.add(
  guiConfig,
  "cellHeight",
  cellHeightRange[0],
  cellHeightRange[1],
  1
);
gui.add(guiConfig, "squareMode");
const guiStacked = gui.addFolder("stacked bars");
var linesController = guiStacked.add(guiConfig, "lines");
var manualLayoutController = guiStacked.add(guiConfig, "manualLayout");
var barsOpacityController = guiStacked.add(guiConfig, "barsOpacity", 0, 1, 0.1);
var linesOpacityController = guiStacked.add(
  guiConfig,
  "linesOpacity",
  0,
  1,
  0.1
);
guiStacked.add(guiConfig, "normalization");

guiStacked.add(guiConfig, "bottomSeries", [
  "default",
  "earliestMax",
  "smallestSum",
  "largestSum",
]);

// const guiGrouped = gui.addFolder("grouped bars");
const guiFilter = gui.addFolder("CatFilter");
d3.select(guiFilter.add(guiConfig, "LOC").domElement)
  .select(".name")
  .classed("LOC", true);
d3.select(guiFilter.add(guiConfig, "PER").domElement)
  .select(".name")
  .classed("PER", true);
d3.select(guiFilter.add(guiConfig, "ORG").domElement)
  .select(".name")
  .classed("ORG", true);
d3.select(guiFilter.add(guiConfig, "MISC").domElement)
  .select(".name")
  .classed("MISC", true);

barsOpacityController.disable(true);
linesOpacityController.disable(true);
manualLayoutController.onChange((_) => {
  barsOpacityController.disable(!barsOpacityController._disabled);
  linesOpacityController.disable(!linesOpacityController._disabled);
});

linesController.onChange((_) => {
  manualLayoutController.enable(manualLayoutController._disabled);
});

function setSquareCellSampleSizeRange() {
  return [
    Math.min(
      Math.ceil(guiConfig.windowSize / squareCellSize[1]),
      data.dataSize[guiConfig.granularity]
    ),
    Math.min(
      Math.floor(guiConfig.windowSize / squareCellSize[0]) + 1,
      data.dataSize[guiConfig.granularity]
    ),
  ];
}
function updateSquareCellSampleSizeController() {
  squareCellSampleSizeRange = setSquareCellSampleSizeRange();
  sampleSizeController.max(squareCellSampleSizeRange[1]);
  sampleSizeController.min(squareCellSampleSizeRange[0]);
  guiConfig.sampleSize = Math.ceil(
    (squareCellSampleSizeRange[0] + squareCellSampleSizeRange[1]) / 2
  );
  sampleSizeController.updateDisplay();
  // console.log(squareCellSampleSizeRange);
  // console.log(guiConfig.sampleSize);
}

export {
  guiConfig,
  gui,
  granularityController,
  windowSizeController,
  updateSquareCellSampleSizeController,
  cellHeightController,
};
