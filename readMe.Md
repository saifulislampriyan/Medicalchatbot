# 🧠 AI Medical Chatbot with Voice Assistance

An intelligent NLP-based medical chatbot capable of understanding user symptoms, predicting possible conditions, and providing suggestions along with doctor references. The system also supports **voice input** for a more interactive user experience.

---

## 📌 Overview

This project implements a **deep learning-based conversational AI system** designed for basic healthcare assistance. It processes user input (text or voice), predicts the most relevant medical condition using a trained neural network, and returns appropriate responses, suggestions, and doctor recommendations.

The system is built using **Natural Language Processing (NLP)** and **TensorFlow-based neural networks**, integrated into a **Flask web application**.

---

## 🚀 Features

- 💬 Text-based chatbot interaction  
- 🎤 Voice input support using Speech Recognition  
- 🧠 Deep learning intent classification model  
- 🏥 Disease prediction based on symptoms  
- 🔗 Doctor recommendation links  
- 💡 Health suggestions for each condition  
- 🌐 Web-based interface using Flask  

---

## 🧠 Methodology

### 1. Data Preparation
- Dataset defined in `intents.json`  
- Includes symptoms (patterns), disease tags, responses, suggestions, and doctor links  

---

### 2. Text Processing
- Tokenization using NLTK  
- Lemmatization for normalization  
- Bag-of-Words representation  

---

### 3. Model Training
- Neural Network Architecture:
  - Dense layers (256 → 128 → output)
  - Dropout for regularization  
- Activation:
  - ReLU (hidden layers)
  - Softmax (output layer)  

- Output files:
  - `my_model.h5`
  - `words.pkl`
  - `classes.pkl`

---

### 4. Prediction System
- Converts input → Bag of Words  
- Predicts intent using trained model  
- Returns:
  - Response  
  - Suggestion  
  - Doctor link  

---

### 5. Voice Processing
- Uses SpeechRecognition  
- Converts speech → text → prediction  

---

## 🛠️ Technologies Used

- Python  
- Flask  
- TensorFlow / Keras  
- NLTK  
- NumPy  
- SpeechRecognition  
