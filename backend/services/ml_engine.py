def predict_disease_risk(data: dict):
    """
    Dummy ML model (we will replace with real ML later)
    """

    score = 0

    # Example logic (you will replace later with sklearn model)
    if data.get("fever"):
        score += 30
    if data.get("cough"):
        score += 20
    if data.get("fatigue"):
        score += 25
    if data.get("age", 0) > 50:
        score += 15

    if score > 70:
        risk = "High"
    elif score > 40:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "risk_score": score,
        "risk_level": risk
    }