from flask import Flask, request, jsonify, render_template
import json
import numpy as np
import pickle
import random
import nltk
from nltk.stem import WordNetLemmatizer
from tensorflow.keras.models import load_model
import speech_recognition as sr
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Add this line

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'  # Suppress TensorFlow warnings

# Initialize speech recognizer
recognizer = sr.Recognizer()

lemmatizer = WordNetLemmatizer()

# Load the data and model
with open('intents.json', 'r', encoding='utf-8') as f:
    intents = json.load(f)

words = pickle.load(open('words.pkl', 'rb'))
classes = pickle.load(open('classes.pkl', 'rb'))
model = load_model('my_model.h5')

#####################################
# Utility functions
#####################################

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words_list):
    sentence_words = clean_up_sentence(sentence)
    bag = [0]*len(words_list)
    for s in sentence_words:
        for i, w in enumerate(words_list):
            if w == s:
                bag[i] = 1
    return np.array(bag)

def predict_class(sentence):
    bow_vec = bow(sentence, words)
    res = model.predict(np.array([bow_vec]))[0]
    ERROR_THRESHOLD = 0.25
    results = [(i, r) for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(ints, intents_json):
    # If no high-confidence intent, fallback to 'Unknown'
    if len(ints) == 0:
        return random_response("Unknown", intents_json), None, None

    tag = ints[0]['intent']
    for i in intents_json['intents']:
        if i['tag'] == tag:
            # pick random response
            result = random.choice(i['responses'])
            suggestion = i.get('suggestion', None)
            doctor_link = i.get('doctor_link', None)
            
            return result, doctor_link, suggestion

    return random_response("Unknown", intents_json), None, None

def random_response(tag, intents_json):
    for i in intents_json['intents']:
        if i['tag'] == tag:
            return random.choice(i['responses'])
    return "I'm not sure about that."

#####################################
# Flask Routes
#####################################


@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get_response', methods=['POST'])
def get_bot_response():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid request format"}), 400
            
        user_message = data['message']
        print(f"Received message: {user_message}")  # Add server-side logging
        
        ints = predict_class(user_message)
        response, doc_link, suggestion = get_response(ints, intents)
        
        return jsonify({
            "response": response,
            "suggestion": suggestion,
            "doctor_link": doc_link
        })
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    

@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        audio_file = request.files['audio']
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            
            ints = predict_class(text)
            response, doc_link, suggestion = get_response(ints, intents)
            
            return jsonify({
                "response": response,
                "suggestion": suggestion,
                "doctor_link": doc_link
            })
    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    import logging
    logging.basicConfig(level=logging.ERROR)  # Reduce verbosity
    app.run(debug=True, use_reloader=False)  # Disable auto-reloader messages