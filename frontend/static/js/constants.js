var tagTypes = ["LOC", "PER", "ORG", "MISC"];
// const models = ["flair", "roberta", "stanza"];

var maximalWindowHeight = 400;
var aRSteps = 5;
var aRRange = [0.2, 5];
var squareCellSize = [50, 300];
var cellHeightRange = [10, 210];
// var initialWindowSize = 1200;
var initialCellHeight = 100;
var squareRange = [0.75, 1.33];
var opacityRange = [0.1, 10];
var strokeWidth = 1;
var minWindowWidth = 300;
var controlsWidth = 200;
var colorScheme = function (length) {
  return d3.schemeSpectral[length];
};

export {
  tagTypes,
  maximalWindowHeight,
  aRSteps,
  squareCellSize,
  aRRange,
  cellHeightRange,
  initialCellHeight,
  squareRange,
  opacityRange,
  minWindowWidth,
  controlsWidth,
  strokeWidth,
  colorScheme,
};
