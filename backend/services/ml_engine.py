def run_prediction(data):

    if hasattr(data, "model_dump"):
        data = data.model_dump()
    elif hasattr(data, "dict"):
        data = data.dict()

    score = 0

    if data.get("fever"):
        score += 30
    if data.get("cough"):
        score += 20
    if data.get("fatigue"):
        score += 25
    if data.get("age", 0) > 50:
        score += 15

    if score > 70:
        risk = "high"
        prediction = "severe_risk_condition"
    elif score > 40:
        risk = "medium"
        prediction = "moderate_risk_condition"
    else:
        risk = "low"
        prediction = "normal"

    return {
        "prediction": prediction,   # ✅ REQUIRED FIX
        "risk_score": score,
        "risk_level": risk,
        "model_used": "rule_based_v1"
    }