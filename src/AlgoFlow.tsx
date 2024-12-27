import React, {useRef,  useCallback, useContext } from 'react';

import { StoreApi } from 'zustand';
import { UseBoundStoreWithEqualityFn } from 'zustand/traditional';
import { Provider } from './contexts/StoreContext';
import { createRFStore } from './store';
import type { ReactFlowState, Node } from './types';
import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useStore, useStoreApi } from './hook/useStore';
import {getEventPosition} from './utils/index';
import StoreContext from './contexts/StoreContext';

import { shallow } from 'zustand/shallow';


interface AllTypeProps {
    initialNodes: Node[];
    className?: string;
  }

interface ComponentProps {
    children?: React.ReactNode;
    isSelecting? : boolean;

}

interface NodeProps {
    data: Node;
    className?: string;
  }


const selector = (s: ReactFlowState) => ({
    userSelectionActive: s.userSelectionActive,
    elementsSelectable: s.elementsSelectable,
    dragging: s.paneDragging,
  });


function AlgoFlow(){

    




    const store = useStoreApi();
    const containerBounds = useRef<DOMRect>();
    const { userSelectionActive, elementsSelectable, dragging } = useStore(selector, shallow);
    const container = useRef<HTMLDivElement | null>(null);


    const initialNodes:Node[] = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
        { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    ];


    const ZoomPane: React.FC<ComponentProps> = ({ children }) => {
        return (
          <div className='ZoomPane'>{children}</div>
        );
    };

    const Pane: React.FC<ComponentProps>  = ({children, isSelecting}) =>{

        const onMouseDown = (event:ReactMouseEvent) => {

            const { resetSelectedElements, domNode } = store.getState();

            containerBounds.current = domNode?.getBoundingClientRect();
      
            if (
              !elementsSelectable ||
              !isSelecting ||
              event.button !== 0 ||
              event.target !== container.current ||
              !containerBounds.current
            ) {
              return;
            }
      
            const { x, y } = getEventPosition(event, containerBounds.current);
      
            resetSelectedElements();
      
            store.setState({
              userSelectionRect: {
                width: 0,
                height: 0,
                startX: x,
                startY: y,
                x,
                y,
              },
            });
      
            //onSelectionStart?.(event);
          };

        return(
            <div className='Pane'>{children}</div>
        )
    }

    const ViewPort: React.FC<ComponentProps>  = ({children}) =>{
        return(
            <div className='ViewPort'>{children}</div>
        )
    }

    const FlowRenderer: React.FC<ComponentProps> = ({children}) =>{
        return(
            <div className="FlowRenderer">
            <ZoomPane>
               <Pane>
                   {children}
               </Pane>
            </ZoomPane>
            </div>
           
        )
   }

   const NodeRenderer: React.FC<AllTypeProps> = ({initialNodes}) => {

    return (
        <>
            {initialNodes.map(node => (
                <Node key={node.id} data={node} />
            ))}
        </>
    );
}
    
    const GraphView: React.FC<AllTypeProps>  = ({initialNodes}) =>{





        return(
            <FlowRenderer >
                <ViewPort>
                   <NodeRenderer initialNodes={initialNodes}>
                   </NodeRenderer>
                </ViewPort>
            </FlowRenderer>
        )
    }

    //creates store 
    const Wrapper: React.FC<AllTypeProps>  = ({initialNodes}) => {
         
        //const isWrapped = useContext(StoreContext);

        const storeRef = useRef<UseBoundStoreWithEqualityFn<StoreApi<ReactFlowState>> | null>(null);

        if (!storeRef.current) {
          storeRef.current = createRFStore();
        }

        return(
            <Provider value={storeRef.current}>
            <GraphView  initialNodes={initialNodes}>
            </GraphView>
            </Provider>
        )
    }



    

    

    

    const Node: React.FC<NodeProps> = ({data}) =>{

        const nodeStyle: CSSProperties = {
        position: "absolute",
        width: "100px",
        height: "80px",
        backgroundColor: "tomato",
        top: `${data.position.y}px`,
        left: `${data.position.x}px`
        };

        return(
            <div className={`Node-${data.id}`} style={nodeStyle}>
                {data.data.label}
            </div>
        )
    }


    const Background = () =>{
        return(
            <div className="background" style={{width: "100%", height: "100%"}}>
            </div>
        )
    }

    return(
        <div className='ReactFlow'>
            <Wrapper initialNodes={initialNodes}>
            </Wrapper>
            <Background/>
        </div>
    )

}

export default AlgoFlow;