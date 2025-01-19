const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for token verification
const provjeriToken = (req, res, next) => {
  const authZaglavlje = req.headers["authorization"];
  if (!authZaglavlje) {
    return res.status(403).send("Authorization header missing");
  }

  const token = authZaglavlje.split(" ")[1];
  if (!token) {
    return res.status(403).send("Bearer token not found");
  }

  try {
    const dekodiraniToken = jwt.verify(token, "tajniKljuc");
    req.korisnik = dekodiraniToken;
    // console.log(token);
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.korisnik = { id: decoded.userId };

    next();
  } catch (err) {
    return res.status(401).send("Invalid token");
  }
};

const provjeriUlogu = (uloga) => (req, res, next) => {
  console.log(req.korisnik);
  if (req.korisnik && req.korisnik.uloga === uloga) {
    next();
  } else {
    res.status(403).send(`Access denied - your role is ${req.korisnik.uloga}`);
  }
};

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/testBazaP", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", (error) => console.error("Connection error:", error));
db.once("open", () => console.log("Connected to MongoDB"));

// Mongoose Schema and Model
const { Schema } = mongoose;

const korisnikShema = new Schema({
  username: { type: String },
  email: { type: String, unique: true, required: true },
  role: { type: String, default: "user" },
  password: { type: String, required: true },
});

const vehicleSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: { type: String, default: "available" },
  notes: { type: String },
});

const reservationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Korisnik" },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  vehicleType: { type: String, required: true },
  vehicleName: { type: String, required: true },
  purpose: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const issueReportSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Korisnik" },
  vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Korisnik = mongoose.model("Korisnik", korisnikShema, "korisnici");
const Vehicle = mongoose.model("Vehicle", vehicleSchema);
const Reservation = mongoose.model("Reservation", reservationSchema);
const IssueReport = mongoose.model("IssueReport", issueReportSchema);

const saltRunde = 10;

// sva vozila
app.get("/vehicles", provjeriToken, async (req, res) => {
  try {
    console.log("Fetching vehicles...");
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.send("Error fetching vehicles", error);
  }
});

// User Registration Route
app.post("/registracija", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send("Missing required fields");
    }

    const existingUser = await Korisnik.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already in use");
    }

    const hashLozinka = await bcrypt.hash(password, saltRunde);
    const noviKorisnik = new Korisnik({
      username,
      email,
      password: hashLozinka,
      role: role ? role : "user",
    });

    await noviKorisnik.save();
    res.status(201).send("User successfully registered");
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(500).send("Internal server error");
  }
});

// User Login Route STARA
// app.post("/prijava", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).send("Missing email or password");
//     }

//     const korisnikBaza = await Korisnik.findOne({ email });
//     if (!korisnikBaza) {
//       console.log("Login failed: user not found");
//       return res.status(401).send("Invalid login credentials");
//     }

//     const isPasswordValid = await bcrypt.compare(
//       password,
//       korisnikBaza.password
//     );
//     if (!isPasswordValid) {
//       console.log("Login failed: invalid password");
//       return res.status(401).send("Invalid login credentials");
//     }

//     console.log("Successful login");
//     const token = jwt.sign(
//       { idKorisnika: korisnikBaza.username, uloga: korisnikBaza.role },
//       "tajniKljuc",
//       { expiresIn: "1h" }
//     );

//     res.json({ token });
//   } catch (error) {
//     console.error("Login error:", error.message);
//     res.status(500).send("Internal server error");
//   }
// });

