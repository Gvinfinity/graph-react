import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CampaignService, { ICampaign } from '../services/campaign/CampaignService';

export const CampaignPage = () => {
    const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<string>('');

    const navigate = useNavigate();



    useEffect(() => {
        CampaignService.getAll().then((cs => setCampaigns(cs)));
    }, []);

    const handleCampaignChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCampaign(event.target.value);
    };

    const onSubmit = () => {
        navigate('/graph', { state: { campaignId: selectedCampaign } });
    }

    return (
        <div className="container mx-auto p-4 bg-gray-300 flex flex-col items-center justify-center min-h-screen min-w-screen">
            <div className="bg-white p-6 rounded shadow-md">
                <h1 className="text-2xl font-bold mb-4">Selecione a campanha:</h1>
                <select
                    value={selectedCampaign}
                    onChange={handleCampaignChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Selecione a campanha...</option>
                    {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                            {campaign.nome}
                        </option>
                    ))}
                </select>
                <button onClick={onSubmit} className="bg-amber-600 rounded p-2 mt-3 ml-auto cursor-pointer hover:bg-amber-700">Ir para campanha</button>
            </div>
        </div>
    );
};
