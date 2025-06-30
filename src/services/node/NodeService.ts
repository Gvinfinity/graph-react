import { Api } from "../ApiConfig";

export interface INode {
    id: number;
    nome: string;
    descricao: string;
    vizinhos: number[];
    caracteristicaString: Map<string, string>;
    caracteristicaInteiros: Map<string, number>;
    templateId: number;
    campanhaId: number;
}

async function create(data: object): Promise<INode> {
    let response;
    try {
        response = await Api().post(`/vertices`, data);
    } catch (error) {
        console.error("Error creating template:", error);
        throw error;
    }
    return response.data;
}

async function update(nodeId: number, data: object): Promise<INode> {
    let response;
    try {
        response = await Api().put(`/vertices/${nodeId}`, data);

    }  catch (error) {
        console.error("Error updating template:", error);
        throw error;
    }
    return response.data;
}

async function get(nodeId: number): Promise<INode> {

    const response = await Api().get(`/vertices/${nodeId}`);
    return response.data;
}

async function getAll(): Promise<INode[]> {
    let response;
    try {
        response = await Api().get(`/vertices`);

    } catch (error) {
        console.error("Error fetching vertices:", error);
        throw error;
    }
    return response.data;
}

async function getByCampaign(campaignId: number): Promise<INode[]> {
    let response;
    try {
        response = await Api().get(`/campanhas/${campaignId}/vertices`);
    } catch (error) {
        console.error("Error fetching vertices by campaign:", error);
        throw error;
    }
    return response.data;
}

async function remove(nodeId: string): Promise<void> {
    try {
        await Api().delete(`/vertices/${nodeId}`);
    } catch (error) {
        console.error("Error deleting node:", error);
        throw error;
    }
}

export default { update, get, getAll, create, getByCampaign, remove };