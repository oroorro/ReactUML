import React, { Children, forwardRef } from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';
// import {ReactFlow, 
// MiniMap,
// Controls,
// Background,
// useNodesState,
// useEdgesState,
// addEdge,
// }  

import { Background } from './background/src';
import { Controls } from './controls';
import AlgoFlow from "./container/AlgoFlow";
import { useNodesState, useEdgesState } from "./hook/useNodesEdgesState";
import { type } from '@testing-library/user-event/dist/type';

import { useStoreApi } from './hook/useStore';  // does not work since it is above the store level 
import { useBatchController } from './apiHook/useBatchController';
import { useNodeApiAuth } from './apiHook/useNodeApiAuth';


const NodeIndexInArray = {
  '1qlx7vx-jj26d3': '#dfe7f5', //ZoomPane
  '1qlx7vx-107d1f': '#ffa8d5',  //NodeRenderer
  '1qlx7vx-011409': '#f26d1f', //EdgeRenderer
  '1qlx7vx-def456': '#49abf5', //Pane
  '1qlx7vx-093e0a': '#e8c390',  //Zoom
  '1qlx7vx-99k6j3': '#ffdc6b', //Store
}

const generateRandomHexColor = () => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, '0')}`;
};


const attributeColors = ['import', 'reactInBuilt', 'variable', 'function', 'hook', 'create type',]

let stateManger = { id: '' };


const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

//creates unique id
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomValue = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomValue}`;
}

let initialNodes = [
  // {
  //   id: '3',
  //   position: { x: 50, y: 50 },
  //   type: 'ReactNode',
  //   data: {}

  // }
]


/**
 * Recursively transform backend nodes into frontend nodes format
 * @param {BackendNode[]} nodes - Array of backend nodes
 * @returns {Array<Object>} - Array of frontend-compatible nodes
 */
function transformBackendToFrontend(nodes, isRoot = true) {
  //console.log("nodes", nodes);
  return nodes.map(backendNode => {
    //console.log("backendNode", backendNode.uid, backendNode.pipes, backendNode.pipes[0]?.attributeContents?.length);
    // shared structure (used in root.data and in children directly)
    const transformed = {
      id: backendNode.uid,
      title: backendNode.title,
      color: backendNode.color,
      type: backendNode.type,
      numbersOfPropsGoingIn: backendNode.pipes[0]?.attributeContents?.length ?? 0,
      attributes: (backendNode.attributes ?? []).map(attr => ({
        id: attr.uid,
        nameOfAttribute: attr.nameOfAttribute,
        totalNumberOfAttribute: attr.totalNumberOfAttribute,
        AttributeContents: (attr.attributeContents ?? []).map(ac => ({
          ...ac,
          id: ac.uid || crypto.randomUUID(),
        })),
      })),
      pipes: (backendNode.pipes ?? []).map(pipe => ({
        id: pipe.uid,
        name: pipe.name,
        color: pipe.color,
        numbersOfProps: pipe.numbersOfProps,
        attributeContents: (pipe.attributeContents ?? []).map(ac => ({
          ...ac,
          id: ac.uid || crypto.randomUUID(),
        })),
      })),
      children: transformBackendToFrontend(backendNode.children, false),
    };

    // if root → wrap inside full React Flow node
    if (isRoot) {
      return {
        id: backendNode.uid,
        position: {
          x: backendNode.positionX ?? 0,
          y: backendNode.positionY ?? 0,
        },
        type: 'ReactNode',
        data: {
          indexMap: null,
          stateManager: null,
          label: backendNode.title,
          ...transformed,
        },
      };
    }
    // if not root, then return plain transformed child
    //console.log("transformed", transformed);
    return transformed;
  });
}


