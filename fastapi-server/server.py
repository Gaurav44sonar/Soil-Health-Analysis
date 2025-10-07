from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import pickle
import google.generativeai as genai

# ======================
# Initialize FastAPI App
# ======================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================
# Load Trained Artifacts
# ======================
with open("soil_health_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("label_encoder.pkl", "rb") as le_file:
    label_encoder = pickle.load(le_file)

with open("scaler.pkl", "rb") as scaler_file:
    scaler = pickle.load(scaler_file)

with open("selected_features.pkl", "rb") as f:
    selected_features = pickle.load(f)

# ======================
# Configure Gemini
# ======================
genai.configure(api_key="AIzaSyDqBcpr7zbqYlgyKaTA_wFKPr6fUTUM3dU")  # replace with your real key
gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")

# ======================
# Define Input Schema
# ======================
class SoilData(BaseModel):
    Soil_Moisture: float
    Soil_Temperature: float
    Humidity: float
    Light_Intensity: float
    Soil_pH: float
    Nitrogen_Level: float
    Phosphorus_Level: float
    Potassium_Level: float
    Electrochemical_Signal: float
    Nutrient_Balance: float


# ======================
# Prediction + AI Recommendations
# ======================
@app.post("/predict")
async def predict_soil_health(data: SoilData):
    try:
        # Step 1: Prepare input
        input_df = pd.DataFrame([data.model_dump()])
        input_df = input_df[selected_features]
        input_scaled = scaler.transform(input_df)

        # Step 2: Predict
        prediction = model.predict(input_scaled)[0]
        predicted_status = label_encoder.inverse_transform([prediction])[0]

        # Step 3: Create AI prompt
        prompt = f"""
        You are an expert in soil health and sustainable agriculture.
        My soil health prediction result is "{predicted_status}".

        Here are my soil parameters:
        - Soil Moisture: {data.Soil_Moisture}
        - Soil Temperature: {data.Soil_Temperature}°C
        - Humidity: {data.Humidity}%
        - Light Intensity: {data.Light_Intensity}
        - Soil pH: {data.Soil_pH}
        - Nitrogen Level: {data.Nitrogen_Level}
        - Phosphorus Level: {data.Phosphorus_Level}
        - Potassium Level: {data.Potassium_Level}
        - Electrochemical Signal: {data.Electrochemical_Signal}
        - Nutrient Balance: {data.Nutrient_Balance}

        Please provide:
        1. Soil Health Diagnosis
        2. Actionable Improvement Tips
        3. Fertilizer Recommendations
        4. Sustainable Farming Practices
        5. Crop Suggestions suitable for this soil.
        6. Provide the response in under 200 words
        """

        # Step 4: Get AI recommendations
        response = gemini_model.generate_content(prompt)
        recommendations = response.text if response and response.text else "AI model did not return recommendations."

        # Step 5: Return result
        return {
            "plant_health_status": str(predicted_status),
            "recommendations": recommendations
        }

    except Exception as e:
        return {"error": str(e)}


# ======================
# Run Server
# ======================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
