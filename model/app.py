from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# Initialize FastAPI app
app = FastAPI()

# Load model, encoders, and dataset
try:
    model = joblib.load('model.joblib')
    label_encoders = joblib.load('encoders.joblib')
    df_cleaned = pd.read_csv('cleaned_data.csv')
except FileNotFoundError as e:
    raise FileNotFoundError(f"Missing file: {str(e)}. Ensure 'model.joblib', 'encoders.joblib', and 'cleaned_data.csv' are in the project root.")

# Verify required columns in cleaned_data.csv
required_columns = ['City', 'Price_per_sqm']
for col in required_columns:
    if col not in df_cleaned.columns:
        raise ValueError(f"Column '{col}' missing in cleaned_data.csv. Run prepare_cleaned_data.py to generate it.")

# Define input schema
class RealEstateInput(BaseModel):
    city: str
    property_type: str
    furnished: str
    delivery_term: str
    bedrooms: int
    bathrooms: int
    area: float
    level: int

# Define predict endpoint
@app.post("/predict")
async def predict(input_data: RealEstateInput):
    try:
        # Validate numerical inputs
        if input_data.bedrooms < 0:
            raise HTTPException(status_code=400, detail="Bedrooms must be non-negative")
        if input_data.bathrooms < 0:
            raise HTTPException(status_code=400, detail="Bathrooms must be non-negative")
        if input_data.area <= 0:
            raise HTTPException(status_code=400, detail="Area must be positive")
        if input_data.level < 0:
            raise HTTPException(status_code=400, detail="Level must be non-negative")

        # Encode categorical inputs
        categorical_inputs = {
            'City': input_data.city,
            'Type': input_data.property_type,
            'Furnished': input_data.furnished,
            'Delivery_Term': input_data.delivery_term
        }
        encoded_inputs = {}
        for col, value in categorical_inputs.items():
            if col not in label_encoders:
                raise HTTPException(status_code=500, detail=f"LabelEncoder for {col} not found")
            valid_options = label_encoders[col].classes_.tolist()
            if value not in valid_options:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid {col}: '{value}'. Valid options: {', '.join(valid_options)}"
                )
            encoded_inputs[col] = label_encoders[col].transform([value])[0]

        # Compute Price_per_sqm
        city_encoded = encoded_inputs['City']
        city_data = df_cleaned[df_cleaned["City"] == city_encoded]
        if city_data.empty:
            valid_cities = label_encoders['City'].classes_.tolist()
            raise HTTPException(
                status_code=400,
                detail=f"No data for city code {city_encoded} (decoded: {input_data.city}). Valid cities: {', '.join(valid_cities)}"
            )
        city_avg_price_per_sqm = city_data["Price_per_sqm"].mean()
        if np.isnan(city_avg_price_per_sqm) or not np.isfinite(city_avg_price_per_sqm):
            # Fallback to a default Price_per_sqm (based on dataset median)
            default_price_per_sqm = df_cleaned["Price_per_sqm"].median()
            if np.isnan(default_price_per_sqm) or not np.isfinite(default_price_per_sqm):
                raise HTTPException(
                    status_code=500,
                    detail="Cannot compute Price_per_sqm: invalid data in cleaned_data.csv"
                )
            city_avg_price_per_sqm = default_price_per_sqm

        # Create input DataFrame
        input_df = pd.DataFrame({
            'Type': [encoded_inputs['Type']],
            'Bedrooms': [input_data.bedrooms],
            'Bathrooms': [input_data.bathrooms],
            'Area': [input_data.area],
            'Furnished': [encoded_inputs['Furnished']],
            'Level': [input_data.level],
            'Delivery_Term': [encoded_inputs['Delivery_Term']],
            'City': [city_encoded],
            'Price_per_sqm': [city_avg_price_per_sqm]
        })

        # Make prediction
        predicted_price = model.predict(input_df)[0]
        if predicted_price < 0:
            raise HTTPException(status_code=500, detail="Predicted price is negative, which is invalid")

        # Calculate price per sqm for output
        price_per_sqm = predicted_price / input_data.area

        # Return prediction
        return {
            "price": float(predicted_price),
            "price_per_sqm": float(price_per_sqm)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Input error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")