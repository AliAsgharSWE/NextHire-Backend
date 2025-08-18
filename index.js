import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies used to support form submissions
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to the NextHire API",
    documentation: "https://next-hire-api-docs.com",
    success: true,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
