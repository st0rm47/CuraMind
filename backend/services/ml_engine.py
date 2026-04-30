from collections import defaultdict
import json

import joblib
import numpy as np
import pandas as pd
import shap

from schemas.patient import HealthParams

import joblib
import pandas as pd

model = joblib.load("services/heart_disease_model.pkl")
feature_names = joblib.load("services/heart_feature_names.pkl")


# Helper function to build input dictionary for heart disease prediction model
def build_heart_input(p):
    return {
        "Age": float(p.age),
        "Sex": "Male" if p.gender.lower() == "male" else "Female",
        "ChestPainType": str(p.chest_pain_type),
        "RestingBP": float(p.resting_bp),
        "Cholesterol": float(p.cholesterol),
        "FastingBS": int(p.fasting_bs),
        "RestingECG": str(p.resting_ecg),
        "MaxHR": float(p.max_hr),
        "ExerciseAngina": p.exercise_angina,  # KEEP "Y"/"N" ONLY
        "Oldpeak": float(p.oldpeak),
        "ST_Slope": str(p.st_slope)
    }


FEATURE_LABELS = {
    "cat__Sex_M": "Gender",
    "cat__Sex_F": "Gender",
    
    "cat__ChestPainType_ASY": "Chest Pain Type",
    "cat__ChestPainType_ATA": "Chest Pain Type",
    "cat__ChestPainType_NAP": "Chest Pain Type",
    "cat__ChestPainType_TA": "Chest Pain Type",

    "cat__RestingECG_Normal": "Resting ECG",
    "cat__RestingECG_ST": "Resting ECG",

    "cat__ExerciseAngina_Y": "Exercise-Induced Angina",

    "cat__ST_Slope_Flat": "ST Segment Slope",
    "cat__ST_Slope_Up": "ST Segment Slope",

    "num__Age": "Age",
    "num__RestingBP": "Resting Blood Pressure",
    "num__Cholesterol": "Cholesterol",
    "num__FastingBS": "Fasting Blood Sugar",
    "num__MaxHR": "Maximum Heart Rate",
    "num__Oldpeak": "ST Depression",
}

VALUE_MAP = {
    "ChestPainType": {
        0: "Asymptomatic",
        1: "Atypical Angina",
        2: "Non-Anginal Pain",
        3: "Typical Angina",
    },
    "Sex": {0: "Female", 1: "Male"},
    "ExerciseAngina": {0: "No", 1: "Yes"},
    "RestingECG": {0: "Normal", 1: "ST", 2: "LVH"},
}

def decode_value(feature, val):
    val = clean_value(val)

    for key in VALUE_MAP:
        if key.lower() in feature.lower():
            try:
                return VALUE_MAP[key].get(int(val), val)
            except:
                return val

    return val

VALUE_TRANSLATIONS = {
    "ASY": "Asymptomatic",
    "ATA": "Atypical Angina",
    "NAP": "Non-Anginal Pain",
    "TA": "Typical Angina",

    "Y": "Yes",
    "N": "No",

    "Up": "Upward",
    "Flat": "Flat",
    "Down": "Downward",
}



# Function to get SHAP values for explainability of the heart disease prediction
# def get_shap_values(p):
#     input_dict = build_heart_input(p)
#     input_df = pd.DataFrame([input_dict])

#     # 🔥 STEP 1: transform using pipeline
#     X_transformed = model.named_steps["preprocessor"].transform(input_df)

#     # feature names after encoding
#     feature_names = model.named_steps["preprocessor"].get_feature_names_out()

#     # 🔥 STEP 2: use tree explainer on final model
#     explainer = shap.TreeExplainer(model.named_steps["model"])

#     shap_values = explainer.shap_values(X_transformed)

#     # class 1 (disease)
#     values = shap_values[0]

#     explanation = []

#     for name, val, impact in zip(feature_names, X_transformed[0], values):
#         explanation.append({
#             "feature": name,
#             "value": float(val),
#             "impact": round(float(np.array(impact)[0]), 4),
#             "effect": "increases risk" if impact > 0 else "decreases risk"
#         })

