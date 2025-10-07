import React, { useState, useEffect } from 'react';
import { Leaf, Loader2, Plane as Plant } from 'lucide-react';
import axios from "axios";

const slogans = [
  "Healthy Soil, Healthy Life.",
  "Nurture the soil, it nurtures you.",
  "AI-driven insights for sustainable farming.",
  "Your soil's story, told through data.",
  "Precision farming starts with soil health."
];

function App() {
  const [currentSlogan, setCurrentSlogan] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [soilData, setSoilData] = useState({
    Soil_Moisture: '',
    Soil_Temperature: '',
    Humidity: '',
    Light_Intensity: '',
    Soil_pH: '',
    Nitrogen_Level: '',
    Phosphorus_Level: '',
    Potassium_Level: '',
    Electrochemical_Signal: '',
    Nutrient_Balance: ''
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    setSoilData({
      ...soilData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const key in soilData) {
      if (soilData[key] === '') {
        alert("Please fill all the fields");
        return;
      }
    }

    try {
      setIsLoading(true);

      // Send soil data to FastAPI
      const response = await axios.post(
        'http://localhost:8000/predict',
        soilData,
        { headers: { "Content-Type": "application/json" } }
      );

      // Backend returns both prediction and recommendations
      setResult(response.data.plant_health_status || "No data received");
      setRecommendations(response.data.recommendations || "No recommendations available");

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Plant className="h-16 w-16 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Soil Health Analysis
          </h1>
          <p className="mt-3 text-xl text-gray-300">{slogans[currentSlogan]}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.keys(soilData).map((key) => (
                <div key={key}>
                  <label className="flex items-center text-sm font-medium mb-2 capitalize">
                    <Leaf className="w-4 h-4 mr-2" />
                    {key.replace(/_/g, " ")}
                  </label>
                  <input
                    type="number"
                    name={key}
                    value={soilData[key]}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 flex-col justify-center mt-8">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Soil Health'
                )}
              </button>

              <div className="text-3xl font-bold my-10">
                Soil Health: {result}
              </div>

              {recommendations && (
                <div className="bg-green-300/10 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <div className="text-2xl my-6 font-semibold">
                      Recommendations
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: recommendations }} />
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