function Flow() {

  const flowRef = useRef(null);
  const interactingIdRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const nodeId = useRef(5);
  const { createNode, editNode, createAttribute, createPipe, createBatch, deleteAttribute, deletePipe, deleteNode } = useBatchController();
  const { getAllNodesForUser } = useNodeApiAuth();

  const fetchNodes = async () => {
    try {
      const nodes = await getAllNodesForUser(); // No userId needed!
      console.log('Fetched nodes:', nodes);

      const initialNodes = transformBackendToFrontend(nodes);
      //console.log("initialNodes", initialNodes);
      setNodes(initialNodes);
    } catch (err) {
      console.error('Error fetching nodes:', err);
    }
  };

  useEffect(() => {
    if (contextMenu) console.log("contextMenu is set as ", contextMenu)
  }, [contextMenu])

  useEffect(() => {
    fetchNodes();
  }, [])



  const handleCreateNode = async (color, nodeUid, isStartingNode, name, parentId = null, positionX, positionY, type = null) => {

    const nodeData = {
      uid: nodeUid,
      name: name,
      isStartingNode: isStartingNode,
      color: color,
      positionX: positionX == 0 ? null : positionX,
      positionY: positionY == 0 ? null : positionY,
    };

    // Only add parentId if it's provided
    if (parentId !== null) {
      nodeData.parentId = parentId;
    }

    await createNode(nodeData);
  };

  const handleCreatePipe = async (pipeUid, sourceNodeColor, sourceNodeUId, targetNodUid = null) => {

    console.log("pipeUid in handleCreatePipe", pipeUid);
    const pipeData = {
      uid: pipeUid,
      name: "Pipe Name",
      color: sourceNodeColor,
      mute: false,
      sourceNode: { uid: sourceNodeUId },
      targetNode: null,
    }

    //add targetNode
    if (targetNodUid != null) {

    }

    await createPipe(pipeData);
  }

  const handleEditNode = async (nodeId,) => {
    const result = await editNode({
      uid: "node-123",
      name: "Updated Node Name",
    });

    // if (result) {
    //   console.log("Node updated successfully:", result);
    // }
  };

  const handleCreateAttribute = async (attributeUid, parentNodeUid, typeOfAttribute, totalNumber, mute) => {
    const result = await createAttribute({
      uid: attributeUid,
      name: typeOfAttribute,
      totalNumber: totalNumber,
      mute: mute,
      node: {
        uid: parentNodeUid
      }
    });

    // if (result) {
    //   console.log("Attribute created successfully:", result);
    // }
  };

  function addNodeToInitialNodes(initialNodes, nodeData) {
    const newNode = {
      id: nodeData.data.id,
      position: nodeData.position,
      type: nodeData.type,
      data: {
        label: nodeData.data.label,
        title: nodeData.data.title,
        color: nodeData.data.color,
        id: nodeData.data.id,
        children: [],
      }
    };

    initialNodes.push(newNode);
  }

  async function performUpdateElement(root, id, type, data = null, e = null) {

    const ghostNodeUid = generateUniqueId();
    //used for creating Pipe 
    const ghostChild = {
      title: 'ghost',
      numbersOfPropsGoingIn: 1,
      color: '#abcdef',
      id: ghostNodeUid,
      pipes: [
        {
          color: '#dfe7f5',
          numbersOfProps: 18,
          name: "Node",
          id: generateUniqueId(),
          sourceNode:{
            uid: ghostNodeUid
          }
        },
      ],
      attributes: [],
      type: 'ghost',
    };

    const newChildUid = generateUniqueId();
    const newChild = {
      title: 'NewNode',
      numbersOfPropsGoingIn: 1,
      color: generateRandomHexColor(),
      id: newChildUid,
      pipes: [
        {
          color: '#dfe7f5',
          numbersOfProps: 18,
          name: "Node",
          id: generateUniqueId(),
          attributeContents: [],
          sourceNode:{
            uid: newChildUid
          }
        },
      ],
      attributes: [],
      children: [],
    };

    let foundNode = findNodeById(id, root);

    //console.log("found node in <Flow>", foundNode, id);

    //creating Attribute 
    if (type == 'Attribute') {
      const attributeUid = generateUniqueId();
      foundNode.attributes = [
        ...(foundNode.attributes || []),
        {
          nameOfAttribute: data ? data : 'empty',
          id: attributeUid,
          totalNumberOfAttribute: 0,
          AttributeContents: [
            // {
            //   name: 'initial',
            //   belongsTo: 'X2D',
            //   id: generateUniqueId()
            // }
          ]
        },
      ];
      handleCreateAttribute(attributeUid, id, data ? data : 'empty', 0, false)
    }
    else if (type == 'Prop') {
      //console.log("create a prop");
      //creating a pipe
      foundNode.children = [
        ...foundNode.children,
        type == 'Node' ? newChild : ghostChild,
      ];
      //console.log("pipe Id: ", ghostChild.id, "parentNode Id: ", id)
      // handleCreateNode(ghostChild.color, ghostChild.id, false, 'ghost', foundNode.id);
      // handleCreatePipe(ghostChild.pipes[0].id, foundNode.color, ghostChild.id);
      const result = await createBatch({
        nodes: [{
          uid: ghostChild.id,
          name: 'ghost',
          isStartingNode: false,
          parentId: foundNode.id,
          color: ghostChild.color,
          type: 'ghost'
        }],
        pipes: [{
          uid: ghostChild.pipes[0].id,
          name: "ghost pipe Name",
          color: foundNode.color,
          sourceNode: { uid: ghostChild.id },
          targetNode: null
        }]
      });
    }
    //creating Node and Prop
    else {
      //create Node button has clicked on background, create a Node in the backgroun
      if (!foundNode) {
        const nodeUid = generateUniqueId();
        const color = generateRandomHexColor();
        handleCreateNode(color, nodeUid, true, 'StartNode', null, e.clientX - 80, e.clientY - 10);

        addNodeToInitialNodes(
          nodes, {
          // id: generateUniqueId(),
          position: { x: e.clientX - 80, y: e.clientY - 10 },
          type: 'ReactNode',

          data: {
            label: '4',
            title: 'NewComponent',
            color: color,
            id: nodeUid,
            attributes: [],
            children: [],
          }
        });

        //console.log("nodes", nodes);
      }
      //create button was not triggered in the background
      else {
        // If the foundNode does not have children, create a new node ( child ) to that foundNode
        //console.log("foundNode", foundNode);
        if (foundNode.children != null) {
          console.log("create a child Node within a Node ");
          foundNode.children = [...foundNode.children, newChild];
          //handleCreateNode(newChild.color, newChild.id, false, 'StartNode', foundNode.id);
          //handleCreatePipe(newChild.pipes[0].id, foundNode.color, newChild.id);
          const result = await createBatch({
            nodes: [{
              uid: newChild.id,
              name: newChild.title,
              isStartingNode: false,
              parentId: foundNode.id,
              color: newChild.color
            }],
            pipes: [{
              uid: newChild.pipes[0].id,
              name: "Pipe Name",
              color: foundNode.color,
              sourceNode: { uid: newChild.id },
              targetNode: null
            }]
          });
          setNodes(nodes);
        }
      }
      //add newly craete Node into NodeIndexInArray
      NodeIndexInArray[newChild.id] = {};
      NodeIndexInArray[newChild.id] = newChild.color;
    }
  }

  //add/delete element; Node, Prop and Attribute
  //this function calls performUpdateElement 
  //then setNodes 
  const updateElement = async (type, data = null, e = null) => {
    //we need to format data in order to add Node correctly,
    //making data to be the root 
    console.log("updateElement : ", e);

    const currentNodes = [...nodes.map(node => node.data)];
    //performUpdateElement(nodes[0].data.children, contextMenu.nodeId, type, data);
    await performUpdateElement(currentNodes, contextMenu.nodeId, type, data, e);

    const updatedNode = [...nodes];

    //update node
    setNodes(updatedNode);
    //close contextMenu 
    setContextMenu(null)
  }


  const moveToSubMenu = (type) => {

    console.log("moveToSubMenu", type);
    setContextMenu(prev => {
      return {
        nodeId: prev.nodeId,
        nodeType: prev.nodeType,
        left: prev.left,
        top: prev.top,
        detail: type,
      }
    })
    // switch (type) {
    //   case "createOnElement":
    //     setContextMenu(prev => {
    //       return {
    //         nodeId: prev.nodeId,
    //         nodeType: 'Node',
    //         left: prev.left,
    //         top: prev.top,
    //         detail: 'create',
    //       }
    //     })

    //     break;

    //   case "create-attribute-2nd":
    //     setContextMenu(prev => {
    //       return {
    //         nodeId: prev.nodeId,
    //         nodeType: 'Node',
    //         left: prev.left,
    //         top: prev.top,
    //         detail: 'create-attribute-2nd',
    //       }
    //     })

    //     break; 

    //   default:
    //     break;
    // }
  }


  //find element until it reaches 'datatype' recursively 
  function findElementWithDatatype(element) {
    if (!element) return null;
    if (element.hasAttribute('datatype')) {
      return element;
    }
    return findElementWithDatatype(element.parentElement);
  }


  const FlowContextMenuHandler = (event) => {

    //get the type of element; which will be either 1. 1-Node other than return scope, 2-Node's return scope   2. pipe  3. Attribute

    event.preventDefault();


    const target = event.target;
    const elementWithDatatype = findElementWithDatatype(target);
    console.log("elementWithDatatype", elementWithDatatype.getAttribute('datatype'), elementWithDatatype);

    const nodeDataId = target.getAttribute('data-id') ? target.getAttribute('data-id') : target.parentElement?.getAttribute('data-id');
    const nodeDataType = target.getAttribute('datatype') ? target.getAttribute('datatype') : target.parentElement?.getAttribute('datatype');

    interactingIdRef.current = nodeDataId;
    console.log("target context", nodeDataId);
    console.log("nodeDataType", nodeDataType);

    if (nodeDataType === 'Node' || elementWithDatatype.getAttribute('datatype') === 'Background') {
      console.log("target context", nodeDataId);
      setContextMenu({
        nodeId: nodeDataId,
        nodeType: 'Node',
        left: event.clientX,
        top: event.clientY
      })
    } else if (nodeDataType === 'pipe') {
      setContextMenu({
        nodeId: nodeDataId,
        nodeType: 'pipe',
        left: event.clientX,
        top: event.clientY
      })
    }

    if (elementWithDatatype.getAttribute('datatype') === 'Attribute') {
      setContextMenu({
        nodeId: elementWithDatatype.getAttribute('data-id'),
        nodeType: 'Attribute',
        left: event.clientX,
        top: event.clientY
      })

    } else if (elementWithDatatype.getAttribute('datatype') === 'AttributeContent') {
      setContextMenu({
        nodeId: elementWithDatatype.getAttribute('data-id'),
        nodeType: 'AttributeContent',
        left: event.clientX,
        top: event.clientY
      })
    }
    else if (elementWithDatatype.getAttribute('datatype') === 'AttributeContent') {
      setContextMenu({
        nodeId: elementWithDatatype.getAttribute('data-id'),
        nodeType: 'Node',
        left: event.clientX,
        top: event.clientY
      })
    }
    //need for node type for row, column display 


  }

  const addAttributeContent = () => {
    const ids = contextMenu.nodeId.split('+');
    // const stateManger = {
    //   id: ids[1]
    // }
    // console.log("stateManger", stateManger);
    nodes[0].data.stateManager.id = ids[1];
    const updatedNode = [...nodes];
    //update node

    const currentNodes = [...nodes.map(node => node.data)];
    //updateElementState('attribute', nodes[0].data.children, ids[0], 'editing');
    updateElementState('attribute', currentNodes, ids[0], 'editing');

    setNodes(updatedNode);

    setContextMenu(null)
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Expose nodes state to window for E2E testing
    useEffect(() => {
      if (typeof window !== 'undefined') {
        // Expose nodes state to window for E2E testing
        window.frontendNodes = nodes;
        //console.log("frontendNodes", JSON.stringify(window.frontendNodes, null, 2));
      }
    }, [nodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  function FlowClickHandler(event) {
    let target = event.target;
    let targetParent = target.parentElement
    //console.log("target click", target.getAttribute('datatype'))

    if (targetParent.getAttribute('datatype') !== 'contextMenu') {
      setContextMenu(null)
    }
  }

  //option: NodeState
  const elementStateHandler = (target, option) => {
    //getting id of Node from interactingIdRef.current, which was saved when contextMenu on Node got triggered 
    const currentNodes = [...nodes.map(node => node.data)];
    //updateElementState(target, nodes[0].data.children, interactingIdRef.current, option);
    updateElementState(target, currentNodes, interactingIdRef.current, option);
    const updatedNode = [...nodes]; //shallow copy 
    setNodes(updatedNode);
    setContextMenu(null);

  }

  //update node's state by given node's id 
  const updateElementState = (target, root, nodeId, state) => {
    const updatedRoot = [...root];
    // let currentNode = updatedRoot;
    // let foundNode = findNodeById(nodeId, updatedRoot);

    if (target == 'node') {
      let foundNode = findNodeById(nodeId, updatedRoot);
      if (state == 'mute') {
        foundNode.muteAll = true;
      }
      else if (state == 'select') {
        foundNode.state = 'select';
      }
      else if (state == 'renderDirection') {
        if (!foundNode.renderChildrenDirection) foundNode.renderChildrenDirection = {};
        foundNode.renderChildrenDirection = foundNode.renderChildrenDirection == 'horizontal' ? 'vertical' : 'horizontal';
      }
    } else if (target == 'attribute') {
      const ids = contextMenu.nodeId.split('+');// id[0] is nodeid and id[1] is attribute id 
      let foundNode = findNodeById(ids[0], updatedRoot);
      const attribute = foundNode.attributes.find((attrib) => attrib.id == ids[1]);
      attribute.state = state;
      // console.log("found attribute", attribute);
    } else if (target == 'pipe') {
      const ids = contextMenu.nodeId.split('+'); // id[0] is nodeid and id[1] is pipe id
      let foundNode = findNodeById(ids[0], updatedRoot);
      if (state == 'selectingPipe') {
        console.log("selectingPipe");
        foundNode.state = state;
      } else {
        const pipe = foundNode.pipes.find((pipe) => pipe.id == ids[1]);
        pipe.state = state;
      }
      console.log("foundNode", foundNode);
      // console.log("pipe", pipe, "state changing into", state);
    }
  }


  function findNodeParent(childNodeId, startingNode) {

    //get startingNode's children into initalnodes:[]
    //shallow copy
    //const initialnodes = [...startingNode.children]

    //iterate initalnodes{
    //initialnodes.forEach((node)=>{ 
    //if inital Node was the target childNodeId then return the initial Node  
    //if(node.id == childNodeId) return startingNode
    //if the initial Node wasn't empty call findNodeParent 
    //else return findNodeParent(childNodeId, child)
    //if the initial Node was empty then just  return
    //}) 

    //return 

  }




  function findNodeById(nodeId, initialNodes) {
    // Use a queue for Breadth First Search
    // making sure queue will be Array type 
    const queue = Array.isArray(initialNodes) ? [...initialNodes] : [...initialNodes];;

    while (queue.length > 0) {
      const currentNode = queue.shift(); // Dequeue the first node

      if (!currentNode) continue;

      // Check if the current node's id matches
      if (currentNode.id === nodeId) {
        return currentNode;
      }

      // Add children to the queue if they exist
      if (currentNode.children && currentNode.children.length > 0) {
        queue.push(...currentNode.children);
      }
    }

    // Return undefined if the node was not found
    return undefined;
  }

  /**
   * delete Node
   *  get Node's parent Node then remove Node from the parent Node 
   *  or 
   *  get the Node then make it as 'ghost' if Node had Prop going into itself 
   * 
   * delete Attribute
   *  get Attribute and it's Node that has The Attribute then remove the attribute in the Node
   * 
   * delete Prop 
   *  get Prop and it's Node that has the Prop then remove the Prop from the Node 
   */
  const deleteElement = (type) => {

    const test = nodes.map(node => node.data);

    console.log("test", test);
    const testNode = [...test];

    if (type == 'Attribute') {

      const ids = contextMenu.nodeId.split('+');// ids[0] is nodeid and ids[1] is attribute id 
      if (!ids) console.warn("No ids exist");

      //get Node 
      let foundNode = findNodeById(ids[0], testNode);
      if (!foundNode) console.warn("Node couldn't be found")

      //filter out Attribute except deleting Attribute 
      const filtered = foundNode.attributes.filter((attrib) => attrib.id != ids[1]);
      foundNode.attributes = [...filtered];
      deleteAttribute(ids[1]);

    }else if (type == 'Pipe') {
      const ids = contextMenu.nodeId.split('+');// ids[0] is nodeid and ids[1] is pipe id 
      let foundNode = findNodeById(ids[0], testNode);
      if (!foundNode) console.warn("Node couldn't be found")

      //filter out Pipe except deleting Pipe 
      const filtered = testNode[0].children.filter((node) => node.id != ids[0]);
      testNode[0].children = [...filtered];
      setNodes(testNode);
      deletePipe(ids[1]);
      deleteNode(ids[0]);
    }else if (type == 'Node') {
      const ids = contextMenu.nodeId.split('+');// ids[0] is nodeid and ids[1] is pipe id 
      let foundNode = findNodeById(ids[0], testNode);
      if (!foundNode) console.warn("Node couldn't be found")

      //filter out Node except deleting Node 
      const filtered = testNode.filter((node) => node.id != ids[0]);
      setNodes(filtered);
      
    }

    //update the nodes 
    const updatedNode = [...nodes];
    setNodes(updatedNode);
    setContextMenu(null);

  }


  function deepCopyWithNewIds(node) {
    console.warn("deepcopt", node);
    const copiedNode = {
      ...node,
      id: generateUniqueId(), // Generate new ID for ReactChild
      pipes: node.pipes ? node.pipes.map(pipe => ({
        ...pipe,
        id: generateUniqueId(), // Generate new ID for Pipe
      })) : [],
      attributes: node.attributes ? node.attributes.map(attribute => ({
        ...attribute,
        id: generateUniqueId(), // Generate new ID for Attribute
      })) : [],
      children: node.children ? node.children.map(child => deepCopyWithNewIds(child)) : [],
    };

    // Debugging: Log the copied node before returning
    //console.log("Copied Node:", JSON.stringify(copiedNode, null, 2));

    return copiedNode;
  }


  const copyNode = () => {
    //get context-menued Node id 
    const ids = contextMenu.nodeId.split('+');

    const test = nodes.map(node => node.data);
    const testNode = [...test];
    //const updatedRoot = [...nodes[0].data.children];

    let foundNode = findNodeById(ids[0], testNode);

    //copy foundNode and add into nodes[0].data.children 
    let newlyAssignedIdNode = deepCopyWithNewIds(foundNode);
    //nodes[0].data.children = [...nodes[0].data.children, foundNode]; //wrong , it adds to current Node 

    //we need to change all of the ids 
    const newNode = {
      id: nodeId.current + "",
      position: { x: 150, y: 50 },
      type: 'ReactNode',
      data: {
        label: nodeId.current + "",
        title: newlyAssignedIdNode.title,
        color: newlyAssignedIdNode.color,
        indexMap: NodeIndexInArray,
        stateManager: stateManger,
        id: generateUniqueId(),
        children: [...newlyAssignedIdNode.children],
        attributes: [...newlyAssignedIdNode.attributes]
      }
    }

    nodeId.current = nodeId.current + 1;
    console.log("nodeId", nodeId.current)

    const updatedNodes = [...nodes, newNode];
    //nodes.push(newNode);
    setNodes(updatedNodes);
    setContextMenu(null);
    console.log("nodes updated after copy", updatedNodes);
    // console.warn("nodes now", foundNode, newlyAssignedIdNode);

  }


  const handleDeleteObjects = (type) => {
    console.log("handleDeleteObjects", type);
  }

  return (
    <div className='Flow' style={{ width: "100vw", height: "100vh" }}
      // onClick={(e) => FlowClickHandler(e)}
      // onMouseDown={(e) => FlowClickHandler(e)}
      datatype="Background"
    >
      {contextMenu && contextMenu.nodeType === 'Node' &&
        <div
          className='flex flex-col bg-white px-2 py-1 NodeContextMenu'
          style={{

            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
          datatype="contextMenu"
        >

          {!contextMenu.detail && <button className='create_button' onClick={() => moveToSubMenu("create")}>Create</button>}
          {!contextMenu.detail && <button onClick={() => deleteElement('Node')}>Delete</button>}
          {!contextMenu.detail && <button onClick={() => copyNode()}>Copy</button>}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("mute-2nd")}> Mute </button>}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("renderDirection")}> Display </button>}

          {contextMenu.detail == 'create' && <button className='create_node_button' onClick={async (e) => await updateElement('Node', null, e)}> Node </button>}
          {contextMenu.detail == 'create' && <button className='create_pipe_button' onClick={async () => await updateElement('Prop')}> Prop </button>}
          {contextMenu.detail == 'create' && <button className='create_attribute_button' onClick={() => moveToSubMenu("create-attribute-2nd")}> Attribute </button>}

          {/** mute 2nd layer of sub-menu */}
          {contextMenu.detail == 'mute-2nd' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button onClick={() => elementStateHandler('node', 'mute')}> all </button>
              <button onClick={() => elementStateHandler('node', 'select')}> select </button>
            </div>
          }

          {/** display; renderdirection sub-menu */}
          {contextMenu.detail == 'renderDirection' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button onClick={() => elementStateHandler('node', 'renderDirection')}> Horizontal </button>
              <button onClick={() => elementStateHandler('node', 'renderDirection')}> Vertical </button>
            </div>
          }

          {/** Attribute 2nd layer of sub-menu*/}
          {contextMenu.detail == 'create-attribute-2nd' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button className="attribute_button_sub_just_create" onClick={async () => await updateElement('Attribute')}> Just Create </button>
              <button className="attribute_button_sub_select_type" onClick={() => moveToSubMenu("create-attribute-3rd")} > Select Type </button>
            </div>
          }

          {/** Attribute 3rd layer of sub-menu, iterate attribute-3rd-array */}
          {contextMenu.detail == 'create-attribute-3rd' &&
            <div className='flex flex-col' datatype="contextMenu">
              {attributeColors.map((attribute) => (
                <button className={`attribute_button_sub_3rd_select_type ${attribute}`} onClick={async () => await updateElement('Attribute', attribute)}>{attribute}</button>
              ))}
            </div>
          }

        </div>}
      {contextMenu && contextMenu.nodeType === 'pipe' &&
        <div
          style={{
            backgroundColor: 'aliceblue',
            width: '50px',
            
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
          datatype="contextMenu"
        >
          {!contextMenu.detail && <button datatype="contextMenu" className='pipe_mute_button' onClick={() => moveToSubMenu("mute-2nd-pipe")}>Mute</button>}
          {!contextMenu.detail && <button datatype="contextMenu" className='pipe_add_button' onClick={() => elementStateHandler('pipe', 'editing')} >add</button>}
          {!contextMenu.detail && <button datatype="contextMenu" className='pipe_delete_button' onClick={() => deleteElement('Pipe')}>Delete</button>}

          {contextMenu.detail == 'mute-2nd-pipe' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button onClick={() => elementStateHandler('node', 'mute')}> all </button>
              <button onClick={() => elementStateHandler('pipe', 'selectingPipe')}> select </button>
            </div>
          }
        </div>
      }
      {contextMenu && contextMenu.nodeType === 'Attribute' &&
        <div
          style={{
            backgroundColor: 'white',
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
        >
          <button onClick={() => addAttributeContent()}> Add </button>
          <button onClick={() => deleteElement('Attribute')}> Delete </button>
        </div>}
      {/* {contextMenu && contextMenu.nodeType === 'AttributeContent' &&
        <div
        style={{
          backgroundColor: 'white',
          width: '50px',
          height: '50px',
          position: 'absolute',
          left: `${contextMenu.left}px`,
          top: `${contextMenu.top}px`,
          zIndex: '9999'
        }}
        >
          <button> Assign Parent </button>
        </div>
      } */}
      <AlgoFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onContextMenu={(e) => { FlowContextMenuHandler(e) }}
        indexMap={NodeIndexInArray}
        stateManager={stateManger}
      >
        <Background />
        <Controls />
      </AlgoFlow>
    </div>
  );
}

export default Flow;