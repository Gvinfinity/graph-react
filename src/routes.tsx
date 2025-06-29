import { BrowserRouter, Routes, Navigate, Route } from "react-router-dom"

import { GraphPage } from "./pages/graph";

export const AppRoutes = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<Navigate to='/'/>}/>
                <Route path="/" element={<GraphPage />}/>
            </Routes>
        </BrowserRouter>
    )
}