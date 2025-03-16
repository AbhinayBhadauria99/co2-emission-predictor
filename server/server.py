from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
import joblib
import numpy as np

# Load the trained model and scaler
try:
    gbr_model = joblib.load("gbr_model.pkl")
    scaler = joblib.load("scaler.pkl")
    columns = joblib.load("columns.pkl")
except Exception as e:
    raise RuntimeError(f"Error loading model or scaler: {e}")

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development only)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Define the request model
class UserInput(BaseModel):
    Monthly_Grocery_Bill: float
    Vehicle_Monthly_Distance_Km: float
    Waste_Bag_Weekly_Count: float
    How_Long_TV_PC_Daily_Hour: float
    How_Many_New_Clothes_Monthly: float
    How_Long_Internet_Daily_Hour: float
    Body_Type: str
    Sex: str
    Diet: str
    How_Often_Shower: str
    Heating_Energy_Source: str
    Transport: str
    Vehicle_Type: str
    Social_Activity: str
    Frequency_of_Traveling_by_Air: str
    Waste_Bag_Size: str
    Energy_efficiency: str

@app.post("/predict")
def predict_emission(user_input: UserInput):
    try:
        # Convert user input to DataFrame
        input_data = pd.DataFrame([user_input.dict()])
        
        # One-hot encode categorical variables
        categorical_columns = [
            'Body_Type', 'Sex', 'Diet', 'How_Often_Shower', 'Heating_Energy_Source', 
            'Transport', 'Vehicle_Type', 'Social_Activity', 'Frequency_of_Traveling_by_Air', 
            'Waste_Bag_Size', 'Energy_efficiency'
        ]
        input_data = pd.get_dummies(input_data, columns=categorical_columns)

        # Ensure the input data has the same columns as the training data
        input_data = input_data.reindex(columns=columns, fill_value=0)

        # Normalize numerical columns
        numerical_columns = [
            'Monthly_Grocery_Bill', 'Vehicle_Monthly_Distance_Km', 'Waste_Bag_Weekly_Count',
            'How_Long_TV_PC_Daily_Hour', 'How_Many_New_Clothes_Monthly', 'How_Long_Internet_Daily_Hour'
        ]
        
        # Check if numerical columns exist in input data
        existing_numerical_columns = [col for col in numerical_columns if col in input_data.columns]
        
        # Scale numerical columns
        if existing_numerical_columns:
            input_data[existing_numerical_columns] = scaler.transform(input_data[existing_numerical_columns])
        else:
            print("No numerical columns found in input data.")

        # Make prediction
        prediction = gbr_model.predict(input_data)[0] * 10000

        # Determine emission level
        if prediction < 1500:
            emission_level = "Low Carbon Emission"
        elif 1500 <= prediction < 3000:
            emission_level = "Medium Carbon Emission"
        else:
            emission_level = "High Carbon Emission"

        return {
            "Predicted_Carbon_Emission": round(prediction, 2),
            "Emission_Level": emission_level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))