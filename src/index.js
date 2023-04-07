import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import * as path from "path";

//Authentication functions
import auth from "./auth.js";
import authRoutes from "./routes/auth-routes.js";

//Routes
import r_user from "./routes/r_user";
import r_profile from "./routes/r_playerProfile.js";
import r_auth from "./routes/r_auth";
import r_admin from "./routes/r_admin";
import r_unity from "./routes/r_unity";

import r_storage from "./routes/r_storage.js";

import passportSetup from "../config/passport-setup.js";

const app = express();
const port = process.env.PORT;

// Set up EJS
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 500000,
  })
);
app.set("view engine", "ejs");

// Set up CORS
app.use(cors()); //Enable CORS on all routes
app.use(express.json()); //Automatically decode JSON data

app.listen(port, () => {
  console.log(`Listening on port ${port} ✅`);
});

app.use("/auth", authRoutes);

//Image upload
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
upload.single("avatar");

//User endpoints
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/users", r_user.register);
app.get("/users/:username", [auth.verifyToken], r_user.getData);
app.patch(
  "/users/:username/email",
  [auth.verifyToken, auth.updateToken],
  r_user.changeEmail
);

app.patch(
  "/users/:username/password",
  [auth.verifyToken],
  r_user.changePassword
);

app.patch(
  "/users/:username/profile/description",
  [auth.verifyToken],
  r_profile.updateDescription
);

//Authentication endpoints
app.post("/auth/web", r_auth.authWeb);
app.post("/auth/unity", r_auth.authUnity);
app.get("/auth/confirm/:confirmationCode", r_auth.confirmUserEmail);

//Admin endpoints
app.get("/admin/data/:name", r_admin.fetchData);

app.post(
  "/admin/data/:name",
  [auth.verifyToken, auth.adminCheck],
  r_admin.insertDocument
);

app.delete(
  "/admin/data/:name",
  [auth.verifyToken, auth.adminCheck],
  r_admin.deleteDocument
);

//Unity
app.get("/unity/user/profile", r_unity.getUserProfile);
app.post("/unity/user/profile/game/add", r_unity.addUserProfileGame);
app.post("/unity/user/profile/game/update", r_unity.updateUserProfileGame);

//S3 Storage
app.get("/api/storage/file", async (req, res) => {
  res.status(200);
});

app.post("/api/storage/file", upload.single("image"), r_storage.uploadFile);
