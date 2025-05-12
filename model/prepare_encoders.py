import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib

# Read the original dataset
try:
    df = pd.read_csv('cleaned_data.csv')
except FileNotFoundError:
    raise FileNotFoundError("model.xlsx not found. Ensure it is in the project root.")

# Verify required columns
required_columns = ['City', 'Type', 'Furnished', 'Delivery_Term', 'Bedrooms', 'Bathrooms', 'Price', 'Area', 'Level']
for col in required_columns:
    if col not in df.columns:
        raise ValueError(f"Column '{col}' missing in model.xlsx")

# Remove duplicates
df = df.drop_duplicates()

# Handle outliers
df_no_outliers = df.copy()
for col in ['Bedrooms', 'Bathrooms', 'Price', 'Area', 'Level']:
    Q1 = df[col].quantile(0.25)
    Q3 = df[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    df_no_outliers = df_no_outliers[(df_no_outliers[col] >= lower) & (df_no_outliers[col] <= upper)]

# Encode categorical columns
df_cleaned = df_no_outliers.copy()
label_encoders = {}
categorical_columns = ["City", "Type", "Furnished", "Delivery_Term"]
for col in categorical_columns:
    le = LabelEncoder()
    df_cleaned[col] = le.fit_transform(df_cleaned[col].dropna())
    label_encoders[col] = le

# Calculate Price_per_sqm
df_cleaned["Price_per_sqm"] = df_cleaned["Price"] / df_cleaned["Area"]

# Save cleaned data
df_cleaned.to_csv('cleaned_data.csv', index=False)
print("cleaned_data.csv generated successfully.")

# Save encoders
joblib.dump(label_encoders, 'encoders.joblib')
print("encoders.joblib generated successfully.")