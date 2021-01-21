require("dotenv").config();
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 3001;
const app = express();
const cookieParser = require("cookie-parser");

const { initDatabase } = require("./utlis/DB");
const userRouter = require("./routes/userRoutes");
const petientRouter = require("./routes/patientsRoutes");

const corsOptions = {
    origin: ["http://localhost:3000"],
    credentials: true,
};

// global middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// routes
app.use("/api/users", userRouter);
app.use("/api/petients", petientRouter);

appStartUp();

async function appStartUp() {
    await initDatabase();
    app.listen(port, () => {
        console.log("server is up on port: " + port);
    });
}