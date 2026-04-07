import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeList from "./pages/RecipeList";
import RecipeDetail from "./pages/RecipeDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "0 1rem", fontFamily: "sans-serif" }}>
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
