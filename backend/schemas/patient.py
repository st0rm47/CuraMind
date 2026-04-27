# This file contains the schemas for patient-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from typing import Optional

from pydantic import BaseModel, Field, model_validator

class HealthParams(BaseModel):
    age : int = Field(..., ge=1, le=120, description="Age of the patient")                          # Age in years (1-120)
    gender : str = Field(..., pattern="^(male|female|other)$")                                      # Gender of the patient
    weight : float = Field(..., ge=20.0, le=300.0, description="kg")                                # Weight in kilograms (20-300 kg)
    height : float = Field(..., ge=50.0, le=250.0, description="cm")                                # Height in centimeters (50-250 cm) 
    
    glucose : float = Field(..., ge=50.0, le=500.0, description="Blood glucose level in mg/dL")              # Blood glucose level in mg/dL (50-500 mg/dL)
    cholesterol : float = Field(..., ge=100.0, le=600.0, description="Cholesterol level in mg/dL")             # Cholesterol level in mg/dL (100-600 mg/dL)

    # Parameters for diabetes prediction model
    hemoglobin: float = Field(..., ge=5.0, le=25.0, description="Hemoglobin level in g/dL")                 # Hemoglobin level in g/dL (5-25 g/dL)  
    wbc_count: float = Field(..., ge=1000.0, le=30000.0, description="White blood cell count in 10^9/L")    # White blood cell count in 10^9/L (1000-30000 10^9/L)
    creatinine: float = Field(..., ge=0.3, le=15.0, description="Creatinine level in mg/dL")                # Creatinine level in mg/dL (0.3-15 mg/dL)
    platelet_count: float = Field(..., ge=10000.0, le=800000.0, description="Platelet count in 10^9/L")     # Platelet count in 10^9/L (10000-800000 10^9/L)
    
    
    # Lifestyle and family history parameters
    smoking_status: str = Field(..., pattern="^(never|former|current)$", description="Smoking status of the patient")                       # Smoking status of the patient (never, former, current)
    alcohol_consumption: str = Field(..., pattern="^(none|occasional|moderate|high)$", description="Alcohol consumption of the patient")    # Alcohol consumption of the patient (none, occasional, moderate, high)
    physical_activity: str = Field(..., pattern="^(none|light|moderate|high)$", description="Physical activity level of the patient")       # Physical activity level of the patient (none, light, moderate, high)
    family_history: str = Field(..., pattern="^(none|diabetes|heart_disease|both)$", description="Family history of the patient")           # Family history of the patient (none, diabetes, heart_disease, both)
    symptoms: Optional[str] = Field(None, description="Symptoms reported by the patient")                                                   # Symptoms reported by the patient (optional, can be added later)
    
    
    # Additional parameters for heart disease prediction model
    chest_pain_type: str = Field(..., pattern="^(TA|ATA|NAP|ASY)$", description="Type of chest pain experienced by the patient")    # Type of chest pain (TA, ATA, NAP, ASY)
    resting_ecg: str = Field(..., pattern="^(ST|Normal|LVH)$", description="Resting electrocardiographic results")    # Resting electrocardiographic results (0, 1, 2)
    resting_bp: float = Field(..., ge=0.0, le=300.0, description="Resting blood pressure in mmHg")    # Resting blood pressure in mmHg (0-300 mmHg)
    st_slope: str = Field(..., pattern="^(Up|Flat|Down)$", description="Slope of the peak exercise ST segment")    # Slope of the peak exercise ST segment (upsloping, flat, downsloping)
    exercise_angina: str = Field(..., pattern="^(Y|N)$", description="Exercise-induced angina")    # Exercise-induced angina (yes, no)
    fasting_bs: int = Field(..., ge=50, le=100, description="Fasting blood sugar level in mg/dL")    # Fasting blood sugar level in mg/dL (50-100 mg/dL)
    max_hr: float = Field(..., ge=0.0,le=220.0, description="Maximum heart rate achieved during exercise")
    oldpeak: float = Field(..., ge=0.0, le=6.0, description="ST depression induced by exercise relative to rest")

 
    
    # BMI Calculation as a property
    @property
    def bmi(self) -> float:
        """Calculate and return the Body Mass Index (BMI) of the patient."""
        height_in_meters = self.height / 100.0                  # Convert height from cm to meters
        bmi_value = self.weight / (height_in_meters ** 2)       # BMI formula: weight (kg) / height (m)^2
        return round(bmi_value, 2)                              # Return BMI rounded to 2 decimal places
    
    