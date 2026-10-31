import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ListsProvider } from "./context/ListsContext";
import { TeamsProvider } from "./context/TeamsContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <ListsProvider>
          <TeamsProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TeamsProvider>
        </ListsProvider>
      </FavoritesProvider>
    </QueryClientProvider>
  </StrictMode>,
);
