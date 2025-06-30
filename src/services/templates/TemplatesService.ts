import { Api } from "../ApiConfig";


export interface ITemplate {
    id: number;
    nome: string;
    descricao: string;
    caracteristicasInteiros: string[];
    caracteristicasString: string[];
    campanhaId: number;
}

async function create(data: object): Promise<ITemplate> {
    let response;
    try {
        response = await Api().post(`/templates`, data);
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
    return response.data;
}

async function update(userId: number, data: object): Promise<ITemplate> {
    let response;
    try {
        response = await Api().put(`/templates/${userId}`, data);

    }  catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
    return response.data;
}

async function get(templateId: number): Promise<ITemplate> {

    const response = await Api().get(`/templates/${templateId}`);
    return response.data;
}

async function getAll(): Promise<ITemplate[]> {
    let response;
    try {
        response = await Api().get(`/templates`);

    } catch (error) {
        console.error("Error fetching templates:", error);
        throw error;
    }
    return response.data;
}

async function getByCampaign(campaignId: number): Promise<ITemplate[]> {
    let response;
    try {
        response = await Api().get(`/campanhas/${campaignId}/templates`);
    } catch (error) {
        console.error("Error fetching templates by campaign:", error); 
        throw error;
    }
    
    return response.data;
}

export default { update, get, getAll, create, getByCampaign };