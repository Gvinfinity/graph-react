import { Api } from "../ApiConfig";


export interface ICampaign {
    id: number;
    nome: string;
    descricao: string;
}

async function create(data: object): Promise<ICampaign> {
    let response;
    try {
        response = await Api().post(`/campanhas`, data);
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
    return response.data;
}

async function update(userId: number, data: object): Promise<ICampaign> {
    let response;
    try {
        response = await Api().put(`/campanhas/${userId}`, data);

    }  catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
    return response.data;
}

async function get(templateId: number): Promise<ICampaign> {

    const response = await Api().get(`/campanhas/${templateId}`);
    return response.data;
}

async function getAll(): Promise<ICampaign[]> {
    let response;
    try {
        response = await Api().get(`/campanhas`);

    } catch (error) {
        console.error("Error fetching campanhas:", error);
        throw error;
    }
    return response.data;
}

export default { update, get, getAll, create };