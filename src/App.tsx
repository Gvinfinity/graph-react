import { AppRoutes } from "./routes";
import "@fontsource/roboto";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        stacked
      />
      <AppRoutes />
    </>
  );
}
