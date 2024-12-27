import React from 'react';
import useMyStore from './useMyStore';

const MyComponent = () => {

    const newNodes = [
        { id: 'node1', x: 100, y: 100 },
        { id: 'node2', x: 200, y: 200 },
        // Add more nodes as needed
      ];


  const { nodes, setNodes, getNodes } = useMyStore((state) => ({
    nodes: state.nodes,
    setNodes: state.setNodes,
    getNodes: state.getNodes
  }));

  // Example of setting new nodes
  const updateNodes = () => {
    setNodes(newNodes); // newNodes should be the new array of nodes you want to set
  };

  const gettingNodes = () =>{
    getNodes();
  };

  return (
    <div>
      {/* Render your component using nodes and other parts of the state */}
      <button onClick={updateNodes}>Update Nodes</button>
      <button onClick={gettingNodes}>get Nodes</button>
    </div>
  );
};

export default MyComponent;
