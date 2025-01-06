
import React, { forwardRef} from 'react';
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
import {useNodesState, useEdgesState} from "./hook/useNodesEdgesState";
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
          nameOfAttribute: 'React_InBuilt',
          totalNumberOfAttribute: 5,
          AttributeContents: [
            {
              name: 'UseEffect',
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
              nameOfAttribute: 'React_InBuilt',
              totalNumberOfAttribute: 5,
              AttributeContents: [
                {
                  name: 'UseEffect',
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
                  pipes: [
                    {
                      color: '#dfe7f5',
                      numbersOfProps: 1,
                      name: "Node",
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 1,
                      name: "Edge",
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 1,
                      name: "Edge",
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 1,
                      name: "ZoomScale",
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
                      numbersOfProps: 1,
                      name: "Node",
                    },
                    {
                      color: '#ffa8d5',
                      numbersOfProps: 1,
                      name: "Edge",
                    },
                    {
                      color: 'green',
                      numbersOfProps: 1,
                      name: "Edge",
                    },
                    {
                      color: 'blue',
                      numbersOfProps: 1,
                      name: "Edge",
                    },
                    {
                      color: '#f26d1f',
                      numbersOfProps: 1,
                      name: "ZoomScale",
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
  <div className='Flow' style={{width:"100vw", height:"100vh"}}>
  <AlgoFlow
    ref={flowRef}
    nodes={nodes}
    edges={edges}
    onNodesChange={onNodesChange}
    onEdgesChange={onEdgesChange}
    onConnect={onConnect}
  >
    <Background /> 
    <Controls/>
  </AlgoFlow>
  </div>  
);
}

export default Flow;