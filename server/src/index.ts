import express from "express";
import cors from "cors";
import recipeRoutes from "./routes";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/recipes", recipeRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
