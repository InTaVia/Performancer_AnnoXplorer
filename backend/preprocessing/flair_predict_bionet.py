import datasets
from flair.models import SequenceTagger
from transformers import AutoTokenizer, AutoModelForTokenClassification
from transformers import pipeline
import stanza
import utils as ut

if __name__ == "__main__":
    data_source_name = 'backend/data/bionet_sample.jsonl'
    flair_model = "flair/ner-dutch-large" # "flair/ner-dutch-large" | "flair/ner-english-ontonotes-large" | "ner-ontonotes-fast"
    roberta_model_name = "Davlan/xlm-roberta-large-ner-hrl"
    stanza_model = "/home/jdazaareva/stanza_resources/"
    output_fname = "backend/data/bionet_sample_predictions.jsonl"
    sample_data_size = -1
    batch_size = 8

    # Load Flair NER Tagger
    tagger = SequenceTagger.load(flair_model)

    # Load RoBERTa Tagger
    tokenizer = AutoTokenizer.from_pretrained(roberta_model_name)
    model = AutoModelForTokenClassification.from_pretrained(roberta_model_name)
    rob_nlp = pipeline("ner", model=model, tokenizer=tokenizer)

    # Load Stanza Pipeline
    stanza_nlp = stanza.Pipeline(lang="nl", processors='tokenize,lemma,pos,ner', model_dir=stanza_model, tokenize_no_ssplit=True)

    # Load the selected Dataset
    my_dataset = datasets.load_dataset('json', data_files=data_source_name)['train']

    if sample_data_size > 0:
        my_dataset = my_dataset.select(indices=list(range(sample_data_size)))
    print(my_dataset)

    # Add a column 'model_predictions' containing the Flair NER predictions
    my_dataset = my_dataset.map(lambda examples: {"predictions_flair": ut.flair_predict_ner(examples['text_sentences'], tagger)}, batched=True, batch_size=batch_size)
    my_dataset = my_dataset.map(lambda examples: {"predictions_roberta": ut.roberta_predict_ner(examples['text_sentences'], rob_nlp)}, batched=False)
    my_dataset = my_dataset.map(lambda examples: {"predictions_stanza": ut.stanza_predict_ner(examples['text_sentences'], stanza_nlp)}, batched=False)

    # Generate the JSON file that will be read for visualization
    ut.generate_viz_json(my_dataset, 
                         output_fname, 
                         main_fields=['id_person', 'version', 'id_composed', 'source', 'name', 'text_clean', 'text_sentences'],
                         prediction_fields=["predictions_flair", "predictions_roberta", "predictions_stanza"],
                         include_gold_features=[], 
                         feature_dicts={})