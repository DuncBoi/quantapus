const { ReactFlow, ReactFlowProvider, useReactFlow, Handle } = window.ReactFlow;
const notyf = new Notyf();

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
    const [nodes, setNodes] = React.useState(initialNodes); 
    const [completedCount, setCompletedCount] = React.useState(0);

    async function fetchProgress() {
        if (!window.currentUser || !window.completedSet || !window.cachedProblems) {
            setNodes(prev =>
                prev.map(n => ({
                    ...n,
                    data: { ...n.data, progress: 0 }
                }))
            );
            return;
        }
    
        const updated = initialNodes.map(node => {
            const topic = node.data.label.toLowerCase();
    
            const problemsForNode = window.cachedProblems.filter(p => {
                return (p.roadmap || '').toLowerCase() === topic;
            });

            const total = problemsForNode.length;
            let completed = 0;
    
            for (const problem of problemsForNode) {
                if (window.completedSet.has(problem.id)) {
                    completed++;
                }
            }
    
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
            return {
                ...node,
                data: {
                    ...node.data,
                    progress
                }
            };
        });
    
        setNodes(updated);
    }    

    React.useEffect(() => {
        fetchProgress(); // runs once on load
        const refresh = () => fetchProgress();
        window.addEventListener("refreshProgressInReactFlow", refresh);
        return () => window.removeEventListener("refreshProgressInReactFlow", refresh);
    }, []);

    const handleNodeClick = async (node) => {
        setSelectedNode(node);
        setLoading(true);
        setError(null);
    
        try {
            await window.loadProblems(); 
    
            const topic = node.data.label.toLowerCase();
    
            // Use cached problems from window.cachedProblems directly
            const problems = window.cachedProblems.filter(
                p => (p.roadmap || '').toLowerCase() === topic
            );
    
            setProblems(problems);
    
            // Calculate completed count directly from cached data
            const count = problems.reduce((acc, p) => (
                acc + (window.completedSet.has(p.id) ? 1 : 0)
            ), 0);
    
            setCompletedCount(count);

            setTimeout(() => {
                document.querySelectorAll('.problems-list .problem').forEach(problemDiv => {
                    const idSpan = problemDiv.querySelector('.problem-id');
                    if (!idSpan) return;
    
                    const problemId = Number(idSpan.textContent.replace("#", ""));
                    const checkmark = problemDiv.querySelector('.checkmark');
    
                    const isCompleted = window.completedSet.has(problemId);
                    checkmark.classList.toggle('completed', isCompleted);
                });
            }, 0);
    
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };    

    return React.createElement(React.Fragment, null,
        React.createElement(ReactFlow, {
            nodes: nodes,
            edges: initialEdges,
            nodeTypes: { customNode: CustomNode },
            fitView: true,
            onNodeClick: (e, node) => handleNodeClick(node)
        }),
        
        selectedNode && React.createElement('div', { 
            className: 'modal-overlay',
            onClick: () => setSelectedNode(null)
        },
            React.createElement('div', { 
                className: 'modal-content',
                onClick: (e) => e.stopPropagation()
            },
                React.createElement('button', {
                    className: 'modal-close',
                    onClick: () => setSelectedNode(null)
                }, 'X'),
                
                React.createElement(React.Fragment, null,
                    React.createElement('h1', { className: 'modal-title' }, selectedNode.data.label),
                
                    React.createElement('div', { className: 'modal-progress-container' },
                        React.createElement('div', { className: 'progress-label' }, `( ${completedCount} / ${problems.length} )`),
                        React.createElement('div', { className: 'progress-bar' },
                            React.createElement('div', { 
                                className: 'progress-bar-fill', 
                                style: { width: `${problems.length > 0 ? (completedCount / problems.length) * 100 : 0}%` } 
                            })
                        )
                    )
                ),                
                                
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
                                React.createElement('div', { 
                                    className: 'checkmark-box',
                                    onClick: (e) => {
                                        e.stopPropagation();
                                        const checkmark = e.currentTarget.querySelector('.checkmark');
                                    
                                        const nowCompleted = window.toggleCompletion(problem.id);
                                        if (window.currentUser){
                                            checkmark.classList.toggle('completed', nowCompleted);
                                            setCompletedCount(prev => prev + (nowCompleted ? 1 : -1));
                                    
                                            // Immediately update node progress visually
                                            setNodes(prevNodes =>
                                                prevNodes.map(n => {
                                                    if (n.data.label.toLowerCase() === selectedNode.data.label.toLowerCase()) {
                                                        const total = problems.length;
                                                        const newCompleted = completedCount + (nowCompleted ? 1 : -1);
                                                        const progress = total > 0 ? Math.round((newCompleted / total) * 100) : 0;
                                    
                                                        return {
                                                            ...n,
                                                            data: { ...n.data, progress }
                                                        };
                                                    }
                                                    return n;
                                                })
                                            );
                                        }
                                    }                                                                       
                                },
                                    React.createElement('span', { 
                                        className: 'checkmark' + 
                                            (problem.completed ? ' completed' : '') 
                                    })
                                ),
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

// 3. Nodes Setup
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

    const handleAuthChange = (event) => {
        const refreshEvent = new CustomEvent("refreshProgressInReactFlow");
        window.dispatchEvent(refreshEvent);
    };

    window.addEventListener("userSignedIn", handleAuthChange);

    return function cleanupRoadmap() {
        console.log('Cleaning up React Flow resources');

        reactRoot.unmount();

        window.removeEventListener("userSignedIn", handleAuthChange);

        if (window.reactFlowInstance) {
            window.reactFlowInstance.destroy();
            delete window.reactFlowInstance;
        }
    };
};

