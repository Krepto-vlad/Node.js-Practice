# Backend Server

---

## Installation

1. Clone or download this repository.
2. Install dependencies: npm install.

---

## Usage

1. To run the server use: "npm start" or "node server.js"

This will start server at http://localhost:3333.
---

## Notes
- Articles are stored as individual .json files in the **/data** folder.

## Database setup

1. Create a database in PostgreSQL.
2. Fill in .env with your data:
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_db_password
3. Install dependencies:
   npm install
4. Run migrations:
   npx sequelize-cli db:migrate