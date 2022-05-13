import json
from collections import Counter
from os.path import join, dirname, realpath
import os
import sys
import convert2annoxplorer

tagTypes = ["PER", "LOC"]


def computeCounts(data):
    models = [key for key in data[0].keys() if "predictions" in key]
    models = [key.split("_")[1] for key in models]

    counts = []

    for text in data:
        curr_counts = {
            "countsPerSentence": {},
            "countsPerText": {},
            "id": text["id_composed"],
        }

        for model in models:
            model_output = text["predictions_" + model]

            curr_counts["countsPerSentence"][model] = []

            for sen in model_output:
                entities = [el["entity"] for el in sen]
                entities = [{ent: entities.count(ent)} for ent in set(entities)]
                curr_counts["countsPerSentence"][model].append(entities)

            c = Counter()
            merged = sum(
                curr_counts["countsPerSentence"][model], []
            )  # flattens array of array to 1d

            for el in merged:
                c.update(el)

            curr_counts["countsPerText"][model] = dict(c)

        counts.append(curr_counts)

    return models, counts


def computeFlatCounts(data):
    global tagTypes

    models, counts = computeCounts(data)
    flatCounts = {"perText": {}, "perSentence": {}}

    for model in models:
        flatCounts["perText"][model] = []
        flatCounts["perSentence"][model] = []

        for t in tagTypes:
            arr = [
                {
                    "id": count["id"],
                    "type": t,
                    "count": count["countsPerText"][model][t]
                    if t in count["countsPerText"][model]
                    else 0,
                }
                for count in counts
            ]

            flatCounts["perText"][model].append(arr)

        for t in tagTypes:
            for count in counts:
                arr = []

                for i, sen in enumerate(count["countsPerSentence"]):
                    arr.append(
                        {
                            "id": count["id"] + "." + str(i),
                            "type": t,
                            "count": sen[t] if t in sen else 0,
                        }
                    )

                flatCounts["perSentence"][model].append(arr)

    return models, flatCounts


def groupSort(perCounts):
    perCounts = sum(perCounts, [])
    ids = list(set([el["id"] for el in perCounts]))

    ids_sorted = []

    for id in ids:
        count = 0
        for el in perCounts:
            if el["id"] == id:
                count += el["count"]
        ids_sorted.append((id, count))

    ids_sorted.sort(key=lambda tup: tup[1])  # reverse=True if in descending order
    ids_sorted = [id[0] for id in ids_sorted]

    return ids_sorted


def computeXOrders(flatCounts, models):
    xOrders = {
        "perText": {"byTotal": {}, "byId": []},
        "perSentence": {"byTotal": {}, "byId": []},
    }

    for model in models:
        perText = flatCounts["perText"][model]
        xOrders["perText"]["byTotal"][model] = groupSort(perText)

        perSentence = flatCounts["perSentence"][model]
        xOrders["perSentence"]["byTotal"][model] = groupSort(perSentence)

    merged = sum(flatCounts["perText"][models[0]], [])
    xOrders["perText"]["byId"] = list(set([el["id"] for el in merged]))

    merged = sum(flatCounts["perSentence"][models[0]], [])
    xOrders["perSentence"]["byId"] = [el["id"] for el in merged]

    dataSize = {
        "perText": len(xOrders["perText"]["byId"]),
        "perSentence": len(xOrders["perSentence"]["byId"]),
    }

    return xOrders, dataSize


def processData():
    global tagTypes

    file_path = "../data/"  # SET DATAPATH

    processedData = {}

    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

        models, flatCounts = computeFlatCounts(data)
        xOrders, dataSize = computeXOrders(flatCounts, models)

        processedData = {
            "types": tagTypes,
            "models": models,
            "flatCounts": flatCounts,
            "xOrders": xOrders,
            "dataSize": dataSize,
        }

    return processedData


def update_bionet_token_ids_continuous():
    token_count = 0

    data_path = "../data/anno_xplorer_format"
    file_path = join(dirname(realpath(__file__)), data_path)
    dir_list = os.listdir(file_path)

    for file in dir_list:
        file_path = data_path + "/" + file
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)

            tokens = data["tokens"]

            for i in range(len(tokens)):
                tokens[i]["id"] = tokens[i]["id"] + token_count

            data["tokens"] = tokens

            userAnnos = data["userAnnotations"]

            for i in range(len(userAnnos)):
                annoTokens = userAnnos[i]["annotationTokens"]
                newAnnoTokens = []
                for j in range(len(annoTokens)):
                    new = annoTokens[j] + token_count
                    newAnnoTokens.append(new)

                userAnnos[i]["annotationTokens"] = newAnnoTokens

            token_count += len(tokens)

            data["userAnnotations"] = userAnnos

        with open(file_path, "w", encoding="utf-8") as output:
            json.dump(data, output, sort_keys=False, indent=4)


def update_bionet_token_ids_with_key():
    data_path = "../data/anno_xplorer_format"
    file_path = join(dirname(realpath(__file__)), data_path)
    dir_list = os.listdir(file_path)
    # dir_list = [el.replace(".json", "").split("_")[1:] for el in dir_list]

    for file in dir_list:
        file_path = data_path + "/" + file
        print(file_path)
        with open(file_path, encoding="utf-8") as f:
            data = json.load(f)
            key = file.replace(".json", "").replace("sentence_", "")

            tokens = data["tokens"]

            for i in range(len(tokens)):
                tokens[i]["id"] = key + "_" + str(tokens[i]["id"])

            data["tokens"] = tokens

            userAnnos = data["userAnnotations"]

            for i in range(len(userAnnos)):
                annoTokens = userAnnos[i]["annotationTokens"]
                newAnnoTokens = []
                for j in range(len(annoTokens)):
                    new = key + "_" + str(annoTokens[j])
                    newAnnoTokens.append(new)

                userAnnos[i]["annotationTokens"] = newAnnoTokens

            data["userAnnotations"] = userAnnos

            with open(file_path, "w", encoding="utf-8") as output:
                json.dump(data, output, sort_keys=False, indent=4)


def slice_bionet_dataset(slice_amount=100):
    source_path = "../data/bionet_sample.jsonl"
    source_file_path = join(dirname(realpath(__file__)), source_path)

    dest_path = "../data/test_bionet.json"
    dest_file_path = join(dirname(realpath(__file__)), dest_path)

    if (
        os.path.isfile(source_file_path) == False
        or os.path.isfile(dest_file_path) == True
    ):
        return

    result_list = []

    with open(source_file_path, encoding="utf-8") as f:
        data = list(f)
        result_list = [json.loads(data[i]) for i in range(slice_amount)]

        with open(dest_file_path, "w", encoding="utf-8") as output:
            json.dump(result_list, output, sort_keys=False, indent=4)

        # print(data[0])


if __name__ == "__main__":
    params = sys.argv[1:]

    slice_bionet_dataset()

    conv_docs = False
    conv_sent = False
    if "doc" in params:
        conv_docs = True
    if "sent" in params:
        conv_sent = True

    convert2annoxplorer.convert(conv_sent, conv_docs)
