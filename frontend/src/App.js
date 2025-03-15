import { useState } from "react";
import axios from "axios";
import "./App.css";

const options = {
  "Body_Type": ["overweight", "obese"],
  "Sex": ["male", "female"],
  "Diet": ["omnivore", "vegetarian", "pescatarian"],
  "How_Often_Shower": ["daily", "less frequently", "more frequently", "twice a day"],
  "Heating_Energy_Source": ["coal", "natural gas", "wood"],
  "Transport": ["public", "walk/bicycle", "private"],
  "Vehicle_Type": ["petrol", "diesel"],
  "Social_Activity": ["often", "sometimes", "never"],
  "Frequency_of_Traveling_by_Air": ["never", "rarely", "frequently", "very frequently"],
  "Waste_Bag_Size": ["small", "medium", "large", "extra large"],
  "Energy_efficiency": ["Yes", "No", "Sometimes"]
};

export default function App() {
  const [formData, setFormData] = useState({
    Monthly_Grocery_Bill: "",
    Vehicle_Monthly_Distance_Km: "",
    Waste_Bag_Weekly_Count: "",
    How_Long_TV_PC_Daily_Hour: "",
    How_Many_New_Clothes_Monthly: "",
    How_Long_Internet_Daily_Hour: "",
    Body_Type: "",
    Sex: "",
    Diet: "",
    How_Often_Shower: "",
    Heating_Energy_Source: "",
    Transport: "",
    Vehicle_Type: "",
    Social_Activity: "",
    Frequency_of_Traveling_by_Air: "",
    Waste_Bag_Size: "",
    Energy_efficiency: "",
  });

  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false); // Popup visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/predict", formData);
      setResult(response.data);
      setShowModal(true); // Show popup when result comes
    } catch (error) {
      console.error("Error predicting emission:", error);
      setResult({ error: "Prediction failed. Try again." });
      setShowModal(true);
    }
  };

  return (<>
  <div>
    <div className="container">
      <h2>Carbon Emission Predictor</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label>{key.replace(/_/g, " ")}</label>
            {options[key] ? (
              <select name={key} value={formData[key]} onChange={handleChange}>
                <option value="">Select</option>
                {options[key].map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input type="text" name={key} placeholder={key.replace(/_/g, " ")} value={formData[key]} onChange={handleChange} />
            )}
          </div>
        ))}
        <button type="submit">Predict Emission</button>
      </form>

      {/* POPUP MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Prediction Result</h3>
            {result?.error ? (
              <p className="error-text">{result.error}</p>
            ) : (
              <p>
                <strong>Predicted Carbon Emission:</strong> {result.Predicted_Carbon_Emission} kg CO₂
                <br />
                <strong>Emission Level:</strong> {result.Emission_Level}
              </p>
            )}
            <button className="close-btn" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
    <footer className="footer">
        <p>© 2025 All rights reserved. Made by Abhinay S. Bhadauria.</p>
      </footer>
      </div>
    </>
  );
}
