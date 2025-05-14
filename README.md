# GaugeHaus
GaugeHaus is a real estate system that allows users to sell their estates and communicate with brokers. Also, users can demestify the estate price by using prediction feature provided in the system to avoid price manipulation and stop making it fuzzy.

## Installation

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MongoDB](https://www.mongodb.com/) (local or cloud instance)
* [Python](https://www.python.org/) (v3.8 or higher)

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/abdulazimRabie/gaugehaus.git
   cd gaugehaus/backend
   ```

2. **Install Node.js dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the `backend` directory with the following content:

   ```env
   DB_LOCAL_URL=your_mongodb_connection_string
   ```

4. **Start the server**:

   ```bash
   npm run start
   ```

   The server should now be running at `http://localhost:3001`.

5. **Set up Python environment for machine learning models**:

   Navigate to the `model` directory:

   ```bash
   cd ../model
   ```

   Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

   Ensure that the machine learning model files are in place for predictions.

## Project Structure

```
gaugehaus/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   ├── server.js
│   └── .env
├── model/
│   ├── prediction_model.pkl
│   ├── predict.py
│   └── requirements.txt
├── locations.json
└── README.md
```

## Some API Endpoints

* `POST /api/users/signin` - Register a new user
* `POST /api/users/login` - Authenticate a user
* `GET /api/predictions` - Retrieve all saved predictions
* `GET /api/users` - Retrieve all users
* `POST /api/predictions/predictPrice` - Get price prediction for a property

*Note: Ensure to include authentication tokens where required.*

## Testing

Use tools like [Postman](https://www.postman.com/) to test the API endpoints. Import the API collection and environment variables to get started quickly.
