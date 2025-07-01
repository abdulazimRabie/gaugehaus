# GaugeHaus
GaugeHaus is a real estate system that allows users to sell their estates and communicate with brokers. Also, users can demestify the estate price by using prediction feature provided in the system to avoid price manipulation and stop making it fuzzy.

## API
Check all endpoints and test it through : [Postman Collection](https://www.postman.com/interstellar-station-253901/real-estate-software/collection/k3kk64t/gaugehaus)

## Installation

### Prerequisites

* [Node.js](https://nodejs.org/) (v14 or higher)
* [MongoDB](https://www.mongodb.com/) (local or cloud instance)
* Signin Coludinary and get API key for configuration.

### Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/abdulazimRabie/gaugehaus.git
   cd gaugehaus
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

## Project Structure

```
gaugehaus/
├── controllers/
├── models/
├── routes/
├── utils/
├── public/
├── app.js
├── index.js
└── .env
├── locations.json
└── README.md
```

## Some API Endpoints

* `/api/users/ ... ` to handle user functions.
* `/api/estates/ ... ` to handle estate functions.
* `/api/auth/ ... ` to handle user authentication.
* `/api/predictions/ ... ` to handle predicted prices.

*Note: Ensure to include authentication tokens where required.*

## Testing

Use tools like [Postman](https://www.postman.com/) to test the API endpoints. Import the API collection and environment variables to get started quickly.
