
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
              id:'194bef45ea2-0aa763',
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
              id:'194bef45ea2-0fe9ab',
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
              id: 'X2'
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
                  id: '1qlx7vx-093e0a',
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
                  id: '1qlx7vx-0106d3',
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
          id: '1qlx7vx-99k6j3',
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

//creates unique id
function generateUniqueId() {
  const timestamp = Date.now().toString(36);
  const randomValue = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomValue}`;
}


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


  function performUpdateElement(root, id, type, data = null) {

    const newChild = {
      title: 'NewNode',
      numbersOfPropsGoingIn: 1,
      color: '#abcdef',
      id: generateUniqueId(),
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

    let foundNode = findNodeById(id, root);

    //console.log("found node in <Flow>", foundNode);

    //creating Attribute 
    if (type == 'Attribute') {
      foundNode.attributes = [
        ...(foundNode.attributes || []),
        {
          nameOfAttribute: data ? data : 'empty',
          id: generateUniqueId(),
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
    }
    //creating Node and Prop
    else {

      // If the child at the current index doesn't exist, create a placeholder node
      if (!foundNode.children) {
        foundNode.children = [newChild];
      } else {
        foundNode.children = [
          ...foundNode.children,
          type == 'Node' ? newChild : ghostChild,
        ];
      }
    }
  }

  //add/delete element; Node, Prop and Attribute
  //this function calls performUpdateElement 
  //then setNodes 
  const updateElement = (type, data = null) => {
    //we need to format data in order to add Node correctly,
    //making data to be the root 
    performUpdateElement(nodes[0].data.children, contextMenu.nodeId, type, data);

    const updatedNode = [...nodes];

    //update node
    setNodes(updatedNode);
    //close contextMenu 
    setContextMenu(null)
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
    //console.log("elementWithDatatype", elementWithDatatype);

    const nodeDataId = target.getAttribute('data-id') ? target.getAttribute('data-id') : target.parentElement?.getAttribute('data-id');
    const nodeDataType = target.getAttribute('datatype') ? target.getAttribute('datatype') : target.parentElement?.getAttribute('datatype');

    interactingIdRef.current = nodeDataId;
    console.log("target context", nodeDataId);
    console.log("nodeDataType", nodeDataType);

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

    if (elementWithDatatype.getAttribute('datatype') === 'Attribute') {
      setContextMenu({
        nodeId: elementWithDatatype.getAttribute('data-id'),
        nodeType: 'Attribute',
        left: event.clientX,
        top: event.clientY
      })

    }
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

    updateElementState('attribute', nodes[0].data.children, ids[0], 'editing');
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
    updateElementState(target, nodes[0].data.children, interactingIdRef.current, option);
    const updatedNode = [...nodes]; //shallow copy 
    setNodes(updatedNode);
    setContextMenu(null);

  }

  //update node's state by given node's id 
  const updateElementState = (target, root, nodeId, state) => { 
    const updatedRoot = [...root];
    // let currentNode = updatedRoot;
    let foundNode = findNodeById(nodeId, updatedRoot);

    if(target == 'node'){
      if (state == 'mute') {
        foundNode.muteAll = true;
      }
      else if (state == 'select') {
        foundNode.state = 'select';
      }
    }else if(target == 'attribute'){
      const ids = contextMenu.nodeId.split('+');// id[0] is nodeid and id[1] is attribute id 

      const attribute = foundNode.attributes.find((attrib)=> attrib.id == ids[1]);
      attribute.state = state;
      console.log("found attribute", attribute);
    }
    

  }


  function findNodeParent(childNodeId, startingNode){

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
  const deleteElement = (type) =>{

    if(type == 'Attribute'){
      const copiedRoot = [...nodes[0].data.children]

      const ids = contextMenu.nodeId.split('+');// ids[0] is nodeid and ids[1] is attribute id 
      if(!ids) console.warn("No ids exist");

      //get Node 
      let foundNode = findNodeById(ids[0], copiedRoot);
      if(!foundNode) console.warn("Node couldn't be found")

      //filter out Attribute except deleting Attribute 
      const filtered = foundNode.attributes.filter((attrib)=> attrib.id != ids[1]);
      foundNode.attributes = [...filtered];
    }

    //update the nodes 
    const updatedNode = [...nodes];
    setNodes(updatedNode);
    setContextMenu(null);

  }


  return (
    <div className='Flow' style={{ width: "100vw", height: "100vh" }}
    // onClick={(e) => FlowClickHandler(e)}
    // onMouseDown={(e) => FlowClickHandler(e)}
    >
      {contextMenu && contextMenu.nodeType === 'Node' &&
        <div
          className='flex flex-col bg-white px-2 py-1'
          style={{
           
            position: 'absolute',
            left: `${contextMenu.left}px`,
            top: `${contextMenu.top}px`,
            zIndex: '9999'
          }}
          id={contextMenu.nodeId}
          datatype="contextMenu"
        >
          
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("create")}>Create</button>}
          {!contextMenu.detail && <button >Delete</button>}
          {!contextMenu.detail && <button onClick={() => moveToSubMenu("mute-2nd")}> Mute </button>}
          {contextMenu.detail == 'create' && <button onClick={() => updateElement('Node')}> Node </button>}
          {contextMenu.detail == 'create' && <button onClick={() => updateElement('Prop')}> Prop </button>}
          {contextMenu.detail == 'create' && <button onClick={() => moveToSubMenu("create-attribute-2nd")}> Attribute </button>}

          {/** mute 2nd layer of sub-menu */}
          {contextMenu.detail == 'mute-2nd' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button onClick={() => elementStateHandler('node', 'mute')}> all </button>
              <button onClick={() => elementStateHandler('node', 'select')}> select </button>
            </div>
          }

          {/** Attribute 2nd layer of sub-menu*/}
          {contextMenu.detail == 'create-attribute-2nd' &&
            <div className='flex flex-col' datatype="contextMenu">
              <button onClick={() => updateElement('Attribute')}> Just Create </button>
              <button onClick={() => moveToSubMenu("create-attribute-3rd")} > Select Type </button>
            </div>
          }

          {/** Attribute 3rd layer of sub-menu, iterate attribute-3rd-array */}
          {contextMenu.detail == 'create-attribute-3rd' &&
            <div className='flex flex-col' datatype="contextMenu">
              {attributeColors.map((attribute) => (
                <button onClick={() => updateElement('Attribute', attribute)}>{attribute}</button>
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
          datatype="contextMenu"
        >
          <button datatype="contextMenu" onClick={() => updateElement()}>create</button>
        </div>}
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
          <button onClick={()=>deleteElement('Attribute')}> Delete </button>
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
        stateManager={stateManger}
      >
        <Background />
        <Controls />
      </AlgoFlow>
    </div>
  );
}

export default Flow;