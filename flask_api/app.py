from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from flask import render_template


app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# Load model and tokenizer
model_path = './model'
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    description = data['description']

    inputs = tokenizer(description, return_tensors='pt', truncation=True, padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        predicted_index = outputs.logits.squeeze().item()

    return jsonify({'sustainability_index': round(predicted_index, 2)})

if __name__ == '__main__':
    app.run(debug=True)
