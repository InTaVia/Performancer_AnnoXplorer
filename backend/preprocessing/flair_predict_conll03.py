from datasets import load_dataset
from flair.models import SequenceTagger
import utils as ut

if __name__ == "__main__":

    # Experiment Settings (changing them manually for now...)
    data_source_name = 'conll2003' #conllpp | or any dataset in transformers dataset library ...
    data_split = 'test' # train | validation | test
    flair_model = "flair/ner-english" # "flair/ner-dutch" | "flair/ner-english-ontonotes-large" | "ner-ontonotes-fast"
    output_fname = f"backend/data/flair_predictions_{flair_model.replace('/','-')}_{data_source_name}.jsonl"
    sample_data_size = 10 # -1 to get all data available in the dataset
    batch_size = 16

    # Load Flair NER Tagger
    tagger = SequenceTagger.load(flair_model)

    # Load the selected Dataset
    my_dataset = load_dataset(data_source_name, split=data_split)
    if sample_data_size > 0:
        my_dataset = my_dataset.select(indices=list(range(sample_data_size)))
    print(my_dataset)

    # Add a column 'text' containing the tokens as a string
    my_dataset = my_dataset.map(lambda examples: {'text': [" ".join(ex) for ex in examples['tokens']]}, batched=True, batch_size=batch_size)
    # Add a column 'model_predictions' containing the Flair NER predictions
    my_dataset = my_dataset.map(lambda examples: {"model_predictions": ut.flair_predict_ner(examples['tokens'], tagger)}, batched=True, batch_size=batch_size)

    # Generate the JSON file that will be read for visualization
    include_gold_features=['pos_tags', 'chunk_tags', 'ner_tags']
    ut.generate_viz_json(my_dataset,
                         output_fname, 
                         main_fields=['id', 'tokens', 'text'],
                         prediction_fields=["model_predictions"],
                         include_gold_features=include_gold_features, 
                         feature_dicts={feat_name: ut.get_feature_dict(my_dataset, feat_name) for feat_name in include_gold_features})

    