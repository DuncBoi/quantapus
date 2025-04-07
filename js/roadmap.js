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
    const [nodes, setNodes] = React.useState(initialNodes); 
    const [completedCount, setCompletedCount] = React.useState(0);

    const fetchProgress = async () => {
        if (window.currentUser?.uid) {
            try {
                const response = await fetch(`https://api.quantapus.com/roadmap-progress?userId=${window.currentUser.uid}`);
                const progressData = await response.json();
                
                setNodes(prevNodes => prevNodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        progress: progressData[node.data.label.toLowerCase()] || 0
                    }
                })))
            } catch (error) {
                console.error('Progress fetch failed:', error);
            }
        } else{
            setNodes(prevNodes => prevNodes.map(node => ({
                ...node,
                data: {
                    ...node.data,
                    progress: 0
                }
            })));
        }
    };

    React.useEffect(() => {
        fetchProgress();
    }, [window.currentUser]);

    React.useEffect(() => {
        const refresh = () => fetchProgress();
        window.addEventListener("refreshProgressInReactFlow", refresh);
    
        return () => {
            window.removeEventListener("refreshProgressInReactFlow", refresh);
        };
    }, []);
    

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
            // 2. Immediately update checkmarks
            if (window.currentUser) {
                const completedIds = await fetchCompletedProblems(window.currentUser.uid);
                const completedSet = new Set(completedIds);
                
                setTimeout(() => {
                    let count = 0;
                
                    document.querySelectorAll('.problem').forEach(problemDiv => {
                        const problemId = Number(problemDiv.querySelector('.problem-id').textContent.replace("#", ""));
                        const checkmark = problemDiv.querySelector('.checkmark');
                
                        const isCompleted = completedSet.has(problemId);
                        checkmark?.classList.toggle('completed', isCompleted);
                        if (isCompleted) count++;
                    });
                
                    setCompletedCount(count);
                }, 50);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleCompletion = async (problemId) => {
        if (!window.currentUser) {
            notyf.error("Sign In to Track Progress");
            return false;
        }

        try {
            const response = await fetch('https://api.quantapus.com/toggle-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userId: window.currentUser.uid, 
                    problemId 
                })
            });
            
            if (!response.ok) throw new Error('Toggle failed');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
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
                                    onClick: async (e) => {
                                        e.stopPropagation();
                                        if (!window.currentUser) {
                                            notyf.error("Sign In to Track Progress");
                                            return;
                                        }
                                        const checkmark = e.currentTarget.querySelector('.checkmark');

                                        const result = await toggleCompletion(problem.id);
                                        if (result) {
                                            const isNowCompleted = !checkmark.classList.contains('completed');
                                            checkmark.classList.toggle('completed');
                                            setCompletedCount(prev => prev + (isNowCompleted ? 1 : -1));
                                        }
                                        await fetchProgress();
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

    const handleAuthChange = (event) => {
        const refreshEvent = new CustomEvent("refreshProgressInReactFlow");
        window.dispatchEvent(refreshEvent);
    };

    window.addEventListener("userSignedIn", handleAuthChange);
    window.addEventListener("userSignedOut", handleAuthChange);

    return function cleanupRoadmap() {
        console.log('Cleaning up React Flow resources');

        reactRoot.unmount();

        window.removeEventListener("userSignedIn", handleAuthChange);
        window.removeEventListener("userSignedOut", handleAuthChange);

        if (window.reactFlowInstance) {
            window.reactFlowInstance.destroy();
            delete window.reactFlowInstance;
        }
    };
};


async function fetchCompletedProblems(userId) {
    try {
        const response = await fetch(`https://api.quantapus.com/completed-problems?userId=${userId}`);
        return await response.json();
    } catch (error) {
        return [];
    }
}

