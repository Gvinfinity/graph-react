import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import { MultiDirectedGraph } from "graphology";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { FC, useEffect, useState } from "react";

// Component to display node properties
const NodeProperties: FC<{ nodeId: string | null }> = ({ nodeId }) => {
  const sigma = useSigma();
  const [extendInfo, setExtendInfo] = useState(false);

  if (!nodeId || !sigma.getGraph().hasNode(nodeId)) return null;

  const attributes = sigma.getGraph().getNodeAttributes(nodeId);

  const onSeeInfo = () => {
    setExtendInfo(!extendInfo);

  };

  return (
    <>
      { extendInfo ? (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-400/40 z-20" onClick={() => setExtendInfo(false)}>
          <div className="flex items-center justify-center h-full">
            <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-2">{attributes.label}</h2>
              <ul className="list-disc pl-5 mb-4">
                {Object.entries(attributes).map(([key, value]) => (
                  <li key={key} className="mb-1">
                    <strong>{key}:</strong> {JSON.stringify(value)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ): (
        <div
          className="absolute ml-auto right-2 top-2 left-0 w-fit h-fit z-10 p-4 rounded-sm bg-white shadow-md border-1 border-gray-200 flex flex-col gap-2 items-center justify-center"
        >
          <h3>Node: {nodeId}</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {Object.entries(attributes).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {JSON.stringify(value)}
              </li>
            ))}
          </ul>
          <button className="bg-amber-600 p-1 rounded-xl text-white mx-auto cursor-pointer hover:bg-amber-500 transition-colors duration-300" onClick={onSeeInfo}>
            Ver mais...
          </button>
        </div>
      )}
    </>
  );
};

// Create the Component that listens to all events
const GraphEvents: FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

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

  return <NodeProperties nodeId={selectedNode} />;
};

const ForceAtlas2Graph = () => {
  const { assign, positions } = useLayoutForceAtlas2({
    settings: {
      scalingRatio: 1000,
      strongGravityMode: false,
      gravity: 9.8,
      outboundAttractionDistribution: true,
      adjustSizes: true,
      barnesHutOptimize: true,
      barnesHutTheta: 0.5,
      linLogMode: false,
      edgeWeightInfluence: 100,
    },
    iterations: 40
  });

  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Create a random graph
    const order = 10;
    const probability = 0.1;
    const graph = new MultiDirectedGraph();

    for (let i = 0; i < order; i++) {
      graph.addNode(i, {
        label: `Node${i}`,
        size: 15, // Random size between 1 and 4
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color
        x: Math.random() * 100,
        y: Math.random() * 100,
      });
    }

    for (let i = 0; i < order; i++) {
      for (let j = i + 1; j < order; j++) {
        if (Math.random() < probability) graph.addEdge(i, j);
      }
    }

    loadGraph(graph);
    assign();
  }, [assign, loadGraph, positions]);

  return null;
}

export const GraphPage: FC = () => {

  return (
      <SigmaContainer settings={{ allowInvalidContainer: true }}>
        <GraphEvents />
        <ForceAtlas2Graph />
      </SigmaContainer>
  );
};
