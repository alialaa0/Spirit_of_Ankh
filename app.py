from flask import Flask, jsonify
import snowflake.connector
import pandas as pd

app = Flask(__name__)

def get_connection():
    return snowflake.connector.connect(
        user='ABOOD36',
        password='HezMEJkBh2xZ9tx',
        account='itcoyes-gf39385',
        warehouse='TOURISM_WH',
        database='TOURISM_DB',
        schema='GOLD'
    )

@app.route('/api/predictions/tomorrow')
def get_predictions():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM GOLD.TOMORROW_PREDICTIONS", conn)
    conn.close()
    return jsonify(df.to_dict(orient='records'))

@app.route('/api/insights/tomorrow')
def get_insights():
    conn = get_connection()
    df = pd.read_sql("SELECT * FROM GOLD.TOMORROW_PREDICTIONS", conn)
    conn.close()

    overcrowded = df[
        (df['HOUR'].between(13, 15)) &
        (df['PREDICTED_OCCUPANCY'] > 0.85)
    ][['LOCATION_NAME', 'HOUR', 'PREDICTED_OCCUPANCY']]

    best_hour_by_city = (
        df.groupby(['CITY', 'HOUR'])['PREDICTED_OCCUPANCY']
        .mean()
        .reset_index()
        .sort_values('PREDICTED_OCCUPANCY')
        .groupby('CITY')
        .first()['HOUR']
        .to_dict()
    )

    return jsonify({
        "overcrowded_afternoon": overcrowded.to_dict(orient='records'),
        "best_hour_by_city": best_hour_by_city
    })

if __name__ == '__main__':
    app.run(port=5000)