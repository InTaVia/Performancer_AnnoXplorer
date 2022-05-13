import { tagTypes } from "./constants.js";

function computeCounts(data) {
  var models = Object.keys(data[0])
    .filter((k) => {
      return /^predictions_/.test(k);
    })
    .map((name) => {
      return name.slice(12);
    });

  var counts = data.map((text) => {
    var countsPerSentence = {};
    var countsPerText = {};

    models.forEach((model) => {
      countsPerSentence[model] = text["predictions_" + model].map((sen) => {
        return d3.rollup(
          sen,
          (v) => v.length,
          (d) => d.entity
        );
      });
      countsPerText[model] = d3.rollup(
        text["predictions_" + model].flat(),
        (v) => v.length,
        (d) => d.entity
      );
    });

    return { id: text.id_composed, countsPerSentence, countsPerText };
  });
  return [models, counts];
}

function computeFlatCounts(data) {
  var [models, counts] = computeCounts(data);

  var flatCounts = { perText: {}, perSentence: {} };
  for (const model of models) {
    flatCounts.perText[model] = tagTypes.flatMap((type) =>
      counts.map((d) => ({
        id: d.id,
        type: type,
        count: d.countsPerText[model].has(type)
          ? d.countsPerText[model].get(type)
          : 0,
      }))
    );
    flatCounts.perSentence[model] = tagTypes.flatMap((type) =>
      counts.flatMap((d) => {
        return d.countsPerSentence[model].map((sen, i) => ({
          id: d.id + "." + i,
          type: type,
          count: sen.has(type) ? sen.get(type) : 0,
        }));
      })
    );
  }
  return [models, flatCounts];
}

function computeXOrders(flatCounts, models) {
  var xOrders = {
    perText: {
      byTotal: {},
      byId: [],
    },
    perSentence: {
      byTotal: {},
      byId: [],
    },
  };

  for (const model of models) {
    xOrders.perText.byTotal[model] = d3.groupSort(
      flatCounts.perText[model],
      (D) => d3.sum(D, (d) => -d.count),
      (d) => d.id
    );
    xOrders.perSentence.byTotal[model] = d3.groupSort(
      flatCounts.perSentence[model],
      (D) => d3.sum(D, (d) => -d.count),
      (d) => d.id
    );
  }

  xOrders.perText.byId = Array.from(
    new Set(flatCounts.perText[models[0]].map((d) => d.id))
  );
  xOrders.perSentence.byId = flatCounts.perSentence[models[0]].map((d) => d.id);

  var dataSize = {
    perText: xOrders.perText.byId.length,
    perSentence: xOrders.perText.byId.length,
  };

  return [xOrders, dataSize];
}

// export { computeFlatCounts, computeXOrders , computeLengths};

export var processData =
    // d3.json("../data/test5.json").then(function (data) {
    d3.json("/data").then(function ({data}) {
    var processedData = {
      types: tagTypes,
    };
      // var processedData = {};

    [processedData.models, processedData.flatCounts] = computeFlatCounts(data);
    [processedData.xOrders, processedData.dataSize] = computeXOrders(
      processedData.flatCounts,
      processedData.models
    );
    // console.log(processedData.models);
    return processedData;


    // return data;

    // console.log(processedData);
    // dataSize = {
    //   perText: processedData.perText.byId.length,
    //   perSentence: processedData.perText.byId.length,
    // };
  });



// console.log(processedData);
// export { processedData };
