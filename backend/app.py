from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ================================
# LOAD MODELS
# ================================
models = {
    "loc1": joblib.load('air_quality_model6981.pkl'),
    "loc2": joblib.load('air_quality_model11579.pkl'),
    "loc3": joblib.load('air_quality_model234568.pkl'),
    "loc4": joblib.load('air_quality_model278671.pkl')
}

# ================================
# PREDICTION ROUTE
# ================================
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json

    location = str(data.get('location'))

    if location not in models:
        return jsonify({'error': 'Invalid location'}), 400

    model = models[location]

    try:
        now = datetime.now()

        # ✅ Get EXACT feature order from model (CRITICAL FIX)
        feature_names = model.feature_names_in_

        # ✅ Prepare all possible inputs
        input_data = {
            'pm10': data.get('pm10'),
            'so2': data.get('so2'),
            'no2': data.get('no2'),
            'co': data.get('co'),
            'o3': data.get('o3'),

            'temperature': data.get('temperature'),
            'relativehumidity': data.get('relativehumidity'),
            'wind_speed': data.get('wind_speed'),
            'PS': data.get('PS'),
            'AOD': data.get('AOD'),

            'hour': now.hour,
            'day': now.day,
            'month': now.month,

            # dummy lag/rolling (can improve later)
            'pm25_lag1': 30,
            'pm25_lag2': 28,
            'pm25_roll3': 29,
            'pm25_roll6': 31
        }

        # ✅ Create DataFrame in EXACT order
        features = pd.DataFrame(
            [[input_data.get(col, 0) for col in feature_names]],
            columns=feature_names
        )

    except Exception as e:
        return jsonify({'error': str(e)}), 400

    # ✅ Prediction
    try:
        pred = model.predict(features)[0]
    except Exception as e:
        return jsonify({'error': f'Model error: {str(e)}'}), 500

    return jsonify({
        'location': location,
        'pm25_prediction': round(float(pred), 2)
    })

    print("Received data:", data)
    print("Feature order:", model.feature_names_in_)
    print("Sending features:", features.columns.tolist())
# ================================
# STATS ROUTE
# ================================
@app.route('/stats', methods=['GET'])
def stats():
    dfs = []

    for f in os.listdir('data'):
        if f.endswith('.csv'):
            try:
                df_temp = pd.read_csv(os.path.join('data', f))
                dfs.append(df_temp)
            except:
                continue

    if not dfs:
        return jsonify({'error': 'No data found'}), 400

    df = pd.concat(dfs, ignore_index=True)

    # clean column names
    df.columns = [col.strip().lower() for col in df.columns]

    def safe_mean(col):
        return round(df[col].mean(), 2) if col in df.columns else None

    return jsonify({
        'so2_avg': safe_mean('so2'),
        'no2_avg': safe_mean('no2'),
        'pm25_avg': safe_mean('pm25'),
        'co_avg': safe_mean('co'),
        'o3_avg': safe_mean('o3')
    })


# ================================
# ROOT ROUTE (fix 404 issue)
# ================================
@app.route('/')
def home():
    return "✅ Air Quality Backend Running"


# ================================
# RUN SERVER
# ================================


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)