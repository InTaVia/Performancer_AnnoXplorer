from collections import defaultdict
import json, os
from typing import Any, Dict, List
from pathlib import Path

FILE_TO_CONVERT = Path("../data/bionet_sample.jsonl")
AX_DATA_PATH = Path("../data/anno_xplorer_format/")
AX_DATA_PATH_SENT = Path("../data/anno_xplorer_format/sentences/")
AX_DATA_PATH_DOC = Path("../data/anno_xplorer_format/doc/")

NE_TO_COLOR = {"PER": "#b6f2c6", "ORG": "#c480ff", "LOC": "#e6acac", "MISC": "#c48007"}


def get_json_dataset(filepath):
    with filepath.open() as f:
        for line in f.readlines():
            yield json.loads(line)


def get_tokens_in_char_range(
    span_start: int, span_end: int, char_start2token: Dict[int, str]
):
    tokens_in_span = []
    for start_ix, tok_id in char_start2token.items():
        if start_ix >= span_start and start_ix < span_end:
            tokens_in_span.append(tok_id)
    return tokens_in_span


def create_annoxplorer_sentence_task(
    text_tokens: List[str], all_annotations_dict: Dict[int, List]
) -> Dict:
    # Create Empty AnnoXplorer Task
    task_template = {
        "size": len(all_annotations_dict.keys()),
        "users": list(all_annotations_dict.keys()),
        "tokens": [],
        "userAnnotations": [],
    }
    # Populate Tokens
    token2char = {}
    char_offset = 0
    for i, tok in enumerate(text_tokens.split()):
        tok_start = char_offset
        tok_end = char_offset + len(tok)
        token2char[i + 1] = (
            tok_start,
            tok_end,
        )  # AnnoXplorer is 1-indexed. Makes it confusing to retrieve tokens from a list, but I keep it this way for coherence...
        task_template["tokens"].append(
            {"startOff": tok_start, "endOff": tok_end, "id": i + 1, "text": tok}
        )
        char_offset = (
            tok_end + 1
        )  # This text is tokenized, so we trust there is always a space between tokens =)
    # Populate annotations. All of them go in the same list, identified by their userNo
    char_start2token = {v[0]: k for k, v in token2char.items()}
    result = []
    for userNo, annotations in all_annotations_dict.items():
        for entity_info in annotations:
            label = entity_info["entity"]
            # Create Formatted Result of Annotations
            user_anno = {
                "annotationTokens": get_tokens_in_char_range(
                    entity_info["start"], entity_info["end"], char_start2token
                ),
                "annotationColor": NE_TO_COLOR.get(label, "#59b3ad"),
                "userNo": userNo,
                "annotationType": [label],
                "borderTokens": {"1leftTokenSafe": True, "2rightTokenSafe": True},
                "annotationText": entity_info["text"],
                "annotationChar": [entity_info["start"], entity_info["end"]],
            }
            result.append(user_anno)
    # Finally add the annotation to the Main Task Template
    task_template["userAnnotations"] = result
    return task_template


