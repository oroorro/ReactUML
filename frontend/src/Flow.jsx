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

let initialNodes = [
  {
    id: '3',
    position: { x: 50, y: 50 },
    type: 'ReactNode',

    data: {
      indexMap: NodeIndexInArray,
      stateManager: stateManger,
      label: '3',
      title: 'ZoomPane',
      color: '#dfe7f5',
      id: '1qlx7vx-jj26d3',
      attributes: [
        {
          nameOfAttribute: 'import',
          id: '1949d9bf4d6-03aee0',
          totalNumberOfAttribute: 15,
          AttributeContents: [
            {
              name: 'initialNodes',
              belongsTo: 'X2D',
              id: '194bef45ea2-031087'
            }
          ]
        },
        {
          nameOfAttribute: 'reactInBuilt',
          id: '1949d9bf4d6-12831d',
          totalNumberOfAttribute: 5,
          AttributeContents: [
            {
              name: 'UseEffect',
              belongsTo: 'X2D',
              id: '194bef45ea2-0faf69'
            }
          ]
        },
        {
          nameOfAttribute: 'variable',
          id: '1949d9bf4d6-170d62',
          totalNumberOfAttribute: 9,
          AttributeContents: [
            {
              name: 'names',
              type: 'string[]',
              id: '194bef45ea2-0aa763',
              belongsTo: '1949d9bf4d6-170d62',
            },
            {
              name: 'users',
              type: 'User[]',
              id: '194bef45ea2-14f0d1',
              belongsTo: '1949d9bf4d6-170d62',
            },
            {
              name: 'userLocation',
              type: '[string, number, number]',
              id: '194bef45ea2-05e1b3',
              belongsTo: '1949d9bf4d6-170d62',
            },
            {
              name: 'buttonColor',
              type: "red | green | blue",
              id: '194bef45ea2-0fe9ab',
              belongsTo: 'XW2',
            },
            {
              name: 'userId',
              type: 'string | number',
              id: '194bef45ea2-059bfb',
              belongsTo: 'X2D',
            },
            {
              name: 'currentUserRole',
              type: 'UserRole',
              id: '194bef45ea2-0d0fc0',
              //nestedType: {string 'nameOfType': object 'typeDef'}
              belongsTo: 'X2D',
            }
          ]
        },
      ],
      children: [
        {
          title: "NodeRenderer",
          numbersOfPropsGoingIn: 18,
          color: '#ffa8d5',
          state: 'select',
          id: '1qlx7vx-107d1f',
          renderChildrenDirection: 'horizontal',
          attributes: [
            {
              nameOfAttribute: 'import',
              id: '1949d9bf4d6-0d6927',
              mute: 'notMuted',
              totalNumberOfAttribute: 15,
              AttributeContents: [
                {
                  name: 'initialNodes',
                  belongsTo: 'X2D',
                  id: '194bef45ea2-14d67a'
                }
              ]
            },
            {
              nameOfAttribute: 'import',
              id: '1949d9bf4d6-169917',
              mute: 'notMuted',
              totalNumberOfAttribute: 15,
              AttributeContents: [

              ]
            },
            {
              nameOfAttribute: 'variable',
              id: '1949d9bf4d6-108cbe',
              totalNumberOfAttribute: 12,
              mute: 'notMuted',
              AttributeContents: [
                {
                  name: 'names',
                  type: 'string[]',
                  belongsTo: 'X2D',
                  id: '194bef45ea2-057271'
                },
                {
                  name: 'users',
                  type: 'User[]',
                  belongsTo: 'X2D',
                  id: '194bef45ea2-16a5de'
                },
                {
                  name: 'userLocation',
                  type: '[string, number, number]',
                  belongsTo: 'X2D',
                  id: '194bef45ea2-0100ed',
                },
                {
                  name: 'buttonColor',
                  type: "red | green | blue",
                  belongsTo: 'XW2',
                  id: '194bef45ea2-115e9f',
                },
                {
                  name: 'userId',
                  type: 'string | number',
                  belongsTo: 'X2D',
                  id: '194bef45ea2-03569b'
                },
                {
                  name: 'currentUserRole',
                  type: 'UserRole',
                  //nestedType: {string 'nameOfType': object 'typeDef'}
                  belongsTo: 'X2D',
                  id: '194bef45ea2-073467'
                }
              ]
            },
          ],
          pipes: [
            {
              color: '#dfe7f5',
              numbersOfProps: 18,
              name: "Node",
              id: '194c3ff3761-09dc10',
              attributeContents: []
            },
          ],
          children: [
            {
              title: "EdgeRenderer",
              numbersOfPropsGoingIn: 15,
              color: '#f26d1f',
              id: '1qlx7vx-011409',
              // state: 'select',
              pipes: [
                {
                  color: '#dfe7f5',
                  numbersOfProps: 8,
                  id: '194c3ff3761-07d567',
                  name: "Node",
                  attributeContents:[],
                },
                {
                  color: '#ffa8d5',
                  numbersOfProps: 7,
                  id: '194c3ff3761-183b89',
                  name: "Edge",
                  attributeContents:[],
                },
              ],
              children: [
                {
                  title: "Pane",
                  numbersOfPropsGoingIn: 1,
                  color: '#49abf5',
                  id: '1qlx7vx-def456',
                  attributes: [
                    {
                      nameOfAttribute: 'import',
                      id: '1949d9bf4d6-0e2d64',
                      totalNumberOfAttribute: 15,
                      AttributeContents: [
                        {
                          name: 'initialNodes',
                          belongsTo: 'X2D',
                          id: '194bef45ea2-04db24'
                        }
                      ]
                    },
                    {
                      nameOfAttribute: 'reactInBuilt',
                      id: '1949d9bf4d6-0816c7',
                      totalNumberOfAttribute: 5,
                      AttributeContents: [
                        {
                          typeOfReactInbuilt: 'UseEffect',
                          reactInbuiltAttributes: [
                            {
                              name: '[Strarray, numArray]',
                              belongsTo: '2X',
                            }
                          ],
                          id: '194bef45ea2-01d4c4'
                        }
                      ]
                    },
                  ],
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 4,
                      name: "Node",
                      id: '194c3ff3761-1597d2',
                      attributeContents: [
                        { name: "Attribute_1", type: "string", id: '194c3ff3762-185170' },
                        { name: "Attribute_2", type: "number", id: '194c3ff3762-04eb6c' },
                        { name: "Attribute_3", type: "boolean", id: '194c3ff3762-0bf8ac' },
                        { name: "Attribute_4", type: "Date", id: '194c3ff3762-09dcac' },
                      ]
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 11,
                      name: "Edge",
                      id: '194c3ff3762-094898',
                      attributeContents: [
                        { name: "Attribute_8", type: "boolean", belongsTo: "OP", id: "194d3686e6a-12d4f9" },
                        { name: "Attribute_9", type: "Date", belongsTo: "QR", id: "194d3686e6a-125ce6" },
                        { name: "Attribute_10", type: "object", belongsTo: "ST", id: "194d3686e6a-00a0c5" },
                        { name: "Attribute_11", type: "string", belongsTo: "UV", id: "194d3686e6a-144c1b" },
                        { name: "Attribute_12", type: "number", belongsTo: "WX", id: "194d3686e6a-0eda68" },
                        { name: "Attribute_13", type: "boolean", belongsTo: "YZ", id: "194d3686e6a-0b9c3a" },
                        { name: "Attribute_14", type: "Date", belongsTo: "AA", id: "194d3686e6a-04b7df" },
                        { name: "Attribute_15", type: "object", belongsTo: "BB", id: "194d3686e6a-0f1e64" },
                        { name: "Attribute_16", type: "string", belongsTo: "CC", id: "194d3686e6a-05d9c3" },
                        { name: "Attribute_17", type: "number", belongsTo: "DD", id: "194d3686e6a-06c9a4" },
                        { name: "Attribute_18", type: "boolean", belongsTo: "EE", id: "194d3686e6a-0a12b7" },
                        { name: "Attribute_19", type: "Date", belongsTo: "FF", id: "194d3686e6a-08fd6e" }
                      ]
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 6,
                      name: "Edge",
                      id: '194c3ff3762-16f298',
                      attributeContents: [
                        { name: "FirstName", type: "string", belongsTo: "AB", id: "194d36a4fa3-08dae3" },
                        { name: "LastName", type: "string", belongsTo: "CD", id: "194d36a4fa3-02e7fb" },
                        { name: "Age", type: "number", belongsTo: "EF", id: "194d36a4fa3-03286e" },
                        { name: "IsActive", type: "boolean", belongsTo: "GH", id: "194d36a4fa3-0128af" },
                        { name: "CreatedAt", type: "Date", belongsTo: "IJ", id: "194d36a4fa3-0ab8d9" },
                        { name: "Address", type: "object", belongsTo: "KL", id: "194d36a4fa3-0f983d" }
                      ]
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 11,
                      name: "ZoomScale",
                      id: '194c3ff3762-037d40',
                      attributeContents: [
                        { name: "PhoneNumber", type: "string", belongsTo: "MN", id: "194d36c42f2-055ae8" },
                        { name: "Email", type: "string", belongsTo: "OP", id: "194d36c42f2-03f881" },
                        { name: "Salary", type: "number", belongsTo: "QR", id: "194d36c42f2-072e2c" },
                        { name: "IsVerified", type: "boolean", belongsTo: "ST", id: "194d36c42f2-09398c" },
                        { name: "HireDate", type: "Date", belongsTo: "UV", id: "194d36c42f2-111ac1" },
                        { name: "Department", type: "string", belongsTo: "WX", id: "194d36c42f2-05ad85" },
                        { name: "Role", type: "string", belongsTo: "YZ", id: "194d36c42f2-01d8b0" },
                        { name: "ProjectDetails", type: "object", belongsTo: "AA", id: "194d36c42f2-06b112" },
                        { name: "Country", type: "string", belongsTo: "BB", id: "194d36c42f2-13ab7e" },
                        { name: "City", type: "string", belongsTo: "CC", id: "194d36c42f2-079302" },
                        { name: "PostalCode", type: "string", belongsTo: "DD", id: "194d36c42f2-14cf29" }
                      ]
                    },
                  ],
                },
                {
                  title: "Zoom",
                  numbersOfPropsGoingIn: 4,
                  color: '#e8c390',
                  id: '1qlx7vx-093e0a',
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 5,
                      name: "Node",
                      id: '194c3ff3762-068b33',
                      attributeContents: []
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 52,
                      name: "Edge",
                      id: '194c3ff3762-1390bf',
                      attributeContents: []
                    },
                    {
                      color: 'green',
                      numbersOfProps: 3,
                      name: "Edge",
                      id: '194c3ff3762-02e023',
                      attributeContents: []
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 11,
                      name: "Edge",
                      id: '194c3ff3762-12cc15',
                      attributeContents: []
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 1,
                      name: "ZoomScale",
                      id: '194c3ff3762-0d0e6a',
                      attributeContents: []
                    },
                  ],
                },
                {
                  title: 'ghost',
                  type: 'ghost',
                  id: '1qlx7vx-0106d3',
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 5,
                      name: "Node",
                      id: '194c3ff3762-040828',
                      attributeContents: []
                    },
                  ]
                }
              ],
            },
          ],
        },
        {
          title: "Store",
          numbersOfPropsGoingIn: 2,
          color: '#ffdc6b',
          id: '1qlx7vx-99k6j3',
          pipes: [
            {
              color: '#dfe7f5',
              numbersOfProps: 2,
              name: "InitialNodes[]",
              id: '194c3ff3762-091b09'
            },
          ],
        },
      ],
    },
  },

];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

