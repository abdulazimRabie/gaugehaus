from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd

# Initialize FastAPI app
app = FastAPI()

# Load the trained model
model = joblib.load('car_model.joblib')

# Define input schema using Pydantic
class CarInput(BaseModel):
    hp: float
    wt: float

# Define predict endpoint
@app.post("/predict")
async def predict(input_data: CarInput):
    try:
        # Extract inputs
        hp = input_data.hp
        wt = input_data.wt

        # Validate inputs
        if hp <= 0 or wt <= 0:
            raise HTTPException(status_code=400, detail="Horsepower and weight must be positive numbers")
        if hp > 500 or wt > 10000:
            raise HTTPException(status_code=400, detail="Horsepower or weight exceeds realistic values")

        # Adjust wt to thousands of pounds (assuming model expects wt in this unit)
        wt = wt / 1000.0

        # Create input DataFrame
        data = {
            "hp": [hp],
            "wt": [wt]
        }
        test_data = pd.DataFrame(data)

        # Make prediction
        prediction = model.predict(test_data)[0]

        # Validate prediction
        if prediction < 5 or prediction > 50:
            raise HTTPException(
                status_code=500,
                detail=f"Prediction ({prediction:.2f} MPG) is outside realistic MPG range (5–50)"
            )

        # Return prediction
        return {"mpg": float(prediction)}
    except Exception as e:
        # Handle any unexpected errors
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")