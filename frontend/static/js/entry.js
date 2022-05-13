// import * as d3 from "d3";

const colorMap = {
  "B-PER": "red",
  "B-LOC": "blue",
  "B-ORG": "green",
  "I-PER": "darkred",
  "I-LOC": "darkblue",
  "I-ORG": "darkgreen",
  "LOC": "blue",
  "PER": "red",
  "MISC": "purple",
  "ORG": "green",
  "GPE": "black",
  "PERSON": "red",
  "EVENT": "yellow",
  "ORG": "green",
  "DATE": "teal",
  "ORDINAL": "grey",
  "TIME": "teal",
  "NORP": "purple",
  "CARDINAL": "purple",
};
d3.json("../data/test.json").then(function (data) {
  var test1 = data.xlm_roberta_predictions;
  var test2 = data.flair_ner4_predictions;
  var test3 = data.flair_onto_predictions;

  var modelHeight = 100;
  chart1 = BarChart(test1, {
    x: (d) => d.id,
    y: (d) => d.model_predictions.length,
    xDomain: d3.groupSort(
      test1,
      ([d]) => parseInt(d.id),
      (d) => d.id
    ), // sort by descending frequency
    yFormat: "%",
    yLabel: "↑ Frequency",
    height: modelHeight,
    color: "lightgray",
    annoClass: "anno1",
    marginTop: 2,
    marginBottom: 2,
    duration: 750
  });

  chart2 = BarChart(test2, {
    x: (d) => d.id,
    y: (d) => d.model_predictions.length,
    xDomain: d3.groupSort(
      test1,
      ([d]) => parseInt(d.id),
      (d) => d.id
    ), // sort by descending frequency
    yFormat: "%",
    yLabel: "↑ Frequency",
    height: modelHeight,
    color: "lightgray",
    annoClass: "anno2",
    marginTop: 2,
    marginBottom: 2,
  });

  chart3 = BarChart(test3, {
    x: (d) => d.id,
    y: (d) => d.model_predictions.length,
    xDomain: d3.groupSort(
      test1,
      ([d]) => parseInt(d.id),
      (d) => d.id
    ), // sort by descending frequency
    yFormat: "%",
    yLabel: "↑ Frequency",
    height: modelHeight,
    color: "lightgray",
    annoClass: "anno3",
    marginTop: 2,
    marginBottom: 2,
  });

  document.body.appendChild(chart1);
  document.body.appendChild(chart2);
  document.body.appendChild(chart3);

  d3.select("body").append("select")
      .attr("class", "controls");

  function BarChart(
    data,
    {
      x = (d, i) => i, // given d in data, returns the (ordinal) x-value
      y = (d) => d, // given d in data, returns the (quantitative) y-value
      // title, // given d in data, returns the title text
      marginTop = 20, // the top margin, in pixels
      marginRight = 0, // the right margin, in pixels
      marginBottom = 30, // the bottom margin, in pixels
      marginLeft = 40, // the left margin, in pixels
      width = 1000, // the outer width of the chart, in pixels
      height = 200, // the outer height of the chart, in pixels
      xDomain, // an array of (ordinal) x-values
      xRange = [marginLeft, width - marginRight], // [left, right]
      yType = d3.scaleLinear, // y-scale type
      yDomain, // [ymin, ymax]
      yRange = [height - marginBottom, marginTop], // [bottom, top]
      xPadding = 0.1, // amount of x-range to reserve to separate bars
      yFormat, // a format specifier string for the y-axis
      yLabel, // a label for the y-axis
      color = "currentColor", // bar fill color
      annoClass,
         duration: initialDuration = 250, // transition duration, in milliseconds
  delay: initialDelay = (_, i) => i * 20 // per-element transition delay, in milliseconds
    } = {}
  ) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);

    function computeEntityDistribution(data) {
      //array of m_p objects
      var model_predictions = data.map((d) => d.model_predictions);
      //array of entity-types in each m_p object (array of arrays)
      var entities = model_predictions.map((d) => d.map((e) => e.entity));
      //array of objects describing frequency for entity-types
      var entity_freq = entities.map((d) => {
        var tmp = {};
        d.forEach((entity) => {
          if (tmp.hasOwnProperty(entity)) tmp[entity] += 1;
          else tmp[entity] = 1;
        });
        return tmp;
      });
      //array of arrays: entity types sorted by frequency
      var entity_freq_sorted = entity_freq.map((d) =>
        Object.entries(d).sort((a, b) => b[1] - a[1])
      );
      var entityTypes = new Set(entities.flat());
      console.log(entityTypes);
      return entity_freq_sorted;
    }
    var ed = computeEntityDistribution(data);
    // console.log(ed);

    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);

    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter((i) => xDomain.has(X[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);

    const svg = d3
      .create("svg")
      .attr("class", annoClass)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);
    // .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const bar = svg
      .append("g")
      .attr("fill", color)
      .selectAll("rect")
      .data(I)
      .join("rect")
      .attr("x", (i) => xScale(X[i]))
      .attr("y", (i) => yScale(Y[i]))
      .attr("height", (i) => yScale(0) - yScale(Y[i]))
      .attr("width", xScale.bandwidth())
      .attr("fill", (_, i) => {
        if (ed[i][0]) return colorMap[ed[i][0][0]];
        else return "green";
      });

    bar.append("title").text(function (d) {
      return d;
    });

    return svg.node();
  }
});
