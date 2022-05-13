import { opacityRange, squareRange, strokeWidth } from "./constants.js";

function drawcharts(
  {
    flatCounts: flatCounts,
    types: types,
    xOrders: xOrders,
    models: models,
    dataSize: dataSize,
  } = {},
  {
    granularity: granularity,
    xOrder: xOrder,
    normalization: offset,
    bottomSeries: order,
    barType: barType,
    aspectRatio: aspectRatio,
    windowSize: windowSize,
    sampleSize: sampleSize,
    cellHeight: cellHeight,
    manualLayout: manualLayout,
    linesOpacity: linesOpacity,
    barsOpacity: barsOpacity,
    numRows: numRows,
    catFilter: catFilter,
    colors: colors,
    yDom: yDom,
    lines: lines,
  } = {}
) {
  // console.log(numRows);
  // var firstYDomain;
  var rows = d3
    .select("body")
    // .append("div")
    // .attr("class", "rowContainer")
    .selectAll(".row")
    .data(d3.range(numRows))
    .join("div")
    .attr("class", (d) => "row r" + d)
    .each((rowNum, i, nodes) => {
      for (const model of models) {
        var label = d3
          .create("div")
          .attr("class", cellHeight > 50 ? "longLabel" : "shortLabel")
          .text(cellHeight > 50 ? model : model.slice(0, 1).toUpperCase())
          .node();
        nodes[i].appendChild(label);
        var sampleRange;
        switch (xOrder) {
          case "byTotal":
            sampleRange = xOrders[granularity][xOrder][model];
            break;
          case "byFlair":
            sampleRange = xOrders[granularity]["byTotal"]["flair"];
            break;
          case "byRoberta":
            sampleRange = xOrders[granularity]["byTotal"]["roberta"];
            break;
          case "byStanza":
            sampleRange = xOrders[granularity]["byTotal"]["stanza"];
            break;
          case "byId":
            sampleRange = xOrders[granularity][xOrder];
        }
        var sampleRange = sampleRange.slice(
          rowNum * sampleSize,
          Math.min(dataSize[granularity], (rowNum + 1) * sampleSize)
        );
        // var sampleRange = (
        //   xOrder === "byTotal"
        //     ? xOrders[granularity][xOrder][model]
        //     : xOrders[granularity][xOrder]
        // ).slice(
        //   rowNum * sampleSize,
        //   Math.min(dataSize[granularity], (rowNum + 1) * sampleSize)
        // );
        // if (i === 0) {
        // }
        var chart;
        chart = drawBars(flatCounts[granularity][model], {
          x: (d) => d.id,
          y: (d) => d.count,
          z: (d) => d.type,
          xDomain: sampleRange,
          zDomain: catFilter,
          yDomain: offset === d3.stackOffsetExpand ? [0, 1] : yDom,
          colors: colors,
          width: windowSize,
          height: cellHeight,
          order: order,
          offset: offset,
          chartClass: model,
          barType: barType,
          // aspectRatio: aspectRatio,
          // sampleSize: sampleSize,
          manualLayout: manualLayout,
          linesOpacity: linesOpacity,
          barsOpacity: barsOpacity,
          lines: lines,
        });
        nodes[i].appendChild(chart);

        // else {
        //   nodes[i].appendChild(
        //     drawBars(flatCounts[granularity][model], {
        //       x: (d) => d.id,
        //       y: (d) => d.count,
        //       z: (d) => d.type,
        //       xDomain: sampleRange,
        //       zDomain: catFilter,
        //       yDomain: firstYDomain,
        //       colors: colors,
        //       width: windowSize,
        //       height: cellHeight,
        //       order: order,
        //       offset: offset,
        //       chartClass: model,
        //       barType: barType,
        //       // aspectRatio: aspectRatio,
        //       // sampleSize: sampleSize,
        //       manualLayout: manualLayout,
        //       linesOpacity: linesOpacity,
        //       barsOpacity: barsOpacity,
        //     })[0]
        //   );
        // }
      }
    });
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-bar-chart
function drawBars(
  data,
  {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = (d) => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text

    xTitleMap = {},

    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 200, // outer height, in pixels
    svgHeight = 200 + 20,
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    xPadding = 0.02, // amount of x-range to reserve to separate bars
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    zDomain, // array of z-values
    zPadding = 0.05, // amount of x-range to reserve to separate bars
    offset = d3.stackOffsetDiverging, // stack offset method
    order = d3.stackOrderNone, // stack order method
    yFormat, // a format specifier string for the y-axis
    // yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
    chartClass,
    barType, //stacked, grouped, smallMultiples
    // aspectRatio = 1,
    sampleSize = 1,
    manualLayout,
    linesOpacity,
    barsOpacity,
    lines,
  } = {}
) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const Z = d3.map(data, z);

  // Compute default x- and z-domains, and unique them.
  if (xDomain === undefined) xDomain = X;
  if (zDomain === undefined) zDomain = Z;

  // xDomain = xDomain.slice(0, sampleSize);
  xDomain = new d3.InternSet(xDomain);
  zDomain = new d3.InternSet(zDomain);

  // console.log(zDomain);
  // Omit any data not present in the x- and z-domains.
  var I = d3.range(X.length);
  I = I.filter((i) => xDomain.has(X[i]) && zDomain.has(Z[i]));

  // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
  // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
  // each tuple has an i (index) property so that we can refer back to the
  // original data point (data[i]). This code assumes that there is only one
  // data point for a given unique x- and z-value.
  const stack = d3
    .stack()
    .keys(zDomain)
    .value(([x, I], z) => Y[I.get(z)])
    .order(order)
    .offset(offset);
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

  // Construct scales, axes, and formats.
  const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
  const zScale = d3.scaleOrdinal(zDomain, colors);

  if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
  var yDomainsPerType = {};
  series.forEach((s) => {
    yDomainsPerType[s.key] = d3.extent(s.flat());
  });
  const yVRange = [height - marginBottom, marginTop]; // [bottom, top];
  const yVScale = yType(yDomain, yVRange);
  const yHRange = [0, xScale.bandwidth()];
  const yHScale = yType(yDomain, yHRange);

  var aspectRatio = xScale.bandwidth() / height;


  // const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
  // const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

  // Compute titles.
  if (title === undefined) {
    const formatValue = yVScale.tickFormat(100, yFormat);
    title = (i) => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
  } else {
    const O = d3.map(data, (d) => d);
    const T = title;
    title = (i) => T(O[i], i, data);
  }

  const svg = d3
    .create("svg")
    .attr("class", chartClass)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  const brush = d3
    .brushX()
    .extent([
      [marginLeft, 0],
      [width, height],
    ])
    .on("brush", (d) => {})
    .on("end", (e) => {
      let extent = e.selection;
      let model = svg.attr("class");
      let titles;
      if (extent) {
        extent = [...Array(extent[1] - extent[0] + 1).keys()].map(
          (x) => extent[0] + x
        );
        titles = extent
          .map((i) => xTitleMap[i])
          .filter((el) => el !== undefined)
          .flat();
        titles = [...new Set(titles)];

        sendSelectionToBackend(titles, model);
      }
    });

  const test = svg.append("g").call(brush).call(brush.move);

  // svg
  //     .append("g")
  //     .attr("transform", `translate(${marginLeft},0)`)
  //     .call(yAxis)
  //     .call((g) => g.select(".domain").remove())
  //     .call((g) =>
  //         g
  //             .selectAll(".tick line")
  //             .clone()
  //             .attr("x2", width - marginLeft - marginRight)
  //             .attr("stroke-opacity", 0.1)
  //     )
  //     .call((g) =>
  //         g
  //             .append("text")
  //             .attr("x", -marginLeft)
  //             .attr("y", 10)
  //             .attr("fill", "currentColor")
  //             .attr("text-anchor", "start")
  //             .text(yLabel)
  //     );

  // svg
  //     .append("g")
  //     .attr("transform", `translate(0,${yVScale(0)})`)
  //     .call(xAxis);

  function drawStacked(lines) {
    if (!lines) {
      var currBarsOp = 1;
    } else {
      if (manualLayout) {
        var currLinesOp = linesOpacity;
        var currBarsOp = barsOpacity;
      } else {
        var currLinesOp = opacitySelector(aspectRatio, "lines");
        var currBarsOp = opacitySelector(aspectRatio, "rects");
      }
    }

    function drawHLines(o) {
      return svg
        .append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("stroke", ([{ i }]) => zScale(Z[i]))
        .attr("stroke-opacity", o)
        .attr("stroke-width", strokeWidth)
        .selectAll("line")
        .data((d) => d)
        .join("line")
        .attr("x1", ({ i }) => xScale(X[i]))
        .attr("x2", ({ i }) => xScale(X[i]) + xScale.bandwidth())
        .attr("y1", ([y1, y2]) => yVScale(y2))
        .attr("y2", ([y1, y2]) => yVScale(y2))
        .attr("display", (d) => {
          if (d[0] === d[1]) return "none";
        });
    }
    function drawVLines(o) {
      return svg
        .append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("stroke", ([{ i }]) => zScale(Z[i]))
        .attr("stroke-opacity", o)
        .attr("stroke-width", strokeWidth)
        .selectAll("line")
        .data((d) => d)
        .join("line")
        .attr("x1", (d) => xScale(X[d.i]) + yHScale(d[1]))
        .attr("x2", (d) => xScale(X[d.i]) + yHScale(d[1]))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("display", (d) => {
          if (d[0] === d[1]) return "none";
        });
    }
    function opacitySelector(a, type) {
      var opacityScale = d3
        .scaleLinear()
        .domain([
          opacityRange[0],
          squareRange[0],
          squareRange[1],
          opacityRange[1],
        ])
        .clamp(true);
      if (type === "lines") {
        opacityScale.range([0, 1, 1, 0]);
        return opacityScale(a);
      } else {
        opacityScale.range([1, 0, 0, 1]);
        return opacityScale(a);
      }
    }

    var rects = svg
      .append("g")
      .selectAll("g")
      .data(series)
      .join("g")
      .attr("fill", ([{ i }]) => zScale(Z[i]))
      .selectAll("rect")
      .data((d) => d)
      .join("rect");

    if (aspectRatio > (lines? squareRange[1] : 1)) {
      //  broad rects
      rects
        .attr("x", (d, i) => {
          if (title) {
            let xTitle = title(i);
            let val = xScale(X[d.i]) + Math.min(yHScale(d[0]), yHScale(d[1]));
            let rounded = Math.round(val);
            if (xTitleMap[rounded]) {
              xTitleMap[rounded].push(xTitle);
            } else {
              xTitleMap[rounded] = [xTitle];
            }
          }
          return xScale(X[d.i]) + Math.min(yHScale(d[0]), yHScale(d[1]));
        })
        .attr("y", 0)
        .attr("height", height)
        .attr("width", ([y1, y2]) => Math.abs(yHScale(y1) - yHScale(y2)))
        .attr("opacity", currBarsOp);
      if (lines) {
        var hLines = drawHLines(currLinesOp);
        if (title) hLines.append("title").text(({ i }) => title(i));
      }
    } else if (aspectRatio < (lines? squareRange[0] : 1)) {
      rects
        .attr("x", ({ i }) => {
          if (title) {
            let xTitle = title(i);
            let vals = [xScale(X[i]), xScale(X[i]) + xScale.bandwidth()];
            vals.map((val) => {
              let rounded = Math.round(val);
              if (xTitleMap[rounded]) {
                xTitleMap[rounded].push(xTitle);
              } else {
                xTitleMap[rounded] = [xTitle];
              }
            });
          }
          return xScale(X[i]);
        })
        .attr("y", ([y1, y2]) => Math.min(yVScale(y1), yVScale(y2)))
        .attr("height", ([y1, y2]) => Math.abs(yVScale(y1) - yVScale(y2)))
        .attr("width", xScale.bandwidth())
        .attr("opacity", currBarsOp);
      if (lines) {
        var vLines = drawVLines(currLinesOp);
        if (title) vLines.append("title").text(({ i }) => title(i));
      }
    } else {
      var hLines = drawHLines(currLinesOp);
      var vLines = drawVLines(currLinesOp);
      if (title) hLines.append("title").text(({ i }) => title(i));
      if (title) vLines.append("title").text(({ i }) => title(i));
    }

    if (title) rects.append("title").text(({ i }) => title(i));
    // if (title) hLines.append("title").text(({ i }) => title(i));
    // if (title) vLines.append("title").text(({ i }) => title(i));
  }
  function drawGrouped() {
    yDomain = [0, d3.max(Y)];
    const xzScale = d3
      .scaleBand(zDomain, [0, xScale.bandwidth()])
      .padding(zPadding);

    const rects = svg
      .append("g")
      .selectAll("rect")
      .data(I)
      .join("rect")
      .attr("x", (i) => {
        if (title) {
          let xTitle = title(i);
          let val = xScale(X[i]) + xzScale(Z[i]);
          let rounded = Math.round(val);
          if (xTitleMap[rounded]) {
            xTitleMap[rounded].push(xTitle);
          } else {
            xTitleMap[rounded] = [xTitle];
          }
        }
        return xScale(X[i]) + xzScale(Z[i]);
      })
      .attr("y", (i) => yVScale(Y[i]))
      .attr("width", xzScale.bandwidth())
      .attr("height", (i) => yVScale(0) - yVScale(Y[i]))
      .attr("fill", (i) => zScale(Z[i]));

    if (title) rects.append("title").text(title);
  }
  switch (barType) {
    case "stacked":
      drawStacked(lines);
      break;
    case "grouped":
      drawGrouped();
      break;
  }

  const sendSelectionToBackend = (selection, model) => {
    d3.json("/selection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        selection,
      }),
    }).then((data) => {
      if (data["is_open"] === false) {
        window.open("http://127.0.0.1:5000/get_ax");
      }
    });
  };

  // return [Object.assign(svg.node(), { scales: { color: zScale } }), yDomain];
  return Object.assign(svg.node(), { scales: { color: zScale } });
}

export { drawcharts };
