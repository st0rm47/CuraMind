"""
app/services/ml_engine.py

ML Prediction Engine
====================
Currently uses statistical mock functions.
To plug in your real models, follow the comments marked with ⚡.

Example with real XGBoost:
    import joblib, numpy as np
    diabetes_model = joblib.load("models/xgboost_diabetes.pkl")
    scaler = joblib.load("models/standard_scaler.pkl")
"""
import math
import random
from typing import Dict, Any, List
from schemas.patient import HealthParams


# ⚡ LOAD YOUR REAL MODELS HERE ─────────────────────────────────────────────────
# Uncomment and adjust paths once you have trained models:
#
# import joblib
# import numpy as np
# diabetes_model    = joblib.load("models/xgboost_diabetes.pkl")
# hypertension_model= joblib.load("models/rf_hypertension.pkl")
# heart_model       = joblib.load("models/nn_heart_disease.pkl")
# kidney_model      = joblib.load("models/svm_kidney.pkl")
# liver_model       = joblib.load("models/gb_liver.pkl")
# anemia_model      = joblib.load("models/lr_anemia.pkl")
# scaler            = joblib.load("models/standard_scaler.pkl")
#
# For real SHAP values:
# import shap
# diabetes_explainer = shap.TreeExplainer(diabetes_model)
# ─────────────────────────────────────────────────────────────────────────────


def _clamp(value: float, lo: float = 0.0, hi: float = 97.0) -> int:
    return max(int(lo), min(int(hi), round(value)))


def _noise(scale: float = 4.0) -> float:
    """Small deterministic-ish noise for mock realism."""
    return (random.random() - 0.5) * scale


def _build_feature_vector(p: HealthParams) -> List[float]:
    """
    Returns a flat feature list in a consistent order.
    ⚡ Use this same order when training your real models.
    """
    bmi = p.bmi
    return [
        p.age,
        bmi,
        p.glucose,
        p.systolic_bp,
        p.diastolic_bp,
        p.cholesterol,
        p.hemoglobin,
        p.creatinine,
        p.wbc_count,
        p.platelet_count,
        1 if p.smoking_status == "yes" else (0.5 if p.smoking == "former" else 0),
        1 if p.alcohol_consumption in ("moderate", "heavy") else 0,
        1 if p.physical_activity in ("none", "light") else 0,
        1 if p.gender == "M" else 0,
        1 if p.family_history in ("diabetes", "multiple") else 0,
        1 if p.family_history in ("heart", "multiple") else 0,
    ]


def _mock_predictions(p: HealthParams) -> Dict[str, int]:
    """
    Statistical mock predictions — replace each line with your real model call.
    ⚡ Example replacement for diabetes:
        features_scaled = scaler.transform([_build_feature_vector(p)])
        diabetes = round(diabetes_model.predict_proba(features_scaled)[0][1] * 100)
    """
    bmi = p.bmi
    age_f = p.age / 80.0
    fhist = p.family_history

    diabetes = _clamp(
        (p.glucose / 180) * 42
        + (bmi / 35) * 22
        + age_f * 18
        + (8 if fhist in ("diabetes", "multiple") else 0)
        + (6 if p.smoking_status == "yes" else 0)
        + _noise()
    )


    heart_disease = _clamp(
        (p.cholesterol / 280) * 38
        + age_f * 32
        + (bmi / 35) * 10
        + (12 if p.smoking_status == "yes" else 0)
        + (8 if fhist in ("heart", "multiple") else 0)
        + _noise()
    )

    return {
        "diabetes": diabetes,
        "heartDisease": heart_disease,
    }


def _compute_shap(p: HealthParams, predictions: Dict[str, int]) -> List[Dict[str, Any]]:
    """
    Mock SHAP values — sign and magnitude estimated from domain knowledge.
    ⚡ Replace with:
        features_scaled = scaler.transform([_build_feature_vector(p)])
        shap_vals = diabetes_explainer.shap_values(features_scaled)[0]
        # Then map feature names to shap_vals array
    """
    bmi = p.bmi
    hb_low = 13.5 if p.gender == "M" else 12.0

    factors = [
        {
            "feature": "Blood Glucose",
            "value": round(p.glucose, 1),
            "unit": "mg/dL",
            "impact": round((p.glucose - 100) / 150 * 32, 1),
            "direction": "risk" if p.glucose > 100 else "protective",
            "normal_range": "70–100 mg/dL (fasting)",
        },
        {
            "feature": "BMI",
            "value": bmi,
            "unit": "",
            "impact": round((bmi - 22) / 18 * 24, 1),
            "direction": "risk" if bmi > 25 else "protective",
            "normal_range": "18.5–24.9",
        },
        {
            "feature": "Systolic BP",
            "value": round(p.systolic_bp, 0),
            "unit": "mmHg",
            "impact": round((p.systolic_bp - 120) / 60 * 20, 1),
            "direction": "risk" if p.systolic_bp > 120 else "protective",
            "normal_range": "< 120 mmHg",
        },
        {
            "feature": "Age",
            "value": p.age,
            "unit": "yrs",
            "impact": round((p.age / 80) * 16, 1),
            "direction": "risk",
            "normal_range": "N/A",
        },
        {
            "feature": "Cholesterol",
            "value": round(p.cholesterol, 0),
            "unit": "mg/dL",
            "impact": round((p.cholesterol - 200) / 100 * 14, 1),
            "direction": "risk" if p.cholesterol > 200 else "protective",
            "normal_range": "< 200 mg/dL",
        },
        {
            "feature": "Hemoglobin",
            "value": round(p.hemoglobin, 1),
            "unit": "g/dL",
            "impact": round((hb_low - p.hemoglobin) / hb_low * 18, 1),
            "direction": "risk" if p.hemoglobin < hb_low else "protective",
            "normal_range": "M: 13.5–17.5 · F: 12–15.5 g/dL",
        },
        {
            "feature": "Creatinine",
            "value": round(p.creatinine, 2),
            "unit": "mg/dL",
            "impact": round((p.creatinine - 1.0) / 3.5 * 20, 1),
            "direction": "risk" if p.creatinine > 1.2 else "protective",
            "normal_range": "0.7–1.2 mg/dL",
        },
        {
            "feature": "Smoking",
            "value": p.smoking_status,
            "unit": "",
            "impact": 12 if p.smoking_status == "current" else (0.5 if p.smoking_status == "former" else 0),
            "direction": "risk" if p.smoking_status != "never" else "protective",
            "normal_range": "Non-smoker",
        },
        {
            "feature": "Physical Activity",
            "value": p.physical_activity,
            "unit": "",
            "impact": -8 if p.physical_activity == "active" else -4 if p.physical_activity == "moderate" else 6 if p.physical_activity == "none" else 2,
            "direction": "protective" if p.physical_activity in ("active", "moderate") else "risk",
            "normal_range": "≥ 150 min/week",
        },
    ]

    return sorted(factors, key=lambda x: abs(x["impact"]), reverse=True)


def run_prediction(p: HealthParams) -> Dict[str, Any]:
    """
    Main entry point — called from the API route.
    Returns a dict that gets stored in Assessment.predictions etc.
    """
    predictions = _mock_predictions(p)
    shap_values = _compute_shap(p, predictions)

    return {
        "predictions": predictions,
        "shap_values": shap_values,
        "bmi": p.bmi,
        "risk_level": "high" if predictions["diabetes"] > 70 else "medium" if predictions["diabetes"] > 40 else "low",
        "ensemble_confidence": round(87 + random.random() * 8, 1),
        "preprocessing": "Z-score normalisation → SMOTE → Feature selection (top 15)",
    }
