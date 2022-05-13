from flask import  Flask, render_template, json, request
from os.path import join, dirname, realpath
import os

AX_IS_OPEN = False
PARAMS = {
    "filters" : [],
    "filter_types" : True,
    "granularity" : "perSentence"
}

#app = Flask(__name__)
app = Flask(
    __name__,
    static_folder="../frontend/static",
    template_folder="../frontend/static/html",
)

@app.route('/')
def index():  # put application's code here
    return render_template("example_adaptive.html", data={})


@app.route('/data')
def get_data():  # put application's code here
    file_path = "./data/test_bionet.json"
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    return {"data": data}

@app.route('/selection', methods=["GET", "POST"])
def get_selection():
    global AX_IS_OPEN
    global PARAMS

    selection = request.json["selection"]
    model = request.json["model"]

    if PARAMS["granularity"] == "perSentence":
        file_path = join(dirname(realpath(__file__)), "data/anno_xplorer_format/sentences")
    else:
        file_path = join(dirname(realpath(__file__)), "data/anno_xplorer_format/doc")

    filtered = [title.split("\n") for title in selection]
    sent_nums = list(set([el[0].replace(".", "_") for el in filtered]))
    sent_nums.sort()

    dir_list = os.listdir(file_path)
    name_list = ["_".join(el.replace(".json", "").split("_")[1:]) for el in dir_list]
    idx_list = [name_list.index(s) for s in sent_nums if s in name_list]
    idx_list.sort()

    concatenated = {}
    
    token_count = 0
    lastToken = False
    last_text = "_".join(dir_list[idx_list[0]].split("_")[1:3])

    for idx in idx_list:
        curr_text = "_".join(dir_list[idx].split("_")[1:3])
        if curr_text != last_text:
            lastToken = True
            last_text = curr_text

        data_path = file_path + "/" + dir_list[idx]

        with open(data_path, encoding="utf-8") as f:
            data = json.load(f)

            tokens = data["tokens"]

            for i in range(len(tokens)):
                tokens[i]["id"] = tokens[i]["id"] + token_count
                tokens[i]["lastToken"] = {
                    "is_last" : False,
                    "text_key" : ""
                }

            if lastToken:
                tokens[len(tokens) - 1]["lastToken"] = {
                    "is_last" : True,
                    "text_key" : curr_text
                }
                lastToken = False

            #data["tokens"] = tokens

            userAnnos = data["userAnnotations"]

            for i in range(len(userAnnos)):

                if PARAMS["filter_types"]:
                    types = userAnnos[i]["annotationType"]
                    types = [t for t in types if t in PARAMS["filters"]]
                    userAnnos[i]["annotationType"] = types

                annoTokens = userAnnos[i]["annotationTokens"]
                newAnnoTokens = []
                for j in range(len(annoTokens)):
                    new = annoTokens[j] + token_count
                    newAnnoTokens.append(new)

                userAnnos[i]["annotationTokens"] = newAnnoTokens

            token_count += len(tokens)

            if concatenated:
                concatenated["tokens"] += tokens
                concatenated["userAnnotations"] += userAnnos

            else:
                concatenated = data

    dest_file_path = join(dirname(realpath(__file__)), "data/selection.json")
    if os.path.isfile(dest_file_path): 
        os.remove(dest_file_path)

    with open(dest_file_path, "w", encoding="utf-8") as output:
        json.dump(concatenated, output, sort_keys=False, indent=4)

    return {"is_open" : False}

@app.route('/get_ax', methods=["GET", "POST"])
def test():
    return render_template("ax.html", data={})

@app.route('/ax_data', methods=["POST"])
def get_ax_data():  # put application's code here
    #file_path = "./data/bt_debatte4.json"
    file_path = "./data/selection.json"
    with open(file_path, encoding="utf-8") as f:
        data = json.load(f)

    return {"data": data}

@app.route('/filters', methods=["GET", "POST"])
def set_filters():
    global PARAMS
    PARAMS["filters"] = request.json["filters"]
    PARAMS["granularity"] = request.json["granularity"]
    print(PARAMS)
    return {}

if __name__ == '__main__':
    app.run()
