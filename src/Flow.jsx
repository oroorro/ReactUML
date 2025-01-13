
import React, { forwardRef } from 'react';
import { useCallback, useRef, useEffect } from 'react';
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



// import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { label: '1' },
  },
  {
    id: '2',
    position: { x: 0, y: 100 },
    data: { label: '2' },
  },
  {
    id: '3',
    position: { x: 50, y: 50 },
    type: 'ReactNode',

    data: {
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

function Flow() {

  const flowRef = useRef(null);

  useEffect(() => {
    if (flowRef.current) {
      console.log("Child component's DOM node:", flowRef.current.className);
    }
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className='Flow' style={{ width: "100vw", height: "100vh" }}>
      <AlgoFlow
        ref={flowRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </AlgoFlow>
    </div>
  );
}

export default Flow;