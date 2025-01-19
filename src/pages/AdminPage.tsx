import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  status: string;
}

interface Reservation {
  _id: string;
  userId: User;
  vehicleId: Vehicle | null;
  vehicleType: string;
  purpose: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface Issue {
  vehicleId: string;
  description: string;
}

interface Props {
  token: string | null;
  logout: () => void;
}

const AdminPage: React.FC<Props> = ({ token, logout }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [assignVehicleId, setAssignVehicleId] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [description, setDescription] = useState("");

  const fetchReservations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/admin-rezervacije",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && Array.isArray(response.data)) {
        setReservations(response.data);
        console.log(reservations);
      } else {
        console.error(
          "Unexpected response format for reservations:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching reservations: ", error);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:3000/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        setVehicles(response.data);
        console.log(response.data);
      } else {
        console.error(
          "Unexpected response format for vehicles:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const fetchIssues = async () => {
    try {
      const response = await axios.get("http://localhost:3000/admin/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        setIssues(response.data);
        console.log(response.data);
      } else {
        console.error("Unexpected response format for issues:", response.data);
      }
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchVehicles();
    fetchIssues();
  }, [token]);

  const handleAddVehicle = async () => {
    try {
      await axios.post("http://localhost:3000/dodavanje-vozila", {
        name: vehicleName,
        type: vehicleType,
        status: "available",
        notes: description,
      });

      alert("Added vehicle successfully");
      setVehicleName("");
      setVehicleType("");
      setDescription("");
      fetchReservations();
      fetchVehicles();
      fetchIssues();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      alert("Failed to add vehicle");
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      await axios.delete(`http://localhost:3000/admin/vehicle/${vehicleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles((prevVehicles) =>
        prevVehicles.filter((v) => v._id !== vehicleId)
      );
      fetchReservations();
      fetchVehicles();
      fetchIssues();
      alert("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle");
    }
  };

  const handleApprove = async (reservationId: string) => {
    try {
      // const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/admin/rezervacija/${reservationId}`,
        { status: "approved" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations((prev) =>
        prev.map((res) =>
          res._id === reservationId ? { ...res, status: "approved" } : res
        )
      );
      fetchReservations();
      fetchVehicles();
      fetchIssues();
    } catch (error) {
      console.error("Error approving reservation:", error);
    }
  };

  const handleDecline = async (reservationId: string) => {
    try {
      await axios.put(
        `http://localhost:3000/admin/rezervacija/${reservationId}`,
        { status: "declined" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations((prev) =>
        prev.map((res) =>
          res._id === reservationId ? { ...res, status: "declined" } : res
        )
      );
      fetchReservations();
      fetchVehicles();
      fetchIssues();
    } catch (error) {
      console.error("Error declining reservation:", error);
    }
  };

  const handleAssignVehicle = async (
    reservationId: string,
    assignVehicleId: string
  ) => {
    if (!assignVehicleId) {
      alert("Please select a vehicle.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:3000/admin/assign-vehicle/${reservationId}`,
        { vehicleId: assignVehicleId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservations((prev) =>
        prev.map((res) =>
          res._id === reservationId
            ? { ...res, vehicleId: assignVehicleId }
            : res
        )
      );
      fetchReservations();
      fetchVehicles();
    } catch (error) {
      console.error("Error assigning vehicle:", error);
    }
  };

  const getDateRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next date
    }
    return dates;
  };

  return (
    <div className="container">
      <h2 className="section-heading">Vehicles</h2>
      <section className="vehicles-section">
        <div className="vehicle-cards">
          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <div key={vehicle._id} className="card vehicle-card">
                <div className="card-text">
                  <p>
                    <strong>Manufacturer:</strong> {vehicle.name}
                  </p>
                  <p>
                    <strong>Vehicle Type:</strong> {vehicle.type}
                  </p>
                  <p>
                    <strong>Status:</strong> {vehicle.status}
                  </p>
                  <p>
                    <strong>Description:</strong> {vehicle.notes}
                  </p>
                </div>
                <button
                  className="button delete-button"
                  onClick={() => {
                    if (
                      confirm(`Do you want to delete vehicle ${vehicle.name}`)
                    ) {
                      handleDeleteVehicle(vehicle._id);
                    } else {
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p className="no-data">No vehicles in database.</p>
          )}
        </div>
        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <label>
            Vehicle Name:
            <input
              type="text"
              className="input"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
          </label>
          <label>
            Vehicle Type:
            <input
              type="text"
              className="input"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
          </label>
          <label>
            Description:
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <button className="button" onClick={handleAddVehicle}>
            Add vehicle
          </button>
        </form>
      </section>

      <section className="reservations-section">
        <h2 className="section-heading">Reservations</h2>
        <div className="flex reservations-cards">
          {reservations.length > 0 ? (
            reservations.map((res) => (
              <div
                key={res._id}
                className={`card reservation-card ${
                  res.status === "approved"
                    ? "approved"
                    : res.status === "pending"
                    ? "pending"
                    : "not-approved"
                }`}
              >
                {/* <DatePicker
                  className="date-label"
                  // disabled
                  selected={res.startDate}
                  startDate={res.startDate}
                  endDate={res.endDate}
                  selectsRange
                /> */}
                <div className="tekst">
                  <p>
                    <strong>User:</strong> {res.userId.username} (
                    {res.userId.email})
                  </p>
                  <p>
                    <strong>Vehicle Name:</strong> {res.vehicleId?.name}
                  </p>
                  <p>
                    <strong>Vehicle Type:</strong> {res.vehicleId?.type}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {res.purpose}
                  </p>
                  <p>
                    <strong>Status:</strong> {res.status}
                  </p>
                </div>
                <Calendar
                  className="reservation-calendar"
                  value={getDateRange(res.startDate, res.endDate)}
                  tileClassName={({ date, view }) => {
                    if (
                      view === "month" &&
                      getDateRange(res.startDate, res.endDate).some(
                        (d) => d.toDateString() === date.toDateString()
                      )
                    ) {
                      return "highlighted-date";
                    }
                  }}
                  selectRange={false}
                  showNeighboringMonth={false}
                />
                <div className="reservation-buttons">
                  <div className="button-group">
                    <button
                      className="button approve-button"
                      onClick={() => handleApprove(res._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="button decline-button"
                      onClick={() => handleDecline(res._id)}
                    >
                      Decline
                    </button>
                  </div>
                  <div className="assign-section">
                    <select
                      className="select vehicle-select"
                      value={assignVehicleId}
                      onChange={(e) => setAssignVehicleId(e.target.value)}
                    >
                      <option value="">Select Vehicle</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle._id} value={vehicle._id}>
                          {vehicle.name} - {vehicle.status}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button assign-button"
                      onClick={() =>
                        handleAssignVehicle(res._id, assignVehicleId)
                      }
                    >
                      Assign Vehicle
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No reservations available.</p>
          )}
        </div>
      </section>

      <section className="issues-section">
        <h2 className="section-heading">Issues</h2>
        <div className="issue-cards-container">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <div key={issue._id} className="card issue-card">
                <p className="issue-detail">
                  <strong>User name:</strong> {issue.userId.username} (
                  {issue.userId.email})
                </p>
                <p className="issue-detail">
                  <strong>Vehicle Name:</strong> {issue.vehicleId.name}
                </p>
                <p className="issue-detail">
                  <strong>Vehicle Type:</strong> {issue.vehicleId.type}
                </p>
                <p className="issue-detail">
                  <strong>Description:</strong> {issue.description}
                </p>
                <p className="issue-detail">
                  <strong>Report date:</strong>{" "}
                  {new Date(issue.date).toDateString() +
                    " " +
                    new Date(issue.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                </p>
              </div>
            ))
          ) : (
            <p className="no-data">No issues reported.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
