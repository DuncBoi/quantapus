const { ReactFlow, ReactFlowProvider, useReactFlow, Handle } = window.ReactFlow;

// 1. Custom Node Component
const CustomNode = ({ data }) => {
    return React.createElement('div', { 
        className: 'custom-node',
        style: { '--progress': `${data.progress || 0}%` }
    },
        React.createElement(Handle, { type: "target", position: "top", className: "react-flow__handle-top" }),
        React.createElement('div', { className: 'node-content' }, data.label),
        React.createElement(Handle, { type: "source", position: "bottom", className: "react-flow__handle-bottom" })
    );
};

// 2. Flow Component with Modal
function Flow() {
    const [selectedNode, setSelectedNode] = React.useState(null);
    const [problems, setProblems] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const handleNodeClick = async (node) => {
        setSelectedNode(node);
        setLoading(true);
        setError(null);
        
        try {
            const roadmapName = encodeURIComponent(node.data.label.toLowerCase());
            const response = await fetch(`https://api.quantapus.com/problems/roadmap/${roadmapName}`);
            if (!response.ok) throw new Error('Failed to fetch problems');
            const data = await response.json();
            setProblems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return React.createElement(React.Fragment, null,
        React.createElement(ReactFlow, {
            nodes: initialNodes,
            edges: initialEdges,
            nodeTypes: { customNode: CustomNode },
            fitView: true,
            onNodeClick: (e, node) => handleNodeClick(node)
        }),
        
        selectedNode && React.createElement('div', { 
            className: 'modal-overlay',
            onClick: () => setSelectedNode(null) // Add this line
        },
            React.createElement('div', { 
                className: 'modal-content',
                onClick: (e) => e.stopPropagation() // Add this line
            },
                React.createElement('button', {
                    className: 'modal-close',
                    onClick: () => setSelectedNode(null)
                }, 'X'),
        
                
                React.createElement('h1', { className: 'modal-title' }, selectedNode.data.label),
                
                React.createElement('div', { className: 'problems-list' },
                    loading && React.createElement('div', { className: 'loading-container' },
                        React.createElement('div', { className: 'loading-spinner' })
                    ),
                    error && React.createElement('div', { className: 'error-message' }, error),
                    !loading && !error && problems.length === 0 && 
                        React.createElement('p', { className: 'empty-state' }, 'No problems found'),
                    
                    !loading && !error && problems.map(problem => 
                        React.createElement('div', {
                            key: problem.id,
                            className: 'problem',
                            onClick: () => window.handleNavigation(`/problem?id=${problem.id}`)
                        },
                            React.createElement('div', { className: 'problem-left' },
                                React.createElement('span', { className: 'problem-id' }, `#${problem.id}`),
                                React.createElement('span', { className: 'problem-name' }, problem.title || 'Untitled')
                            ),
                            React.createElement('span', { 
                                className: `problem-difficulty ${problem.difficulty ? problem.difficulty.toLowerCase() : 'unknown'}`
                            }, problem.difficulty || 'Unknown')
                        )
                    )
                )
            )
        )
    );
}

// 3. App Setup (remainder unchanged)
const initialNodes = [
    { 
        id: '1', 
        type: 'customNode', 
        position: { x: 100, y: 100 }, 
        data: { label: 'Brainteasers' } 
    },
    { 
        id: '2', 
        type: 'customNode', 
        position: { x: 0, y: 300 }, 
        data: { label: 'Sets' } 
    },
    { 
        id: '3', 
        type: 'customNode', 
        position: { x: 200, y: 300 }, 
        data: { label: 'Conditional' } 
    }
];

const initialEdges = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    },
    {
        id: 'e1-3',
        source: '1',
        target: '3',
        animated: true,
        style: { stroke: 'white', strokeWidth: 2 },
        markerEnd: { type: 'arrowclosed', color: 'white' }
    }
];

function App() {
    return React.createElement(ReactFlowProvider, null,
        React.createElement(Flow)
    );
}

let reactRoot = null;

// Initialize function
window.initRoadmap = function() {
    const container = document.getElementById('root');
    if (!container) return () => {};

    container.innerHTML = ''; 
    const reactRoot = ReactDOM.createRoot(container);
    reactRoot.render(React.createElement(App));

    return function cleanupRoadmap() {
        console.log('Cleaning up React Flow resources');
        
        reactRoot.unmount();
        
        if (window.reactFlowInstance) {
            window.reactFlowInstance.destroy();
            delete window.reactFlowInstance;
        }
    };
};