def create_annoxplorer_document_task(example: Dict[str, Any]) -> Dict:
    doc_tok_index, doc_char_offset = 0, 0
    token2char = {}

    # Create Empty AnnoXplorer Task
    task_template = {"size": 0, "users": [], "tokens": [], "userAnnotations": []}

    # Populate Tokens (Go through All Sentences of All documents)
    document_text_all = []
    sentence_offsets = [0]
    for sent in example["text_sentences"]:
        sent_char_offset = 0
        for tok in sent.split():
            # sentChar2docChar[sent_char_offset].append(doc_char_offset) # Assign Mapping Before updating offsets to contain the STARTs
            doc_tok_index += 1
            tok_start = doc_char_offset
            tok_end = doc_char_offset + len(tok)
            token2char[doc_tok_index] = (tok_start, tok_end, doc_char_offset)
            task_template["tokens"].append(
                {
                    "startOff": tok_start,
                    "endOff": tok_end,
                    "id": doc_tok_index,
                    "text": tok,
                }
            )
            sent_char_offset = sent_char_offset + len(tok) + 1
            doc_char_offset = tok_end + 1
            document_text_all.append(tok)
        sentence_offsets.append(doc_char_offset)
        # doc_char_offset += 1 # We concatenate the sentences into a "full text" also with ONE space

    # Populate Annotations. All of them go in the same list, identified by their userNo
    document_text_all = " ".join(document_text_all)
    if example["id_composed"] == "7944545_02":
        print(document_text_all)
        exit()
    char_start2token = {v[0]: k for k, v in token2char.items()}
    result = []
    for anno_sent_ix, (pred_flair, pred_roberta, pred_stanza) in enumerate(
        zip(
            example["predictions_flair"],
            example["predictions_roberta"],
            example["predictions_stanza"],
        )
    ):
        all_annotations_dict = {1: pred_flair, 2: pred_roberta, 3: pred_stanza}
        task_template["size"] = len(all_annotations_dict.keys())
        task_template["users"] = list(all_annotations_dict.keys())
        for userNo, annotations in all_annotations_dict.items():
            for entity_info in annotations:
                label = entity_info["entity"]
                doc_entity_start = entity_info["start"] + sentence_offsets[anno_sent_ix]
                span_len = entity_info["end"] - entity_info["start"]
                anno_token_indices = get_tokens_in_char_range(
                    doc_entity_start, doc_entity_start + span_len, char_start2token
                )
                if len(anno_token_indices) == 0:
                    continue
                doc_char_start = token2char[anno_token_indices[0]][0]
                doc_char_end = doc_char_start + span_len
                # Create Formatted Result of Annotations
                user_anno = {
                    "annotationTokens": anno_token_indices,
                    "annotationColor": NE_TO_COLOR.get(label, "#59b3ad"),
                    "userNo": userNo,
                    "annotationType": [label],
                    "borderTokens": {"1leftTokenSafe": True, "2rightTokenSafe": True},
                    "annotationText": entity_info["text"],
                    "annotationChar": [doc_char_start, doc_char_end],
                }
                result.append(user_anno)
    # Finally add the annotation to the Main Task Template
    task_template["userAnnotations"] = result
    return task_template


def convert(conv_sent, conv_doc):
    if Path(AX_DATA_PATH).is_dir() == False:
        AX_DATA_PATH.mkdir()
    if conv_sent:
        if Path(AX_DATA_PATH_SENT).is_dir() == False:
            AX_DATA_PATH_SENT.mkdir()
        for example in get_json_dataset(FILE_TO_CONVERT):
            sent_ix = 0
            for sent, pred_flair, pred_roberta, pred_stanza in zip(
                example["text_sentences"],
                example["predictions_flair"],
                example["predictions_roberta"],
                example["predictions_stanza"],
            ):
                task = create_annoxplorer_sentence_task(
                    sent,
                    all_annotations_dict={
                        1: pred_flair,
                        2: pred_roberta,
                        3: pred_stanza,
                    },
                )
                print(sent)
                with open(
                    f"{AX_DATA_PATH_SENT}/sentence_{example['id_composed']}_{sent_ix}.json",
                    "w",
                ) as fout:
                    fout.write(json.dumps(task))
                sent_ix += 1

    if conv_doc:
        # ############### UNCOMMENT THIS IF YOU WANT THE DOCUMENT-LEVEL JSON FILES ###############
        if Path(AX_DATA_PATH_DOC).is_dir() == False:
            AX_DATA_PATH_DOC.mkdir()

        for example in get_json_dataset(FILE_TO_CONVERT):
            task = create_annoxplorer_document_task(example)
            with open(
                f"{AX_DATA_PATH_DOC}/sentence_{example['id_composed']}.json", "w"
            ) as fout:
                fout.write(json.dumps(task))


# if __name__ == '__main__':
