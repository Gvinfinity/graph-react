import { BrowserRouter, Routes, Navigate, Route } from "react-router-dom"

import { GraphPage } from "./pages/graph";
import { CampaignPage } from "./pages/campaign";

export const AppRoutes = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={<Navigate to='/'/>}/>
                <Route path="/" element={<CampaignPage />}/>
                <Route path="/graph" element={<GraphPage />}/>
            </Routes>
        </BrowserRouter>
    )
}