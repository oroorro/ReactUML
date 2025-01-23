
import React, { forwardRef } from 'react';
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

const NodeIndexInArray = {
  '#dfe7f5': '0', //ZoomPane
  '#ffa8d5': '0-0',  //NodeRenderer
  '#f26d1f': '0-0-0', //EdgeRenderer
  '#49abf5': '0-0-0-0', //Pane
  '#e8c390': '0-0-0-1',  //Zoom
  '#ffdc6b': '0-1', //Store
}

const attributeColors = ['import', 'reactInBuilt', 'variable', 'function', 'hook', 'create type',]


const initialNodes = [
  {
    id: '3',
    position: { x: 50, y: 50 },
    type: 'ReactNode',

    data: {
      indexMap: NodeIndexInArray,
      label: '3',
      title: 'ZoomPane',
      color: '#dfe7f5',
      attributes: [
        {
          nameOfAttribute: 'import',
          totalNumberOfAttribute: 15,
          AttributeContents: [
            {
              name: 'initialNodes',
              belongsTo: 'X2D',
            }
          ]
        },
        {
          nameOfAttribute: 'reactInBuilt',
          totalNumberOfAttribute: 5,
          AttributeContents: [
            {
              name: 'UseEffect',
              belongsTo: 'X2D',
            }
          ]
        },
        {
          nameOfAttribute: 'vars',
          totalNumberOfAttribute: 9,
          AttributeContents: [
            {
              name: 'names',
              type: 'string[]',
              belongsTo: 'X2D',
            },
            {
              name: 'users',
              type: 'User[]',
              belongsTo: 'X2D',
            },
            {
              name: 'userLocation',
              type: '[string, number, number]',
              belongsTo: 'X2D',
            },
            {
              name: 'buttonColor',
              type: "red | green | blue",
              belongsTo: 'XW2',
            },
            {
              name: 'userId',
              type: 'string | number',
              belongsTo: 'X2D',
            },
            {
              name: 'currentUserRole',
              type: 'UserRole',
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
          attributes: [
            {
              nameOfAttribute: 'import',
              totalNumberOfAttribute: 15,
              AttributeContents: [
                {
                  name: 'initialNodes',
                  belongsTo: 'X2D',
                }
              ]
            },
            {
              nameOfAttribute: 'import',
              totalNumberOfAttribute: 15,
              AttributeContents: [

              ]
            },
            {
              nameOfAttribute: 'vars',
              totalNumberOfAttribute: 12,
              AttributeContents: [
                {
                  name: 'names',
                  type: 'string[]',
                  belongsTo: 'X2D',
                },
                {
                  name: 'users',
                  type: 'User[]',
                  belongsTo: 'X2D',
                },
                {
                  name: 'userLocation',
                  type: '[string, number, number]',
                  belongsTo: 'X2D',
                },
                {
                  name: 'buttonColor',
                  type: "red | green | blue",
                  belongsTo: 'XW2',
                },
                {
                  name: 'userId',
                  type: 'string | number',
                  belongsTo: 'X2D',
                },
                {
                  name: 'currentUserRole',
                  type: 'UserRole',
                  //nestedType: {string 'nameOfType': object 'typeDef'}
                  belongsTo: 'X2D',
                }
              ]
            },
          ],
          pipes: [
            {
              color: '#dfe7f5',
              numbersOfProps: 18,
              name: "Node",
              id: 'X2'
            },
          ],
          children: [
            {
              title: "EdgeRenderer",
              numbersOfPropsGoingIn: 15,
              color: '#f26d1f',
              pipes: [
                {
                  color: '#dfe7f5',
                  numbersOfProps: 8,
                  //props
                  name: "Node",
                },
                {
                  color: '#ffa8d5',
                  numbersOfProps: 7,
                  name: "Edge",
                },
              ],
              children: [
                {
                  title: "Pane",
                  numbersOfPropsGoingIn: 1,
                  color: '#49abf5',
                  attributes: [
                    {
                      nameOfAttribute: 'import',
                      totalNumberOfAttribute: 15,
                      AttributeContents: [
                        {
                          name: 'initialNodes',
                          belongsTo: 'X2D',
                        }
                      ]
                    },
                    {
                      nameOfAttribute: 'reactInBuilt',
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
                        }
                      ]
                    },
                  ],
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 4,
                      name: "Node",
                      id: 'XI',
                      props: [
                        { name: "Attribute_1", type: "string", belongsTo: "AB" },
                        { name: "Attribute_2", type: "number", belongsTo: "CD" },
                        { name: "Attribute_3", type: "boolean", belongsTo: "EF" },
                        { name: "Attribute_4", type: "Date", belongsTo: "GH" },
                      ]
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 11,
                      name: "Edge",
                      id: 'G8',
                      props: [
                        { name: "Attribute_8", type: "boolean", belongsTo: "OP" },
                        { name: "Attribute_9", type: "Date", belongsTo: "QR" },
                        { name: "Attribute_10", type: "object", belongsTo: "ST" },
                        { name: "Attribute_11", type: "string", belongsTo: "UV" },
                        { name: "Attribute_12", type: "number", belongsTo: "WX" },
                        { name: "Attribute_13", type: "boolean", belongsTo: "YZ" },
                        { name: "Attribute_14", type: "Date", belongsTo: "AA" },
                        { name: "Attribute_15", type: "object", belongsTo: "BB" },
                        { name: "Attribute_16", type: "string", belongsTo: "CC" },
                        { name: "Attribute_17", type: "number", belongsTo: "DD" },
                        { name: "Attribute_18", type: "boolean", belongsTo: "EE" },
                        { name: "Attribute_19", type: "Date", belongsTo: "FF" },
                      ]
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 6,
                      name: "Edge",
                      id: 'L0',
                      props: [
                        { name: "FirstName", type: "string", belongsTo: "AB" },
                        { name: "LastName", type: "string", belongsTo: "CD" },
                        { name: "Age", type: "number", belongsTo: "EF" },
                        { name: "IsActive", type: "boolean", belongsTo: "GH" },
                        { name: "CreatedAt", type: "Date", belongsTo: "IJ" },
                        { name: "Address", type: "object", belongsTo: "KL" },
                      ]
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 11,
                      name: "ZoomScale",
                      id: 'K6',
                      props: [
                        { name: "PhoneNumber", type: "string", belongsTo: "MN" },
                        { name: "Email", type: "string", belongsTo: "OP" },
                        { name: "Salary", type: "number", belongsTo: "QR" },
                        { name: "IsVerified", type: "boolean", belongsTo: "ST" },
                        { name: "HireDate", type: "Date", belongsTo: "UV" },
                        { name: "Department", type: "string", belongsTo: "WX" },
                        { name: "Role", type: "string", belongsTo: "YZ" },
                        { name: "ProjectDetails", type: "object", belongsTo: "AA" },
                        { name: "Country", type: "string", belongsTo: "BB" },
                        { name: "City", type: "string", belongsTo: "CC" },
                        { name: "PostalCode", type: "string", belongsTo: "DD" },
                      ]
                    },
                  ],
                },
                {
                  title: "Zoom",
                  numbersOfPropsGoingIn: 4,
                  color: '#e8c390',
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 5,
                      name: "Node",
                      id: 'E3'
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 52,
                      name: "Edge",
                      id: 'P3'
                    },
                    {
                      color: 'green',
                      numbersOfProps: 3,
                      name: "Edge",
                      id: 'H3'
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 11,
                      name: "Edge",
                      id: 'U3'
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 1,
                      name: "ZoomScale",
                      id: 'R3'
                    },
                  ],
                },
                {
                  title: 'ghost',
                  type: 'ghost',
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 5,
                      name: "Node",
                      id: 'E3'
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
          pipes: [
            {
              color: '#dfe7f5',
              numbersOfProps: 2,
              name: "InitialNodes[]",
              id: 'K3'
            },
          ],
        },
      ],
    },
  },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function addChildToReactChildIterative(root, id, newChild, type) {
  const path = NodeIndexInArray[id].split('-').map(Number); // Convert the path to an array of indices
  const updatedRoot = { ...root }; // Create a shallow copy of the root for immutability

  let currentNode = updatedRoot; // Start from the root node

  for (let i = 0; i < path.length; i++) {
    const currentIndex = path[i];

    if (type == 'Attribute') {
      if (!currentNode.attributes) {
        currentNode.attributes = [];
      }

      if (i === path.length - 1) {
        currentNode.children[currentIndex].attributes = [
          ...(currentNode.children[currentIndex].attributes || []),
          {
            nameOfAttribute: 'empty',
            totalNumberOfAttribute: 0,
            AttributeContents: [
              {
                name: 'initialNodes',
                belongsTo: 'X2D',
              }
            ]
          },
        ];
      }
    }
    //creating Node and Prop
    else {
      // Ensure children array exists
      if (!currentNode.children) {
        currentNode.children = [];
      }

      // If the child at the current index doesn't exist, create a placeholder node
      if (!currentNode.children[currentIndex]) {
        currentNode.children[currentIndex] = {
          title: '',
          numbersOfPropsGoingIn: 0,
          color: '',
          pipes: [],
          attributes: [],
          children: [],
        };
      }

      // If this is the last index, add the new child to the current node's children
      if (i === path.length - 1) {
        currentNode.children[currentIndex].children = [
          ...(currentNode.children[currentIndex].children || []),
          type == 'Node' ? newChild : ghostChild,
        ];
      }
    }

    // Move to the next node in the path
    currentNode = currentNode.children[currentIndex];
  }

  return updatedRoot; // Return the updated tree
}

const newChild = {
  title: 'NewNode',
  numbersOfPropsGoingIn: 1,
  color: '#abcdef',
  pipes: [
    {
      color: '#dfe7f5',
      numbersOfProps: 18,
      name: "Node",
      id: 'X2'
    },
  ],
  attributes: [],
};

const ghostChild = {
  title: 'ghost',
  numbersOfPropsGoingIn: 1,
  color: '#abcdef',
  pipes: [
    {
      color: '#dfe7f5',
      numbersOfProps: 18,
      name: "Node",
      id: 'X2'
    },
  ],
  attributes: [],
  type: 'ghost',
};

function Flow() {

  const flowRef = useRef(null);
  const interactingIdRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (flowRef.current) {
      console.log("Child component's DOM node:", flowRef.current.className);
    }
  }, []);

  useEffect(() => {
    console.log("contextMenu changed:", JSON.parse(JSON.stringify(contextMenu)));
  }, [contextMenu])

  //returns Node from nodes array for given id 
  const muteNode = (root, id) => {
    const path = NodeIndexInArray[id].split('-').map(Number);
    const updatedRoot = { ...root };
    let currentNode = updatedRoot;

    for (let i = 0; i < path.length; i++) {
      const currentIndex = path[i];

      if (i === path.length - 1) {
        currentNode.children[currentIndex].muteAll = true;
      }

      currentNode = currentNode.children[currentIndex];
    }
    return updatedRoot;
  }

  const updateNode = (type) => {
    //we need to format data in order to add Node correctly,
    //making data to be the root 
    const format = {
      children: [nodes[0].data],
    }

    const updatedReactChild = addChildToReactChildIterative(format, contextMenu.nodeId, newChild, type);
    //applying updated part to original initialNodes[0].data
    nodes[0].data = { ...updatedReactChild.children[0] };
    const updateNode = [...nodes];
    //console.log("updatedReactChild WITH DATA", initialNodes)
    //update node
    setNodes(updateNode);
    setContextMenu(null)
  }

  const addProp = () => {

  }

  const moveToSubMenu = (type) => {

    setContextMenu(prev => {
      return {
        nodeId: prev.nodeId,
        nodeType: 'Node',
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

  const FlowContextMenuHandler = (event) => {

    //get the type of element; which will be either 1. 1-Node other than return scope, 2-Node's return scope   2. pipe  3. Attribute

    event.preventDefault();
    const target = event.target;
    const nodeDataId = target.getAttribute('data-id') ? target.getAttribute('data-id') : target.parentElement?.getAttribute('data-id');
    const nodeDataType = target.getAttribute('datatype') ? target.getAttribute('datatype') : target.parentElement?.getAttribute('datatype');

    interactingIdRef.current = nodeDataId;
    //console.log("target context", nodeDataId);
    //console.log("nodeDataType", nodeDataType);

    if (nodeDataType === 'Node') {
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
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  function FlowClickHandler(event) {

    let target = event.target;
    let targetParent = target.parentElement
    console.log("target click", target.getAttribute('datatype'))

    if (targetParent.getAttribute('datatype') !== 'contextMenu') {
      setContextMenu(null)
    }
  }

  const muteHandler = () => {
    //get id of Node , interactingIdRef.current

    //access that Node in 
    const format = {
      children: [nodes[0].data],
    }
    //console.log("nodes nodes", nodes[0].data);
    setContextMenu(null);
    const updatedReactChild = muteNode(format, interactingIdRef.current);
    //console.log("returned node: ", updatedReactChild);
    initialNodes[0].data = { ...updatedReactChild.children[0] };
    nodes[0].data = { ...updatedReactChild.children[0] };
    const updateNode = [...nodes];
    // console.log("initialNodes returned:", JSON.parse(JSON.stringify(initialNodes))); 
    // console.log("nodes returned:", JSON.parse(JSON.stringify(nodes))); 
    setNodes(updateNode);

  }

  return (
    <div className='Flow' style={{ width: "100vw", height: "100vh" }}
      onClick={(e) => FlowClickHandler(e)}
      onMouseDown={(e) => FlowClickHandler(e)}
    >
      {contextMenu && contextMenu.nodeType === 'Node' &&
        <div
          className='flex flex-col'
          style={{
            backgroundColor: 'tomato',
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
          datatype="contextMenu"
        >
          {contextMenu.nodeId}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("createOnElement")}>create</button>}
          {!contextMenu.detail && <button onClick={() => muteHandler()}> mute </button>}
          {contextMenu.detail == 'create' && <button onClick={() => updateNode('Node')}> Node </button>}
          {contextMenu.detail == 'create' && <button onClick={() => updateNode('Prop')}> Prop </button>}
          {contextMenu.detail == 'create' && <button onClick={() => moveToSubMenu("create-attribute-2nd")}> Attribute </button>}

          {/** Attribute 2nd layer of sub-menu*/}
          {contextMenu.detail == 'create-attribute-2nd' && 
            <div className='flex flex-col' datatype="contextMenu"> 
              <button onClick={() => updateNode('Attribute')}> Just Create </button> 
              <button onClick={() => moveToSubMenu("create-attribute-3rd")} > Select Type </button>
            </div>
          }

          {/** Attribute 3rd layer of sub-menu, iterate attribute-3rd-array */} 
          {contextMenu.detail == 'create-attribute-3rd' && 
            <div className='flex flex-col' datatype="contextMenu">
            {  attributeColors.map((attribute)=>(
              <button>{attribute}</button>
            ))}
            </div>
          }

        </div>}
      {contextMenu && contextMenu.nodeType === 'pipe' &&
        <div
          style={{
            backgroundColor: 'grey',
            width: '50px',
            height: '50px',
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
        >
          <button datatype="contextMenu" onClick={() => updateNode()}>create</button>
        </div>}
      <AlgoFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onContextMenu={(e) => { FlowContextMenuHandler(e) }}
        indexMap={NodeIndexInArray}
      >
        <Background />
        <Controls />
      </AlgoFlow>
    </div>
  );
}

export default Flow;