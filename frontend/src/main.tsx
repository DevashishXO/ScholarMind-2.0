import './index.css'
import App from './App.tsx'
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { LoadingProvider } from "./context/LoadingContext";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
          <App />
          <Toaster position="bottom-right" />
    </LoadingProvider>
  </QueryClientProvider>
);