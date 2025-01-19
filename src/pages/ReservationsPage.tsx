import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reservations.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Reservation {
  _id: string;
  vehicleType: string;
  purpose: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Issue {
  vehicleId: string;
  description: string;
}

interface Vehicle {
  _id: string;
  name: string;
  type: string;
  status: string;
}

interface Props {
  token: string | null;
  logout: () => void;
}

const ReservationsPage: React.FC<Props> = ({ token, logout }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleType, setVehicleType] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicleName, setSelectedVehicleName] = useState("");
  const [selectedVehicleIdIssue, setSelectedVehicleIdIssue] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  const fetchReservations = async () => {
    try {
      const response = await axios.get("http://localhost:3000/rezervacije", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && Array.isArray(response.data)) {
        setReservations(response.data);
      } else {
        console.error(
          "Unexpected response format for reservations:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching reservations: 54", error);
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

  useEffect(() => {
    if (token) {
      fetchReservations();
      fetchVehicles();
    }
  }, [token]); //[token]

  const handleCreateReservation = async () => {
    try {
      await axios.post(
        "http://localhost:3000/rezervacija",
        {
          vehicleId: selectedVehicleId,
          vehicleName: selectedVehicleName,
          vehicleType,
          purpose,
          startDate,
          endDate,
          status: "pending",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Reservation created successfully");
      setVehicleType("");
      setPurpose("");
      setStartDate("");
      setEndDate("");
      setSelectedVehicleId(""); // Clear selected vehicle ID
      fetchReservations();
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation");
    }
  };

  const handleCancelReservation = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/rezervacija/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Reservation canceled successfully");
      setReservations((prev) => prev.filter((res) => res._id !== id));
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("Failed to cancel reservation");
    }
  };

  const handleReportIssue = async () => {
    try {
      await axios.post(
        "http://localhost:3000/report",
        { vehicleId: selectedVehicleIdIssue, description: issueDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Issue reported successfully");
      setSelectedVehicleIdIssue("");
      setIssueDescription("");
    } catch (error) {
      console.error("Error reporting issue:", error);
      alert("Failed to report issue");
    }
  };

  const handleChange = (range) => {
    const [startDate, endDate] = range;
    // if (startDate >= endDate) {
    //   alert("You have to input start and end date of reservation");
    // } else {
    //   setStartDate(startDate);
    //   setEndDate(endDate);
    // }
    setStartDate(startDate);
    setEndDate(endDate);
  };

  return (
    <div className="container">
      <h2 className="heading">Your Reservations</h2>
      <div className="reservations">
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
              <p>
                <strong>Vehicle Name:</strong> {res.vehicleName}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {res.vehicleType}
              </p>
              <p>
                <strong>Purpose:</strong> {res.purpose}
              </p>
              <p>
                <strong>Status:</strong> {res.status}
              </p>
              <p>
                <strong>From:</strong>{" "}
                {new Date(res.startDate).toLocaleDateString()}
              </p>
              <p>
                <strong>To:</strong>{" "}
                {new Date(res.endDate).toLocaleDateString()}
              </p>
              {res.status === "pending" && (
                <button
                  className="button cancel-button"
                  onClick={() => handleCancelReservation(res._id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-reservations">No reservations found.</p>
        )}
      </div>

      <h2 className="heading">Create Reservation</h2>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
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
          Purpose:
          <input
            type="text"
            className="input"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />
        </label>
        <label className="date-label">
          Pick Date:
          <DatePicker
            className="date-label"
            selected={startDate}
            onChange={handleChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
          />
        </label>
        <label>
          Vehicle:
          <select
            className="select"
            value={selectedVehicleId}
            onChange={(e) => {
              const selectedOption = e.target.options[e.target.selectedIndex];
              setSelectedVehicleId(e.target.value);
              setSelectedVehicleName(selectedOption.text);
            }}
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.name} {vehicle.type}
              </option>
            ))}
          </select>
        </label>

        <button
          className="button primary-button"
          onClick={handleCreateReservation}
        >
          Create Reservation
        </button>
      </form>

      <h2 className="heading">Report an Issue</h2>
      <form className="form" onSubmit={(e) => e.preventDefault()}>
        <label>
          Vehicle:
          <select
            className="select"
            value={selectedVehicleIdIssue}
            onChange={(e) => setSelectedVehicleIdIssue(e.target.value)}
          >
            <option value="">Select a vehicle</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.name} {vehicle.type} ({vehicle.status})
              </option>
            ))}
          </select>
        </label>
        <label>
          Description:
          <textarea
            className="textarea"
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
          />
        </label>
        <button className="button primary-button" onClick={handleReportIssue}>
          Report Issue
        </button>
      </form>
    </div>
  );
};

export default ReservationsPage;
