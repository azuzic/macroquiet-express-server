import "dotenv/config";
import express from "express";
import connect from "./db.js";
import cors from "cors";
import auth from "./auth.js";

import user from "./routes/user";
import token from "./routes/token";
import storage from "./routes/storage"

import bodyParser from "body-parser";

const app = express();

// Set up EJS
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// SEt up CPRS
app.use(cors());            //Omoguci CORS na svim rutama
app.use(express.json());    //automatski dekodiraj JSON poruke

// Set EJS as templating engine
app.set("view engine", "ejs");

const port = process.env.PORT || 3000;

//Token
app.get("/token", [auth.verify], token.getToken);
app.post("/user/token", [auth.verify], token.updateToken);

//User
app.post("/user", user.register);
app.patch("/user/username", [auth.verify], user.changeUsername);
app.patch("/user/email", [auth.verify], user.changeEmail);
app.patch("/user/password", [auth.verify], user.changePassword); 

//Storage
app.post("/upload/image", [storage.imageUpload.single('image')], storage.upload);
app.get("/download/image", storage.download);

//Authenticate existing user
app.post("/auth", async (req, res) => {
  let userCredentials = req.body;

  try {
    let result = await auth.authenticateUser(
      userCredentials.email,
      userCredentials.password,
      userCredentials.rememberMe
    );
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

//Fetch from database storage
app.get("/storage", async (req, res) => {
  let query = String(req.query.data);

  let db = await connect();
  let cursor = await db.collection(query).find();
  let results = await cursor.toArray();

  res.json(results);
});
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

/*
//REST MOCK
//TO BE IMPLEMENTED
//User interface
//user profile
app.get("/user", (req, res) => res.json(data.currentUser));
app.get("/user/:username", (req, res) => res.json(data.oneUser));
//available games
app.get("/games:gameName", (req, res) => res.json(data.gameDetails));
app.get("/games:gameName/download", (req, res) =>
  res.json(data.gameDetails.fileForDownload)
);
//scoreboard
app.get("/games/:gameName/scoreboard", (req, res) =>
  res.json(data.game.scoreboard)
);
//Admin interface
//add new post
app.post("/post", (req, res) => {
  res.statusCode = 201;
  res.setHeader("Location", "/posts/21");
  res.send();
});
//add new game details
app.post("/games", (req, res) => {
  res.statusCode = 201;
  res.setHeader("Location", "/games/newGameName");
  res.send();
});

//+ backend dio za povezivanje/autentifikaciju/modulaciju podataka unutar same Unity igre
*/