#     return explanation


# Function to run prediction and get risk level and recommendations based on the predicted probability of heart disease
def predict_heart(p):

    input_dict = build_heart_input(p)

    input_df = pd.DataFrame([input_dict])

    prob = model.predict_proba(input_df)[0][1] * 100

    return prob


import numpy as np

def clean_value(v):
    if isinstance(v, (np.float64, np.float32, np.int64, np.int32)):
        return float(v)
    return v

def get_shap_values(p):

    input_dict = build_heart_input(p)
    input_df = pd.DataFrame([input_dict])

    preprocessor = model.named_steps["preprocessor"]
    clf = model.named_steps["model"]

    X_transformed = preprocessor.transform(input_df)
    feature_names = preprocessor.get_feature_names_out()

    explainer = shap.TreeExplainer(clf)
    shap_values = explainer.shap_values(X_transformed)

    values = np.array(shap_values)

    # handle binary classification
    if values.ndim == 3:
        values = values[:, :, 1]

    values = values[0]
    explanations = []
    grouped = defaultdict(lambda: {
        "feature": "",
        "value": None,
        "impact": 0.0,
        "effect": ""
    })

    for name, val, impact in zip(feature_names, X_transformed[0], values):

        impact_value = float(np.ravel(impact)[0])
        readable_name = FEATURE_LABELS.get(name, name)
        decoded_value = decode_value(name, val)

        if grouped[readable_name]["feature"] == "":
            grouped[readable_name]["feature"] = readable_name
            grouped[readable_name]["value"] = decoded_value

        grouped[readable_name]["impact"] += impact_value
        
    
    for item in grouped.values():
        explanations.append({
            "feature": item["feature"],
            "value": item["value"],
            "impact": round(item["impact"], 4),
            "effect": "increases risk" if item["impact"] > 0 else "decreases risk"
        })
        
    # sort by importance
    explanations = sorted(explanations, key=lambda x: abs(x["impact"]), reverse=True)

    # limit top 5
    return explanations

# Run prediction and get risk level and recommendations based on the predicted probability of heart disease
def run_prediction(p):
    input_dict = build_heart_input(p)
    input_df = pd.DataFrame([input_dict])

    prob = float(model.predict_proba(input_df)[0][1] * 100)

    if prob >= 65:
        risk_level = "high"
    elif prob >= 35:
        risk_level = "medium"
    else:
        risk_level = "low"

    recommendations = recommend_lifestyle_changes(risk_level)

    explanations = get_shap_values(p)
    return {
        "prediction": {
            "heart_disease": {
                "disease_name": "Heart Disease",
                "probability": round(prob, 2),
                "risk_level": risk_level,
            }
        },
        "risk_level": risk_level,
        "confidence": round(float(prob), 2),
        "key_factors": explanations,
        "recommendations": recommendations,
        "model": "Random Forest (CuraMind Heart Model)"
    }
    
    
# Function to recommend lifestyle changes based on the predicted risk level of heart disease
def recommend_lifestyle_changes(risk_level):
    if risk_level == "high":
        return [
            "Adopt a heart-healthy diet rich in fruits, vegetables, and whole grains.",
            "Engage in regular physical activity, aiming for at least 150 minutes of moderate exercise per week.",
            "Quit smoking and avoid exposure to secondhand smoke.",
            "Manage stress through techniques like meditation, yoga, or deep breathing exercises.",
            "Limit alcohol consumption to moderate levels."
        ]
    elif risk_level == "medium":
        return [
            "Maintain a balanced diet with plenty of fruits and vegetables.",
            "Incorporate regular physical activity into your routine.",
            "Avoid smoking and limit alcohol intake.",
            "Monitor your blood pressure and cholesterol levels regularly.",
            "Manage stress effectively."
        ]
    else:
        return [
            "Continue to eat a healthy diet and stay active.",
            "Avoid smoking and limit alcohol consumption.",
            "Regularly monitor your heart health and consult with your doctor as needed."
        ]