//creates unique id
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomValue = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomValue}`;
}


//used for creating Pipe 
const ghostChild = {
  title: 'ghost',
  numbersOfPropsGoingIn: 1,
  color: '#abcdef',
  id: generateUniqueId(),
  pipes: [
    {
      color: '#dfe7f5',
      numbersOfProps: 18,
      name: "Node",
      id: generateUniqueId(),
    },
  ],
  attributes: [],
  type: 'ghost',
};

function Flow() {

  const flowRef = useRef(null);
  const interactingIdRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const nodeId = useRef(5);
  const { createNode, editNode, createAttribute, createPipe, loading, error } = useBatchController();
  const { getAllNodesForUser} = useNodeApiAuth();

  const fetchNodes = async () => {
    try {
      const nodes = await getAllNodesForUser(); // No userId needed!
      console.log('Fetched nodes:', nodes);
    } catch (err) {
      console.error('Error fetching nodes:', err);
    }
  };

  useEffect(() => {
    if (contextMenu) console.log("contextMenu is set as ", contextMenu)
  }, [contextMenu])

  useEffect(()=>{
    fetchNodes();
  },[])



  const handleCreateNode = async (color, nodeUid, isStartingNode, name, parentId = null) => {

    const nodeData = {
      uid: nodeUid,
      name: name,
      isStartingNode: isStartingNode,
      color: color
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

  function performUpdateElement(root, id, type, data = null) {

    const newChild = {
      title: 'NewNode',
      numbersOfPropsGoingIn: 1,
      color: generateRandomHexColor(),
      id: generateUniqueId(),
      pipes: [
        {
          color: '#dfe7f5',
          numbersOfProps: 18,
          name: "Node",
          id: generateUniqueId(),
          attributeContents: []
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
            {
              name: 'initialNodes',
              belongsTo: 'X2D',
              id: generateUniqueId()
            }
          ]
        },
      ];
      handleCreateAttribute(attributeUid, id, data ? data : 'empty', 0, false)
    }
    else if (type == 'Prop') {
      //creating a pipe
      foundNode.children = [
        ...foundNode.children,
        type == 'Node' ? newChild : ghostChild,
      ];
      handleCreatePipe(ghostChild.id, foundNode.color, id);
    }
    //creating Node and Prop
    else {
      //create Node button has clicked on background, create a Node in the backgroun
      if (!foundNode) {
        const nodeUid = generateUniqueId();
        const color = generateRandomHexColor(); 
        handleCreateNode(color, nodeUid, true, 'StartNode');
        // nodes.children = [
        //   ...(nodes.children || []),
        //   {
        //     title: 'StartNode',
        //     id: nodeUid,
        //     numbersOfPropsGoingIn: 0,
        //     color: color,
        //     renderChildrenDirection: 'horizontaol',
        //     children: [],
        //     attributes: [],
        //     pipes: [],
        //   },
        // ]; 

        addNodeToInitialNodes(
          nodes, {
          // id: generateUniqueId(),
          position: { x: 100, y: 100 },
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

        console.log("nodes", nodes);
      }
      //create button was not triggered in the background
      else {
        // If the foundNode does not have children, create a new node ( child ) to that foundNode
        //console.log("foundNode", foundNode);
        if (foundNode.children != null) {
          console.log("create a child Node within a Node ");
          foundNode.children = [...foundNode.children, newChild];
          handleCreateNode(newChild.color, newChild.id, false, 'StartNode', foundNode.id);
          handleCreatePipe(newChild.pipes[0].id, foundNode.color, id);
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
  const updateElement = (type, data = null) => {
    //we need to format data in order to add Node correctly,
    //making data to be the root 

    const currentNodes = [...nodes.map(node => node.data)];
    //performUpdateElement(nodes[0].data.children, contextMenu.nodeId, type, data);
    performUpdateElement(currentNodes, contextMenu.nodeId, type, data);

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
    //console.log("updatedReactChild WITH DATA", initialNodes)
    //update node

    const currentNodes = [...nodes.map(node => node.data)];
    //updateElementState('attribute', nodes[0].data.children, ids[0], 'editing');
    updateElementState('attribute', currentNodes, ids[0], 'editing');

    setNodes(updatedNode);

    setContextMenu(null)
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
          {!contextMenu.detail && <button >Delete</button>}
          {!contextMenu.detail && <button onClick={() => copyNode()}>Copy</button>}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("mute-2nd")}> Mute </button>}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("renderDirection")}> Display </button>}

          {contextMenu.detail == 'create' && <button className='create_node_button' onClick={() => updateElement('Node')}> Node </button>}
          {contextMenu.detail == 'create' && <button className='create_pipe_button' onClick={() => updateElement('Prop')}> Prop </button>}
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
              <button className="attribute_button_sub_just_create" onClick={() => updateElement('Attribute')}> Just Create </button>
              <button className="attribute_button_sub_select_type" onClick={() => moveToSubMenu("create-attribute-3rd")} > Select Type </button>
            </div>
          }

          {/** Attribute 3rd layer of sub-menu, iterate attribute-3rd-array */}
          {contextMenu.detail == 'create-attribute-3rd' &&
            <div className='flex flex-col' datatype="contextMenu">
              {attributeColors.map((attribute) => (
                <button className={`attribute_button_sub_3rd_select_type ${attribute}`} onClick={() => updateElement('Attribute', attribute)}>{attribute}</button>
              ))}
            </div>
          }

        </div>}
      {contextMenu && contextMenu.nodeType === 'pipe' &&
        <div
          style={{
            backgroundColor: 'aliceblue',
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
          datatype="contextMenu"
        >
          {!contextMenu.detail && <button datatype="contextMenu" onClick={() => moveToSubMenu("mute-2nd-pipe")}>Mute</button>}
          {!contextMenu.detail && <button datatype="contextMenu" onClick={() => elementStateHandler('pipe', 'editing')} >add</button>}

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