// NOVA
app.post("/prijava", async (req, res) => {
  try {
    const korisnikBaza = await Korisnik.findOne({ email: req.body.email });
    if (
      korisnikBaza &&
      (await bcrypt.compare(req.body.password, korisnikBaza.password))
    ) {
      const token = jwt.sign(
        {
          username: korisnikBaza.username,
          id: korisnikBaza._id,
          uloga: korisnikBaza.role,
        },
        "tajniKljuc",
        { expiresIn: "1h" }
      );
      res.json({ token });
    } else {
      res.status(401).send("Neispravni podaci za prijavu");
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// employee kreiranje rezervacije
app.post("/rezervacija", provjeriToken, async (req, res) => {
  try {
    const {
      vehicleId,
      vehicleName,
      vehicleType,
      purpose,
      startDate,
      endDate,
      status,
    } = req.body;
    const newReservation = new Reservation({
      userId: req.korisnik.id,
      vehicleId,
      vehicleName, // Save name
      vehicleType,
      purpose,
      startDate,
      endDate,
      status: status || "pending",
    });
    await newReservation.save();
    res.status(201).send("Reservation created");
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).send("Error creating reservation");
  }
});

// employee pregled rezervacija
app.get("/rezervacije", provjeriToken, async (req, res) => {
  const reservations = await Reservation.find({ userId: req.korisnik.id });
  res.json(reservations);
});

// employee otkazivanje rezervacija
app.delete("/rezervacija/:id", async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (reservation) {
      res.send("Reservation deleted successfully");
    } else {
      res.status(404).send("Reservation not found");
    }
  } catch (error) {
    res.status(500).send("Error deleting reservation");
  }
});

// employee prijava stete
app.post("/report", provjeriToken, async (req, res) => {
  console.log("req.korisnik:", req.korisnik);
  const { vehicleId, description } = req.body;
  const report = new IssueReport({
    userId: req.korisnik.id,
    vehicleId,
    description,
  });
  await report.save();
  res.status(201).send("Issue reported");
});

app.post("/dodavanje-vozila", async (req, res) => {
  try {
    const { name, type, status, notes } = req.body;
    const newVozilo = new Vehicle({
      name,
      type,
      status,
      notes,
    });
    await newVozilo.save();
    res.status(201).send("Dodano vozilo");
  } catch (error) {
    res.status(500).send("Error");
  }
});

// admin pregled svih rezervacija
app.get(
  "/admin-rezervacije",
  provjeriToken,
  provjeriUlogu("admin"),
  async (req, res) => {
    try {
      const reservations = await Reservation.find({})
        .populate("userId")
        .populate("vehicleId");
      res.json(reservations);
    } catch (error) {
      res.send("Error fetching reservations ", error);
    }
  }
);

// admin odobravanje ili odbijanje rezervacija
app.put(
  "/admin/rezervacija/:id",
  provjeriToken,
  provjeriUlogu("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).send("Status is required.");
      }

      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) {
        return res.status(404).send("Reservation not found.");
      }

      reservation.status = status;
      await reservation.save();
      res.status(200).json({
        message: `Reservation ${reservation._id} updated to ${status}`,
      });
    } catch (error) {
      console.error("Error updating reservation status:", error);
      res.status(500).send("An error occurred while updating reservation.");
    }
  }
);

// admin brisanje vozila
app.delete(
  "/admin/vehicle/:id",
  provjeriToken,
  provjeriUlogu("admin"),
  async (req, res) => {
    try {
      const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
      if (vehicle) {
        res.send("Vehicle deleted successfully");
      } else {
        res.status(404).send("Vehicle not found");
      }
    } catch (error) {
      res.status(500).send("Error deleting vehicle");
    }
  }
);

// admin dodjela vozila
app.put(
  "/admin/assign-vehicle/:id",
  provjeriToken,
  provjeriUlogu("admin"),
  async (req, res) => {
    try {
      const { vehicleId } = req.body;
      const reservation = await Reservation.findById(req.params.id);
      reservation.vehicleId = vehicleId;
      reservation.status = "approved";
      await reservation.save();
      res.send("Vehicle assigned");
    } catch (error) {
      res.send("Error assigning vehicle ", error);
    }
  }
);

// admin pregled prijava stete
app.get(
  "/admin/issues",
  provjeriToken,
  provjeriUlogu("admin"),
  async (req, res) => {
    try {
      const issues = await IssueReport.find({})
        .populate("userId")
        .populate("vehicleId");
      res.json(issues);
    } catch (error) {
      res.send("Error finding issues ", error);
    }
  }
);

// Protected Route
app.get("/zasticena-ruta", provjeriToken, (req, res) => {
  res.send("You have accessed a protected route");
});

// Admin-Only Route
app.get("/samo-admin", provjeriToken, provjeriUlogu("admin"), (req, res) => {
  res.send("You are an admin. Welcome to the admin route");
});

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Express server!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
