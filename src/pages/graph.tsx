import { ControlsContainer, SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph } from "graphology";
import { LayoutForceAtlas2Control } from "@react-sigma/layout-forceatlas2";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";
import TemplatesService, { ITemplate } from "../services/templates/TemplatesService";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import Select, { MultiValue } from "react-select";
import NodeService, { INode } from "../services/node/NodeService";

// Component to display node properties
const NodeProperties: FC<{ defaultVizinhos: string[], campaignId: string | null, nodeId: string | null, templates: ITemplate[], setNodes: Dispatch<SetStateAction<INode[]>>, formHook: UseFormReturn<FieldValues, any, FieldValues> }> = ({ defaultVizinhos, campaignId, nodeId, templates, setNodes, formHook }) => {
  const sigma = useSigma();
  const [extendInfo, setExtendInfo] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = formHook;

  
  if (!nodeId || !sigma.getGraph().hasNode(nodeId)) return null;
  
  const attributes = sigma.getGraph().getNodeAttributes(nodeId);
  const nodes = sigma.getGraph().nodeEntries();
  
  const onSeeInfo = () => {
    setExtendInfo(!extendInfo);
  };

  const onDeleteNode = () => {
    NodeService.remove(nodeId).then(() => {
      toast.success("Nó deletado com sucesso!");
      sigma.getGraph().dropNode(nodeId);
      setNodes(prevNodes => prevNodes.filter(node => node.id !== Number(nodeId)));
      setExtendInfo(false);
    }).catch((error) => {
      console.error("Error deleting node:", error);
      toast.error("Erro ao deletar nó.");
    });
  }

  const onUpdate = (data: any) => {
    data.id = nodeId;
    data.campanhaId = campaignId;
    data.templateId = attributes.templateId;
    if (data.vizinhos) {
      data.vizinhos = data.vizinhos.map((vizinho: any) => vizinho.value);
    } else {
      data.vizinhos = [];
    }
    data.nome = attributes.nome;
    data.descricao = attributes.descricao;

    setUpdateModal(!updateModal);
    if (updateModal) {
      NodeService.update(nodeId, data).then((updatedNode) => {
        toast.success("Nó atualizado com sucesso!");
        setNodes(prevNodes => prevNodes.map(node => node.id === updatedNode.id ? updatedNode : node));
        setUpdateModal(false);
      }).catch((error) => {
        console.error("Error updating node:", error);
        toast.error("Erro ao atualizar nó.");
      });
    }

    reset();
    setValue("vizinhos", []);
  };

  return (
    <>
      {updateModal && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-gray-400/40 z-30" onClick={() => setUpdateModal(false)}>
            <div className="flex items-center justify-center h-full">
              <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full max-h-4/5 overflow-y-scroll" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-2 text-center">Atualizar Nó</h2>
                <form onSubmit={handleSubmit(onUpdate)} className="flex flex-col gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Características Numéricas:</h3>
                    <table className="w-full mb-4">
                      <thead>
                        <tr>
                          <th className="border p-2">Característica</th>
                          <th className="border p-2">Valor</th>
                          <th className="border p-2">Limite Superior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributes.caracteristicasInteiros && Object.entries(attributes.caracteristicasInteiros).map(([key, value]: [string, any]) => (
                          <tr key={key}>
                            <td className="border p-2">{key}</td>
                            <td className="border p-2">
                              <input type="number" {...register(`caracteristicasInteiros.${key}.0`)} defaultValue={value.first} className="border rounded w-full p-2" />
                            </td>
                            <td className="border p-2">
                              <input type="number" {...register(`caracteristicasInteiros.${key}.1`)} defaultValue={value.second} className="border rounded w-full p-2" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <h3 className="font-semibold mb-2">Características Textuais:</h3>
                    <table className="w-full mb-4">
                      <thead>
                        <tr>
                          <th className="border p-2">Característica</th>
                          <th className="border p-2">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attributes.caracteristicasString && Object.entries(attributes.caracteristicasString as Record<string, string>).map(([key, value]) => (
                          <tr key={key}>
                            <td className="border p-2">{key}</td>
                            <td className="border p-2">
                              <input type="text" {...register(`caracteristicasString.${key}`)} defaultValue={value} className="border rounded w-full p-2" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  
                    <label className="block mb-2">
                      Vizinhos:
                      <Select
                        isMulti
                        options={Array.from(nodes).filter((n) => n.node != nodeId).map(t => ({ label: t.attributes.label, value: t.node }))}
                        value={watch("vizinhos") || []}
                        defaultValue={defaultVizinhos}
                        onChange={(selected: MultiValue<any>) => {
                          setValue("vizinhos", selected);
                        }}
                        className="mb-4"
                      />
                    </label>
                  </div>
                  <button type="button" className="bg-blue-600 p-1 rounded text-white mx-auto cursor-pointer hover:bg-blue-500 transition-colors duration-300" onClick={handleSubmit(onUpdate)}>
                    Atualizar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      { extendInfo ? (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-400/40 z-20" onClick={() => setExtendInfo(false)}>
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full max-h-4/5 overflow-y-scroll" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-2 text-center">{attributes.nome}</h2>
              <strong>Descrição:</strong>
              <p className="mb-4">{attributes.descricao}</p>
              <h3 className="text-lg font-semibold mb-2">Template:</h3>
              <p className="mb-4">{templates.find(t => t.id === attributes.templateId)?.nome || "N/A"}</p>
              <h3 className="text-lg font-semibold mb-2">Características:</h3>
              <ul className="list-disc pl-5 mb-4">
                {attributes.caracteristicasInteiros && Object.entries(attributes.caracteristicasInteiros).map(entry => {
                  const [key, value] = entry as [string, { first: number; second: number }];
                  return (
                    <li key={key} className="mb-1">
                      <strong>{key}:</strong> {value ? `${value.first} / ${value.second}` : "N/A"}
                    </li>
                  );
                })}
                {attributes.caracteristicasString && Object.entries(attributes.caracteristicasString).map(([key, value]) => (
                  <li key={key} className="mb-1">
                    <strong>{key}:</strong> {value ? JSON.stringify(value) : "N/A"}
                  </li>
                ))}
              </ul>
              <h3 className="text-lg font-semibold mb-2">Vizinhos:</h3>
              <ul className="list-disc pl-5 mb-4">
                {attributes.vizinhos && attributes.vizinhos.map((vizinho: string) =>  (
                  <li key={vizinho} className="mb-1">
                    {sigma.getGraph().getNodeAttribute(vizinho, 'nome') || `Nó ${vizinho}`}
                  </li>
                ))}
              </ul>
              <button className="bg-amber-600 p-1 rounded text-white mx-auto cursor-pointer hover:bg-amber-500 transition-colors duration-300" onClick={onDeleteNode}>
                Deletar Nó
              </button>
              <button className="bg-blue-600 ml-2 p-1 rounded text-white mx-auto cursor-pointer hover:bg-amber-500 transition-colors duration-300" onClick={() => setUpdateModal(true)}>
                Atualizar Nó
              </button>
            </div>
          </div>
        </div>
      ): (
        <div className="absolute top-2 right-2 z-10 p-2 flex flex-col gap-4 justify-center items-center">
          <div
            className="w-fit min-w-1/6 h-fit p-4 rounded-sm bg-white shadow-md border-1 border-gray-200 flex flex-col gap-2 items-center justify-center"
          >
            <h3 className="font-extrabold">{attributes.nome}</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {attributes.descricao}
            </ul>
            <button className="bg-amber-600 p-1 rounded text-white mx-auto cursor-pointer hover:bg-amber-500 transition-colors duration-300" onClick={onSeeInfo}>
              Ver mais...
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Create the Component that listens to all events
const GraphEvents = ({ templates, setNodes }: { templates: ITemplate[], setNodes: Dispatch<SetStateAction<INode[]>> }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [defaultVizinhos, setDefaultVizinhos] = useState<string[]>([]);
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const { state } = useLocation();
  
  const FormHook = useForm();

  useEffect(() => {
    if (selectedNode) {
      const vizinhosIds = sigma.getGraph().getNodeAttribute(selectedNode, "vizinhos") || [];
      const vizinhos = vizinhosIds.map((v: string) => ({ label: sigma.getGraph().getNodeAttribute(v, 'nome') || `Nó ${v}`, value: v }));
      setDefaultVizinhos(vizinhos);
      FormHook.setValue("vizinhos", vizinhos)
    }
  }, [selectedNode, sigma]);

  useEffect(() => {
    // Register the events
    registerEvents({
      clickNode: (event) => {
        setSelectedNode(event.node);
        event.preventSigmaDefault(); // Prevent sigma from centering the view on clicked node
      },
      clickStage: () => {
        setSelectedNode(null); // Clear selection when clicking on empty space
      },
      downNode: (e) => {
        setDraggedNode(e.node);
        sigma.getGraph().setNodeAttribute(e.node, 'highlighted', true);
      },
      // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
      mousemovebody: (e) => {
        if (!draggedNode) return;
        // Get new position of node
        const pos = sigma.viewportToGraph(e);
        sigma.getGraph().setNodeAttribute(draggedNode, 'x', pos.x);
        sigma.getGraph().setNodeAttribute(draggedNode, 'y', pos.y);

        // Prevent sigma to move camera:
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
      },
      // On mouse up, we reset the autoscale and the dragging mode
      mouseup: () => {
        if (draggedNode) {
          setDraggedNode(null);
          sigma.getGraph().removeNodeAttribute(draggedNode, 'highlighted');
        }
      },
      // Disable the autoscale at the first down interaction
      mousedown: () => {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
      },
    });
  }, [registerEvents, sigma, draggedNode]);

  return <NodeProperties campaignId={state.campaignId} nodeId={selectedNode} templates={templates} setNodes={setNodes} defaultVizinhos={defaultVizinhos} formHook={FormHook} />;
};

const Graph = ({ nodes, colors }: { nodes: INode[], colors: Map<number, string> }) => {

  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new MultiDirectedGraph();

    for (let node of nodes) {
      graph.addNode(node.id, {
        label: node.nome,
        nome: node.nome,
        size: 20, // Random size between 1 and 4
        color: colors.get(node.templateId) || '#000000', // Default color if not found
        x: Math.random() * 100,
        y: Math.random() * 100,
        descricao: node.descricao,
        caracteristicasString: node.caracteristicaString,
        caracteristicasInteiros: node.caracteristicaInteiros,
        vizinhos: node.vizinhos,
        templateId: node.templateId,
        campanhaId: node.campanhaId,
      });
    }

    nodes.forEach((node) => {
      node.vizinhos.forEach((vizinho) => {
        if (graph.hasNode(vizinho) && !graph.hasEdge(node.id, vizinho)) {
          graph.addEdge(node.id, vizinho);
        }
      });
    });
    
    loadGraph(graph);
  }, [loadGraph, nodes, colors]);
  
  return null;
}

const AdditionModal = ({ enabled, onClose, nodes, setNodes, templates, setTemplates }: {enabled: boolean, nodes: INode[], setNodes: Dispatch<SetStateAction<INode[]>>, onClose: () => void, templates: ITemplate[], setTemplates: Dispatch<SetStateAction<ITemplate[]>>}) => {
  const [activeTab, setActiveTab] = useState<'node' | 'template'>('node');
  const { register: registerNode, handleSubmit: handleNode, watch: watchNode, reset: resetNode, setValue: setValueNode } = useForm();
  const { register: registerTemplate, handleSubmit: handleTemplate, reset: resetTemplate } = useForm({
    defaultValues: {
      nome: '',
      descricao: '',
      caracteristicasString: [],
      caracteristicasInteiros: [],
      vizinhos: [],
    }
  });

  const [fields, setFields] = useState<{ nome: string; tipo: string }[]>([]);

  const selectedTemplate = watchNode("templateId");

  const { state } = useLocation();

  const handleClose = async () => {
    setFields([]);
    resetNode();
    resetTemplate();
    onClose();
  }

  const onSubmitNode = (e: any): void => {
    e.campanhaId = state.campaignId;
    if (e.vizinhos) {
      e.vizinhos = e.vizinhos.map((v: any) => v.value);
    } else {
      e.vizinhos = [];
    }

    NodeService.create(e).then((newNode) => {
      toast.success("Nó criado com sucesso!");
      setNodes((prevNodes: INode[]) => [...prevNodes, newNode]);
      handleClose();
    }).catch((error) => {
      console.error(error);
      toast.error("Erro ao criar nó.");
    });
  }

  const onSubmitTemplate = (e: any): void => {
    e.caracteristicasInteiros  = fields.filter(f => f.tipo === 'number').map(f => f.nome);
    e.caracteristicasString = fields.filter(f => f.tipo === 'string').map(f => f.nome);
    e.campanhaId = state.campaignId;
    
    TemplatesService.create(e).then((t) => {
      toast.success("Template criado!");
      setFields([]);
      setTemplates((prevTemplates: any) => [...prevTemplates, t]);
    }).catch((error) => {
      console.error("Error creating template:", error);
      toast.error("Erro ao criar template.")
    });
  };

  useEffect(() => {
    setValueNode("caracteristicasString", {});
    setValueNode("caracteristicasInteiros", {});
  }, [selectedTemplate])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'node':
        return (
          <form onSubmit={handleNode(onSubmitNode)}>
            <label className="block mb-2">
              Template
              <select className="border rounded w-full p-2 mb-4" defaultValue="" aria-placeholder="Selecione o Template" {...registerNode("templateId", { required: true })}>
                <option className="text-gray-400" value="" disabled hidden>Selecione o Template</option>
                {
                  templates.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)
                }
              </select>
            </label>

            <label className="block mb-2">
              Nome:
              <input type="text" className="border rounded w-full p-2" {...registerNode("descricao", { required: true })} />
            </label>
            
            <label className="block mb-2">
              Descrição:
              <input type="text" className="border rounded w-full p-2" {...registerNode("nome", { required: true })} />
            </label>

            <div className="">
              Características Numéricas:
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="border p-2">Característica</th>
                    <th className="border p-2">Valor</th>
                    <th className="border p-2">Limite Superior</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplate && templates.find(t => t.id == selectedTemplate)?.caracteristicasInteiros.map((c, index) => (
                    <tr key={index}>
                      <td className="border p-2">{c}</td>
                      <td className="border p-2">
                        <input type="number" className="border rounded w-full p-2" {...registerNode(`caracteristicasInteiros.${c}.0`, { required: true })} />
                      </td>
                      <td className="border p-2">
                        <input type="number" className="border rounded w-full p-2" {...registerNode(`caracteristicasInteiros.${c}.1`, { required: true })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              Características Textuais:
              <table className="w-full mb-4">
                <thead>
                  <tr>
                    <th className="border p-2">Característica</th>
                    <th className="border p-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTemplate && templates.find(t => t.id == selectedTemplate)?.caracteristicasString.map((c, index) => (
                    <tr key={index}>
                      <td className="border p-2">{c}</td>
                      <td className="border p-2">
                        <input type="text" key={index} className="border rounded w-full p-2" {...registerNode(`caracteristicasString.${c}`, { required: true })} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <label className="block mb-2">
              Vizinhos:
              <Select
                isMulti
                options={nodes.map(t => ({ label: t.nome, value: t.id }))}
                value={watchNode("vizinhos") || []}
                onChange={(selected: MultiValue<any>) => {
                  setValueNode("vizinhos", selected);
                }}
                className="mb-4"
              />
            </label>

            <button type="submit" className="cursor-pointer bg-blue-500 text-white p-2 rounded">Adicionar</button>
          </form>
        );
      case 'template':

        return (
          <form onSubmit={handleTemplate(onSubmitTemplate)}>
            <label className="block mb-2">
              Template Nome:
              <input type="text" className="border rounded w-full p-2" {...registerTemplate("nome", { required: true })} />
            </label>
            <label className="block mb-2">
              Descrição:
              <input type="text" className="border rounded w-full p-2" {...registerTemplate("descricao", { required: true })} />
            </label>
            <div className="mb-4">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border p-2">Nome</th>
                    <th className="border p-2">Tipo</th>
                    <th className="border p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((_, index) => (
                    <tr key={index}>
                      <td className="border p-2">
                        <input type="text" className="w-full p-1" onChange={(e) => {
                          const newFields = [...fields];
                          newFields[index].nome = e.target.value;
                          setFields(newFields);
                        }} />
                      </td>
                      <td className="border p-2">
                        <select className="w-full p-1" onChange={(e) => {
                          const newFields = [...fields];
                          newFields[index].tipo = e.target.value;
                          setFields(newFields);
                        }}>
                          <option value="string">Texto</option>
                          <option value="number">Número</option>
                        </select>
                      </td>
                      <td className="border p-2">
                        <button 
                          type="button"
                          className="bg-red-500 text-white p-1 rounded cursor-pointer"
                          onClick={() => {
                            setFields(fields.filter((_, i) => i !== index));
                          }}
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button 
                type="button"
                className="mt-2 bg-green-500 text-white p-2 rounded cursor-pointer"
                onClick={() => {
                  setFields([...fields, { nome: "", tipo: "string" }]);
                }}
              >
                Adicionar Campo
              </button>
            </div>
            <button type="submit" className="cursor-pointer bg-blue-500 text-white p-2 rounded">Criar Template</button>
          </form>
        );
    }
  };

  return (
    <>
    {enabled && (
        <div className="fixed inset-0 bg-gray-500/75 flex items-center justify-center z-50" onClick={handleClose}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-1/3 overflow-y-scroll max-h-3/5" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Adicionar Nó ou Template</h2>
            <div className="flex mb-4">
              <button
                className={`rounded-sm mx-2 cursor-pointer transition-colors duration-300 flex-1 p-2 ${activeTab === 'node' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('node')}
              >
                Adicionar Nó
              </button>
              <button
                className={`rounded-sm mx-2 cursor-pointer transition-colors duration-300 flex-1 p-2 ${activeTab === 'template' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-blue-100'}`}
                onClick={() => setActiveTab('template')}
              >
                Criar Template
              </button>
            </div>
            {renderTabContent()}
          </div>
        </div>

      )}
    </>
  );
}

export const GraphPage: FC = () => {
  const [templates, setTemplates] = useState<ITemplate[]>([]);
  const [nodes, setNodes] = useState<INode[]>([]);
  const [isAdditionModalOpen, setIsAdditionModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [colors, setColors] = useState<Map<number, string>>(new Map());
  
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    TemplatesService.getByCampaign(state.campaignId).then((templates) => {
      setTemplates(templates);
    });

    NodeService.getByCampaign(state.campaignId).then((nodes) => {
      setNodes(nodes);
    }).catch((error) => {
      console.error("Error loading nodes:", error);
      toast.error("Erro ao carregar nós.");
    });
  }, []);

  useEffect(() => {
    if (!state || !state.campaignId) {
      navigate("/");
    }
  }, [state.campaignId, navigate, state]);


  useEffect(() => {
    const local_color = new Map<number, string>();
    const templates = nodes.map(n => n.templateId).filter((value, index, self) => self.indexOf(value) === index); // Unique template IDs

    for (const templateId of templates) {
      local_color.set(templateId, `#${Math.floor(Math.random() * 16777215).toString(16)}`); // Random color for each template
    }

    setColors(local_color);
  }, [nodes]);

  return (
    <>
      <div
        className="absolute z-10 top-2 left-2 w-fit h-1/12 p-4 rounded-sm bg-white shadow-md border-1 border-gray-200 flex flex-col gap-2 items-center justify-center"
      >
        <button className="bg-amber-600 p-1 rounded text-white mx-auto cursor-pointer hover:bg-amber-500 transition-colors duration-300" onClick={() => setIsAdditionModalOpen(true)}>
          + Adicionar
        </button>
      </div>

      <div className="absolute z-10 bottom-2 right-10 h-fit w-fit">
        <button
          className={`cursor-pointer p-2 rounded-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'} transition-colors duration-300`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>

      <div className="absolute z-10 bottom-2 left-2 w-fit h-fit p-4 rounded-sm bg-white shadow-md border-1 border-gray-200 flex flex-col gap-2 items-center justify-center">
        <div>
          <h3 className="font-bold mb-2">Cores dos Templates:</h3>
          <div className="flex flex-col gap-1">
            {Array.from(colors.entries()).map(([templateId, color]) => (
              <div key={templateId} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: color }}></div>
                <span>{templates.find(t => t.id === templateId)?.nome || 'Template Desconhecido'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdditionModal enabled={isAdditionModalOpen} nodes={nodes} setNodes={setNodes} onClose={() => setIsAdditionModalOpen(false)} templates={templates} setTemplates={setTemplates}/>

      <SigmaContainer settings={{ allowInvalidContainer: true, labelColor: { color: darkMode ? '#f0f0f0' : '#1a1a1a' } }} style={{ backgroundColor: darkMode ? '#1a1a1a' : '#f0f0f0' }}>
        <GraphEvents templates={templates} setNodes={setNodes} />
        <Graph nodes={nodes} colors={colors} />
        <ControlsContainer position={"bottom-right"} className="">
          <LayoutForceAtlas2Control settings={{ settings: {
            scalingRatio: 10,
            slowDown: 10,
            barnesHutOptimize: true,
            barnesHutTheta: 0.5,
            strongGravityMode: true,
            gravity: 0.1,
            outboundAttractionDistribution: true,
          }}} />
        </ControlsContainer>
      </SigmaContainer>
    </>
  );
};
