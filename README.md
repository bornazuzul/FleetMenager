# FleetMenager

Welcome to the **FleetMenager** application! This project provides an intuitive and modern administrative interface to manage vehicle reservations, user issues, and vehicle inventory. Built with the latest web technologies, it offers seamless CRUD operations, issue management, and real-time data integration.

---

## **Features**
- **Vehicles Management**: Add, update, and delete vehicles.
- **Reservations Management**: Track, view, and manage vehicle reservations.
- **Issues Management**: Create and update issue status (e.g., resolved, pending).
- **Authentication**: Secure access via JWT-based token authentication.
- **Responsive Design**: Fully responsive and optimized for various devices.

---

## **Technologies Used**
- **Frontend**: TypeScript, React, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Styling**: CSS (or your chosen framework)
- **API Communication**: RESTful API with JWT authentication

---

## **Prerequisites**

Ensure you have the following installed:
- **Node.js** (>= 16.x)
- **MongoDB**
- **npm** or **yarn**

---

## **Setup and Installation**

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/admin-dashboard.git
   cd admin-dashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the Backend Server**:
   ```bash
   npm run start
   ```

5. **Run the Frontend (React App)**:
   ```bash
   cd client
   npm install
   npm run start
   ```

---

## **API Endpoints Overview**

| Endpoint                  | Method | Description                         |
|---------------------------|--------|-------------------------------------|
| `/admin/vehicles`         | GET    | Retrieve all vehicles               |
| `/admin/vehicles`         | POST   | Add a new vehicle                   |
| `/admin/vehicles/:id`     | PATCH  | Update an existing vehicle          |
| `/admin/vehicles/:id`     | DELETE | Remove a vehicle                    |
| `/admin/reservations`     | GET    | Retrieve all reservations           |
| `/admin/issues`           | GET    | Retrieve all reported issues        |
| `/admin/issues/:id`       | PATCH  | Update the status of an issue       |
| `/admin/issues`           | POST   | Create a new issue                  |

---

## **Usage**

### Admin Dashboard Features
1. **Vehicles Section**:
   - View the list of vehicles.
   - Add new vehicles with make, model, and availability status.
   - Edit or delete existing vehicles.

2. **Reservations Section**:
   - View all active and completed reservations.
   - Update reservation status.

3. **Issues Section**:
   - View all reported issues with user details.
   - Update issue status to "resolved" or "pending."
   - Add new issues.

---

## **Testing**
To run tests (if applicable):
```bash
npm run test
```
---

## **License**
This project is licensed under the MIT License.

---

## **Contact**
For questions, feel free to reach out:
- **Email**: bornazuzul@gmail.com
- **GitHub**: [bornazuzul](https://github.com/yourusername)

