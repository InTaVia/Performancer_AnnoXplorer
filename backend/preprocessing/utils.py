from audioop import avg
import json
from flair.data import Sentence
from typing import List, Dict
from statistics import mean
import stanza, stroll.stanza


def _unify_wordpiece_predictions(prediction_list: List) -> List:
    """
     This function is written to fix models that return predictions as:
     Also looking to unify for the visualization tool build on top!
        EXAMPLE: SOCCER - JAPAN GET LUCKY WIN , CHINA IN SURPRISE DEFEAT .
        PREDS:    [{'end': 14, 'entity': 'B-LOC', 'index': 5, 'score': 0.9960225820541382, 'start': 8, 'word': '▁JAPAN'}
                    {'end': 33, 'entity': 'B-LOC', 'index': 15, 'score': 0.9985975623130798, 'start': 30, 'word': '▁CH'}
                    {'end': 36, 'entity': 'B-LOC', 'index': 16, 'score': 0.9762864708900452, 'start': 33, 'word': 'INA'}]
    """

    def _merge_objs(obj_list):
        merged_word = "".join([o['word'].replace('▁', '') for o in obj_list])
        real_start = obj_list[0]['start'] + 1 # The +1 is to avoid the underscore
        if real_start == 1: real_start = 0 # For some reason the first underscore is not counted...
        real_end = obj_list[-1]['end']
        real_entity = obj_list[0]['entity']
        scores = [o['score'] for o in obj_list]
        real_score = sum(scores) / len(scores)
        return {'start': real_start, 'end': real_end, 'entity': real_entity, 'score': real_score, 'text': merged_word}


    if len(prediction_list) == 0: return []
    unified_predictions= []
    tmp_unif = []
    for pred_obj in sorted(prediction_list, key=lambda x: x['index']):
        if pred_obj['word'].startswith('▁'):
            if len(tmp_unif) > 0:
                unified_predictions.append(_merge_objs(tmp_unif)) 
                tmp_unif = []
            tmp_unif.append(pred_obj)
        else:
            tmp_unif.append(pred_obj)
    if len(tmp_unif) > 0: unified_predictions.append(_merge_objs(tmp_unif))
    # print("\nUNIFIED:")
    # [print(x) for x in unified_predictions]
    return unified_predictions


def _unify_bio_labels(prediction_list: List) -> List:
    tmp_obj = {}
    unified_predictions = []
    if len(prediction_list) == 0: return []
    for pred in sorted(prediction_list, key=lambda x: x['start']):
        if "B-" in pred['entity']:
            if len(tmp_obj) == 0:
                tmp_obj = {'start': pred['start'], 'end': pred['end'], 'entity': pred['entity'].replace("B-", ""), 'score': pred['score'], 'text': pred['text']}
            else:
                unified_predictions.append(tmp_obj)
                tmp_obj = pred
                tmp_obj['entity'] = pred['entity'].replace("B-", "")
        if "I-" in pred['entity'] and len(tmp_obj) > 0:
            tmp_obj['end'] = pred['end']
            tmp_obj['score'] = mean([tmp_obj['score'], pred['score']])
            tmp_obj['text'] += " " + pred['text']
    
    if len(tmp_obj) > 0: unified_predictions.append(tmp_obj)
    # print("\nUNIFIED BIO:")
    # [print(x) for x in unified_predictions]
    return unified_predictions



def get_token_offset_mapping(doc_text: str, doc_tokens: List[str]) -> List[Dict]:
    # Get Token <--> Offset Mapping
    accum_ini = 0
    tok2id = {}
    token_objects = []
    for i, token in enumerate(doc_tokens):
        token_init = str.find(doc_text[accum_ini:], token)
        offset = accum_ini + token_init
        task_tok = {
                    "startOff": offset,
                    "endOff": offset + len(token),
                    "id":	i,
                    "text": token
                    }
        tok2id[f'{offset}_{token}'] = i
        accum_ini = offset + len(token)
        token_objects.append(task_tok)
    return token_objects


def _make_standard(prediction_list: List) -> List:
    """
     Return an standardized List that will be assigned to the key "model_predictions" like:
        {"model_predictions": [
            {"start": 0, "end": 7, "entity": "B-LOC", "score": 0.9830996692180634, "word": "GLASGOW"}
        ]
        }
    """
    all_predictions = []
    standard_predictions = []
    for sentence in prediction_list:
        standard_predictions = []
        for pred in sentence['entities']:
            for label in pred['labels']:
                new_pred = {'start': pred['start_pos'], 'end': pred['end_pos'], 'entity': label['value'], "score": label['confidence'], "text": pred['text']}
                standard_predictions.append(new_pred)
        all_predictions.append(standard_predictions)
    return all_predictions



def get_feature_dict(dataset, feature_name):
    feat_dict = {}
    for tag_name in dataset.features[feature_name].feature.names:
        feat_dict[dataset.features[feature_name].feature.str2int(tag_name)] = tag_name
    return feat_dict


def flair_predict_ner(text_batch, tagger, splitter=None):
    output_batch = []
    for text in text_batch:
        if splitter:
            sentences = splitter.split(text)
        else:
            sentences = [Sentence(sent) for sent in text]
        tagger.predict(sentences)
        stringified_sents = []
        for sentence in sentences:
            tmp = sentence.to_dict(tag_type='ner')
            for e in tmp['entities']:
                e['labels'] = [{"value": l.value, "confidence": l.score} for l in e['labels']]
            stringified_sents.append(tmp)
        output_batch.append(_make_standard(stringified_sents))
    return output_batch


def roberta_predict_ner(text_batch, nlp):
    per_sentence_results = []
    for text in text_batch:
        ner_results = nlp(text)
        wp_unified = _unify_wordpiece_predictions(ner_results)
        per_sentence_results.append(_unify_bio_labels(wp_unified))
    return per_sentence_results


def stanza_predict_ner(sentences: List[str], nlp: stanza.Pipeline):
    if len(sentences) == 0: return []
    predictions = []
    docs = nlp([stanza.Document([], text=s) for s in sentences])
    for doc in docs:
        doc_ents = []
        for ent in doc.entities:
            doc_ents.append({'start': ent.start_char, 'end': ent.end_char, 'entity': ent.type, "score": -1, "text": ent.text})
        predictions.append(doc_ents)
    return predictions


def generate_viz_json(dataset, output_fname, main_fields, prediction_fields, include_gold_features, feature_dicts):
    with open(output_fname, "w") as fout:
        for example in dataset:
            writable_example = {}
            for feat in example.keys():
                if feat in prediction_fields:
                    writable_example[feat] = example[feat]
                elif feat in main_fields:
                    writable_example[feat] = example[feat]
                elif feat in include_gold_features:
                    feat_dict = feature_dicts[feat]
                    writable_example[feat] = [feat_dict[f] for f in example[feat]] # convert feature indices to feature strings
                else:
                    pass
            fout.write(f"{json.dumps(writable_example)}\n")