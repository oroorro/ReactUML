
import React, { memo, useEffect, useState } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import { useStoreApi } from '../../hook/useStore';
import useUpdateNodeInternals from '../../hook/useUpdateNodeInternals';

import type { NodeProps, ReactChild, Attribute, Pipe, NodeState, ReactInBuiltAttributeContent, Node, NodeDimensionChange, UniqueId, updateOption, UpdateOptionV2, MuteOption, TargetElement } from '../../types';
import AttributeIconWrapper from '../NodeAttribute/AttributeIconWrapper';
import ReactChildrenWrapper from '../ReactChild/ReactChildrenWrapper';

import './ReactNodeStyle.css';
import { useStore } from '../../hook/useStore';

const PIPE_WIDTH_VERTICAL = 13;
const PIPE_HEIGHT_VERTICAL = 5;
const PIPE_WIDTH_HORIZONTAL = 5;
const PIPE_HEIGHT_HORIZONTAL = 13;


// setting attribute colors for different icons
const attributeColors: Record<string, string> = {
    import: "#00bfff",
    reactInBuilt: "#ffcc00",
    variable: "#ff5733",
    function: "#bb32bf",
    hook: "#ffb0fe",
    empty: '#808080',
};


const ReactNode = ({
    isConnectable,
    data,
}: NodeProps) => {
    const store = useStoreApi();
    const updateNodeInternals = useUpdateNodeInternals();
    const { setNodes, getNodes, indexMap, onNodesChange } = store.getState();
    const { children, title, color, attributes } = data;
    const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);
    const [expandedprops, setExpandedProps] = useState<string[]>([]);


    function findElementWithTypes(nodeId: UniqueId, otherElementId: UniqueId, elementType: TargetElement): ReactChild | Attribute | undefined{

        const nodes: Node[] = getNodes();

        const reactChild: ReactChild[] = [nodes[0].data];

        const queue: ReactChild[] = [...reactChild];

        while (queue.length > 0) {
            const currentNode = queue.shift(); // Dequeue the first node
        
            if (!currentNode) continue;
        
            // Check if the current node's id matches
          
            if (currentNode.id === nodeId) {
                if(elementType == 'attribute'){
                    const foundAttribute: Attribute = currentNode.attributes.find(attrib=>attrib.id == otherElementId) as Attribute;
                    return foundAttribute;
                }
                return currentNode;
            }
            // Add children to the queue if they exist
            if (currentNode.children && currentNode.children.length > 0) {
              queue.push(...currentNode.children);
            }
        }

        return undefined;
    }

    function updateElements(nodeId: UniqueId, otherElementId: UniqueId, elementType: TargetElement, updateOption: updateOption){

        const foundElement = findElementWithTypes(nodeId, otherElementId, elementType);

        const nodes: Node[] = getNodes();
        if (!foundElement) {
            console.warn(`Element not found for nodeId: ${nodeId}, otherElementId: ${otherElementId}`);
            return;
        }
  
        if ("mute" in foundElement) {
            (foundElement as Attribute).mute = updateOption.muteOptions;
        } else {
            console.warn(`'mute' property does not exist on found element.`);
        }

        setNodes(nodes);

    }

    function findNodeById(nodeId: UniqueId, initialNodes: ReactChild[]): ReactChild | undefined {
        // Use a queue for Breadth-First Search
        const queue: ReactChild[] = [...initialNodes];
      
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

    useEffect(()=>{

        if(data.stateManager.id){
            const id = data.stateManager.id;
          
            if(!expandedAttributes.includes(id)){
                setExpandedAttributes((prev)=>{
               
                    return [...prev, id]
                })
            }
            
        }
    },[getNodes()])
    
    const handleUnmute = (id: UniqueId) => {

        const nodes: Node[] = getNodes();

        const reactChild: ReactChild[] = [nodes[0].data];

        let node = findNodeById(id, reactChild);

        console.log("found node in handleUnmute", node);
        //get the id of node 
        //const path = indexMap![id].split('-').map(Number);

        //update mute flag then setNode to update the display 
        // let format = {
        //     children: [nodes[0].data],
        // }

        // const updatedRoot = { ...format };
        // let currentNode = updatedRoot;

        //for (let i = 0; i < path.length; i++) {
            //const currentIndex = path[i];

            //if (i === path.length - 1) {
                //currentNode.children[currentIndex].muteAll = false;
            //}

            //currentNode = currentNode.children[currentIndex];
        //}

        // nodes[0].data = updatedRoot.children[0];
        // let newNode: Node[] = nodes.map(node => ({ ...node }));
        // newNode[0].data = updatedRoot.children[0];
        if(node)  node.muteAll = false;
       
        setNodes(nodes);

    }

    const updateNodeV2 = (nodeId: string, id: UniqueId, updateOption: UpdateOptionV2) => {

        const nodes: Node[] = getNodes();

        //get the id of node 
        const path = indexMap![nodeId].split('-').map(Number);

        //update mute flag then setNode to update the display 
        let format = {
            children: [nodes[0].data],
        }

        const updatedRoot = { ...format };
        let currentNode = updatedRoot;

        for (let i = 0; i < path.length; i++) {
            const currentIndex = path[i];

            if (i === path.length - 1) {
                if (updateOption.detailOptions && updateOption.detailOptions.muteOptions.muteState) {
                    const targetAttribute: Attribute = currentNode.children[currentIndex].attributes.find((attrb: Attribute) => attrb.id === id);
                    targetAttribute.mute = updateOption.detailOptions.muteOptions.muteState;
                }
                else if (updateOption.target == 'node') {

                    if (updateOption.state == 'none' && updateOption.detailOptions?.muteOptions.unmutingData.unMutedAttributes) {
                        currentNode.children[currentIndex].state = updateOption.state;
                        currentNode.children[currentIndex].attributes = [...updateOption.detailOptions?.muteOptions.unmutingData.unMutedAttributes, ...updateOption.detailOptions?.muteOptions.unmutingData.updatedMutedAttributes]
                    } else {
                        currentNode.children[currentIndex].state = updateOption.state;
                    }
                }
            }
            currentNode = currentNode.children[currentIndex];
        }

        nodes[0].data = updatedRoot.children[0];
        let newNode: Node[] = nodes.map(node => ({ ...node }));
        newNode[0].data = updatedRoot.children[0];

        setNodes(newNode);

    }

    const updateNode = (nodeId: string, id: UniqueId, updateOption: updateOption) => {

        console.log("updateNode", id, updateOption)
        const nodes: Node[] = getNodes();

        //get the id of node 
        const path = indexMap![nodeId].split('-').map(Number);

        const reactChild: ReactChild[] = [nodes[0].data];

        let foundNode = findNodeById(id, reactChild);

        //update mute flag then setNode to update the display 
        // let format = {
        //     children: [nodes[0].data],
        // }

        //const updatedRoot = { ...format };
        //let currentNode = updatedRoot;

        //for (let i = 0; i < path.length; i++) {
            //const currentIndex = path[i];

            //if (i === path.length - 1) {
            if(foundNode){
                if (updateOption.target == 'attribute' && updateOption.muteOptions) {
                    //const targetAttribute: Attribute = currentNode.children[currentIndex].attributes.find((attrb: Attribute) => attrb.id === id);
                    const targetAttribute: Attribute = foundNode.attributes.find((attrb: Attribute) => attrb.id === id) as Attribute;
                    targetAttribute.mute = updateOption.muteOptions;
                }
                else if (updateOption.target == 'node') {



                    if (updateOption.state == 'mute') {
                        //const parentNode: ReactChild[] = currentNode.children[currentIndex].children;
                        const parentNode: ReactChild[] = foundNode.children as ReactChild[];
                        const childNode: ReactChild = parentNode.find(child => child.id == id) as ReactChild;
                        console.log("reactChild", parentNode, childNode);
                        childNode.state = updateOption.muteOptions;
                    } else {
                        //const reactChild: ReactChild = currentNode.children[currentIndex];
                        const reactChild: ReactChild = foundNode;
                        reactChild.state = updateOption.state;
                    }
                    // switch (updateOption.state) {
                    //     case 'none':
                    //         currentNode.children[currentIndex].state = 'none'
                    //         break;

                    //     default:
                    //         break;
                    // }

                }
            }
            // }
            // currentNode = currentNode.children[currentIndex];
        //}

        //nodes[0].data = updatedRoot.children[0];
        //let newNode: Node[] = nodes.map(node => ({ ...node }));
        //newNode[0].data = updatedRoot.children[0];

        setNodes(nodes);

    }


    const handlePropGoingInToChild = (pipe: Pipe) => {
        console.log("pipe clicked ", pipe);
        setExpandedAttributes((prev) => {
            // If already expanded, remove it from the array
            if (prev.includes(pipe.id)) {
                return prev.filter((name) => name !== pipe.id);
            }
            // Otherwise, add it to the array
            return [...prev, pipe.id];
        });
    }

    const displayPropsData = (pipe: Pipe) => {
        setExpandedProps((prev) => {
            // If already expanded, remove it from the array
            if (prev.includes(pipe.id)) {
                return prev.filter((name) => name !== pipe.id);
            }
            // Otherwise, add it to the array
            return [...prev, pipe.id];
        });
    }

    const handleClickOnAttribute = (id: string) => {

        // const nodes: Node[] = getNodes();
        // nodes[0].data.stateManager.id = "";
        // setNodes(nodes);

        setExpandedAttributes((prev) => {
            // If already expanded, remove it from the array
            if (prev.includes(id)) {
                const filtered = prev.filter((name) => name !== id);
                return filtered;
            }
            // Otherwise, add it to the array
            return [...prev, id];
        });
    };

    // Recursive function to render children
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentId: UniqueId, state: NodeState): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        const addPaddingBottom = children[children.length - 1].type && children[children.length - 1].type == 'ghost';


        let mutedReactChildCount: number = 0;
        let filteredMutingReactChilds: ReactChild[] = [];
        let filteredUnMutedReactChilds: ReactChild[] = [];
        let filteredMutedReactChilds: ReactChild[] = [];
        let totalNumberPropsForMutedChild: number = 0;

        if (children) {
            filteredUnMutedReactChilds = children.filter(child => child.state !== 'mute' && child.state !== 'muting');
            filteredMutedReactChilds = children.filter(child => child.state === 'mute');
            filteredMutingReactChilds = children.filter(child => child.state === 'muting');
            totalNumberPropsForMutedChild = filteredMutedReactChilds.reduce((accumulator, node) => accumulator + node.numbersOfPropsGoingIn, 0);

            mutedReactChildCount = filteredMutedReactChilds.length;
            //console.log("mutedAttributeCount", mutedReactChildCount);
            //console.log(children, "filtered unmuted:", filteredUnMutedReactChilds, "filtered muted", filteredMutedReactChilds, "filtered muting", filteredMutingReactChilds)
        }

        //using same logic as updateStatesInArray
        //
        const changeReactChildsMuteToMuting = () => {

            const temp: ReactChild[]
                = filteredMutedReactChilds.map(child => ({
                    ...child,
                    state: 'muting', // Update the `mute` state to 'muting'
                }));

            filteredMutingReactChilds = [...temp, ...filteredMutingReactChilds];
            filteredMutedReactChilds = []; //set muted array to be empty since they all have benn changed into 'muting' state
            updateChildrenInParentNode();
        }

        //same logic as updateNodeInArray but performed in parent scope 
        function updateChildrenInParentNode() {
            const nodes: Node[] = getNodes();

            //get the id of node 
            // const path = indexMap![parentColor].split('-').map(Number);


            // let format = {
            //     children: [nodes[0].data],
            // }
            // const updatedRoot = { ...format };
            // let currentNode = updatedRoot;

            // for (let i = 0; i < path.length; i++) {
            //     const currentIndex = path[i];

            //     if (i === path.length - 1) {
            //         currentNode.children[currentIndex].children = [...filteredMutingReactChilds, ...filteredUnMutedReactChilds, ...filteredMutedReactChilds];
            //     }

            //     currentNode = currentNode.children[currentIndex];
            // }

            // nodes[0].data = updatedRoot.children[0];
            // let newNode: Node[] = nodes.map(node => ({ ...node }));

            // newNode[0].data = updatedRoot.children[0];

            // setNodes(newNode);
        }




        return (

            <div className='returnScope'
                style={{
                    // boxShadow: 'rgba(0,0,0,0.7) 5px 5px 30px inset', 
                    boxShadow: 'inset 0px 48px 66px 0px rgba(72, 72, 72, 0.59)',
                    paddingTop: '10px',
                    overflow: 'hidden',
                    paddingBottom: addPaddingBottom ? '10px' : '',
                    position: 'relative'
                    //if any of this children's children has node type of ghost, then give padding bottom: 10px 
                }}
                datatype='Node'
            >
                {/** not showing the entire return scope when node's state is 'muteReturnScope' */}
                {/** pop-up muting return scope */}
                {state == 'select' &&
                    <button className='absolute top-[0px] right-[0px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'

                        title="Mute Return Scope"
                    >M</button>
                }

                {filteredMutedReactChilds.length > 0 &&
                    <div>
                        <div
                            style={{
                                marginLeft: '10px',
                                padding: '1px',
                            }}
                        > {/* parent's inner boundary where return statement goes */}

                            <div className='pipeStickyWrapper'
                                style={{ position: 'relative' }}
                            >
                                <div
                                    style={{
                                        // position: 'absolute',
                                        top: '0px',
                                        left: '0px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'visible',
                                        filter: 'drop-shadow(rgba(0, 0, 0, 0.9) 6px 4px 2.5px)',
                                    }}
                                    datatype='Node'
                                    data-id={parentId}  //HERE id of Node(parent)
                                >

                                    {/** rendering numbers of props going in to child*/}


                                    <div
                                        datatype='pipe'
                                        className='bg-gray-300 hover:bg-gray-400'
                                        style={{ width: '18px', height: '18px', position: 'relative', left: '-5px' }}>
                                        {totalNumberPropsForMutedChild}
                                    </div>
                                    <div id="pipes" className="flex -left-2 relative gap-0.5"
                                        style={{ transition: 'all 0.3s ease' }}

                                    >

                                        {/* { // circle data when pipe is clicked 
                                                    isExpanded &&
                                                    <div
                                                        className='pipeElement circle'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            width: !showProps ? '13px' : '',
                                                            height: !showProps ? '13px' : '',
                                                            borderRadius: '15px',
                                                            lineHeight: '13px', //ease
                                                            transition: 'all 0.3s ease'
                                                        } as React.CSSProperties & { [key: string]: any }}
                                                        onClick={(e) => { displayPropsData(pipe) }}
                                                    >
                                                        {pipe.numbersOfProps}

                                                    </div>
                                                } */}

                                        {/** rendering each pipes except the tail */}
                                        {/* {i != child.pipes.length - 1 &&
                                                    <div className='flex'>
                                                        <div
                                                            style={{
                                                                height: !showProps ? `${PIPE_HEIGHT_HORIZONTAL}px` : '',
                                                                width: !showProps ? `${PIPE_WIDTH_HORIZONTAL}px` : '',
                                                                position: 'relative',
                                                                // backgroundColor: pipe.color,
                                                                "--bg-color": pipe.color,
                                                                boxShadow: '0 -5px 5px -5px #333',
                                                            } as React.CSSProperties & { [key: string]: any }}
                                                            onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                            className='pipeElement'
                                                            datatype='pipe'
                                                        >

                                                        </div>
                                                    </div>
                                                } */}


                                        {/* { // circle data when pipe is clicked 
                                                    showProps &&
                                                    <div
                                                        className='pipeElement'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            // width: '13px', 
                                                            // height: '13px', 
                                                            borderRadius: '15px',
                                                            lineHeight: '13px'
                                                        } as React.CSSProperties & {
                                                            [key: string]: any
                                                        }}
                                                    >
                                                        {pipe.props && pipe.props.map(prop => (
                                                            <div>
                                                                <span>{prop.name}</span>
                                                                <span>{prop.type}</span>

                                                            </div>
                                                        ))}

                                                    </div>
                                                } */}

                                        {/** redering tail: 
                                                 *    when pipe's number is bigger than 1, render -- vertical arrow of parent's color pipe
                                                 */}
                                        {
                                            <div
                                                datatype='Node'
                                                data-id={parentId}
                                            >
                                                {/* {child.pipes.length > 1 &&
                                                    <div
                                                        className='pipeElement'
                                                        datatype='pipe'
                                                        style={{
                                                            height: `${PIPE_HEIGHT_VERTICAL}px`,
                                                            width: `${PIPE_WIDTH_VERTICAL}px`,
                                                            "--bg-color": pipe.color,
                                                            boxShadow: '0 -5px 5px -5px #333',
                                                        } as React.CSSProperties & { [key: string]: any }}
                                                        onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                    >
                                                    </div>
                                                } */}
                                                {
                                                    <div
                                                        datatype='pipe'
                                                        style={{
                                                            position: 'relative',
                                                            height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                            width: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                            backgroundColor: '#C8C8C8',
                                                            clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 60%, 40% 60%, 40% 0%)',

                                                        }}>
                                                    </div>
                                                }
                                                {/** rendering Node  */}
                                                {/**showing header of current state of muting current Node */}

                                                {/**inside mutingNodes chaging current Node's children Nodes' state into 'notMute' or 'mute'*/}

                                                <div className='NodePositionWrapper'
                                                    datatype='Node'
                                                >
                                                    <div
                                                        className="childNode"
                                                        datatype='Node'
                                                        onClick={() => changeReactChildsMuteToMuting()}

                                                        style={{
                                                            backgroundColor: '#C8C8C8',
                                                            marginLeft: '20px',
                                                            marginRight: '10px',
                                                            marginBottom: '5px',
                                                            marginTop: '5px',

                                                            minWidth: '100px',
                                                            minHeight: '70px',
                                                            padding: '0px 5px 5px 5px',
                                                            boxShadow: '5px 5px 10px'
                                                        }}>  {/*child's outer boundary*/}


                                                        {/** Child's boundary */}
                                                        <div
                                                            style={{
                                                                marginLeft: '20px',
                                                                marginRight: '20px',
                                                                marginBottom: '5px',

                                                            }}
                                                        >
                                                            <div className='NodeTitle'
                                                                style={{
                                                                    height: '30px',
                                                                    fontSize: 'x-large',
                                                                    fontWeight: '900',
                                                                    padding: '0px 2px',
                                                                    maxWidth: '200px'
                                                                }}
                                                                datatype='Node'
                                                            >
                                                                muted...
                                                                {mutedReactChildCount}
                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {/* //filter children by it's state being mute|muting|unmuted or undefined  */}
                {filteredMutingReactChilds && filteredMutingReactChilds.map((child, index) => {

                    //set current Node's attribute to be currently saved filteredMutingAttribute, filteredUnMutedAttribute and filteredMutedAttribute
                    function updateNodeInArray() {
                        const nodes: Node[] = getNodes();

                        //get the id of node 
                        const path = indexMap![child.color].split('-').map(Number);


                        let format = {
                            children: [nodes[0].data],
                        }
                        const updatedRoot = { ...format };
                        let currentNode = updatedRoot;

                        for (let i = 0; i < path.length; i++) {
                            const currentIndex = path[i];

                            if (i === path.length - 1) {
                                currentNode.children[currentIndex].attributes = [...filteredMutingAttribute, ...filteredUnMutedAttribute, ...filteredMutedAttribute];
                            }

                            currentNode = currentNode.children[currentIndex];
                        }

                        nodes[0].data = updatedRoot.children[0];
                        let newNode: Node[] = nodes.map(node => ({ ...node }));

                        newNode[0].data = updatedRoot.children[0];

                        setNodes(newNode);
                    }

                    //this function is used for the part of changing current Node's state to 'none'
                    //where the Node needs to have mutingAttribute:[] to be changed into mutedAttribute:[]
                    const changeMutingToMuted = () => {

                        if (filteredMutingAttribute && filteredMutingAttribute.length > 0) {
                            //1. add mutingAttribute into mutedAttribute 
                            const temp: Attribute[]
                                = filteredMutingAttribute.map(attribute => ({
                                    ...attribute,
                                    mute: 'mute', // Update the `muting` state to 'muted'
                                }));

                            filteredMutedAttribute = [...temp, ...filteredMutedAttribute];
                            //2. have unmutedAttribute
                            // give these two arrayList into updateNode
                            // updateNode will set it's state to be 'none' and set .attribute = [...1, ...2]
                            updateNodeV2(child.color, '-',
                                {
                                    target: 'node', state: 'none',  //changing node's state to 'none'
                                    detailOptions:
                                    {
                                        muteOptions:
                                        {
                                            unmutingData:
                                            {
                                                updatedMutedAttributes: filteredMutedAttribute,  //1
                                                unMutedAttributes: filteredUnMutedAttribute  //2
                                            }
                                        }
                                    }
                                })
                        } else {
                            updateNode(child.color, '-', { target: 'node', state: 'none' })
                        }
                    }

                    let mutedAttributeCount: number;
                    let filteredMutingAttribute: Attribute[];
                    let filteredUnMutedAttribute: Attribute[];
                    let filteredMutedAttribute: Attribute[];

                    //change currently locally saved 'muted' filterd array -> 'muting' locally(it won't cause re-render and won't set nodes in global scope)
                    //then call updateNodeInArray to set current Node's with newly updated 3 filtered arrays, 'muted', 'notmuted' and 'muting'
                    const updateStatesInArray = () => {

                        const temp: Attribute[]
                            = filteredMutedAttribute.map(attribute => ({
                                ...attribute,
                                mute: 'muting', // Update the `mute` state to 'muting'
                            }));

                        filteredMutingAttribute = [...temp, ...filteredMutingAttribute];
                        filteredMutedAttribute = []; //set muted array to be empty since they all have benn changed into 'muting' state

                        updateNodeInArray();
                    }

                    if (child.attributes) {
                        filteredUnMutedAttribute = child.attributes.filter(attibute => attibute.mute === 'notMuted' || attibute.mute === undefined);
                        filteredMutedAttribute = child.attributes.filter(attibute => attibute.mute === 'mute');
                        filteredMutingAttribute = child.attributes.filter(attibute => attibute.mute === 'muting');
                        mutedAttributeCount = filteredMutedAttribute.length;
                        //console.log("mutedAttributeCount", mutedAttributeCount);
                        //console.log(child.title, "filtered unmuted:", filteredUnMutedAttribute, "filtered muted",filteredMutedAttribute, "filtered muting", filteredMutingAttribute)
                    }

                    return (

                        <div
                            key={index}
                            style={{
                                marginLeft: '10px',
                                padding: '1px',
                            }}
                        > {/* parent's inner boundary where return statement goes */}

                            <div className='pipeStickyWrapper'
                                style={{ position: 'relative' }}
                            >
                                <div
                                    style={{
                                        // position: 'absolute',
                                        top: '0px',
                                        left: '0px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'visible',
                                        filter: 'drop-shadow(rgba(0, 0, 0, 0.9) 6px 4px 2.5px)',
                                    }}
                                    datatype='Node'
                                    data-id={parentId}  //HERE id of Node(parent)
                                >

                                    {/** rendering numbers of props going in to child*/}
                                    {state == 'select' && <input style={{ width: '18px', height: '18px' }} type="checkbox" />}
                                    <div
                                        datatype='pipe'
                                        className='bg-white hover:bg-gray-300'
                                        style={{ width: '18px', height: '18px', position: 'relative', left: '-5px' }}>
                                        {child.numbersOfPropsGoingIn}
                                    </div>


                                    {child.pipes.map((pipe, i) => {
                                        const isExpanded = expandedAttributes.includes(pipe.id);
                                        const showProps = expandedprops.includes(pipe.id);

                                        return (
                                            <div id="pipes" className="flex -left-2 relative gap-0.5" key={i}
                                                style={{ transition: 'all 0.3s ease' }}

                                            >

                                                { // circle data when pipe is clicked 
                                                    isExpanded &&
                                                    <div
                                                        className='pipeElement circle'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            width: !showProps ? '13px' : '',
                                                            height: !showProps ? '13px' : '',
                                                            borderRadius: '15px',
                                                            lineHeight: '13px', //ease
                                                            transition: 'all 0.3s ease'
                                                        } as React.CSSProperties & { [key: string]: any }}
                                                        onClick={(e) => { displayPropsData(pipe) }}
                                                    >
                                                        {pipe.numbersOfProps}

                                                    </div>
                                                }

                                                {/** rendering each pipes except the tail */}
                                                {i != child.pipes.length - 1 &&
                                                    <div className='flex'>

                                                        <div
                                                            style={{
                                                                height: !showProps ? `${PIPE_HEIGHT_HORIZONTAL}px` : '',
                                                                width: !showProps ? `${PIPE_WIDTH_HORIZONTAL}px` : '',
                                                                position: 'relative',
                                                                // backgroundColor: pipe.color,
                                                                "--bg-color": pipe.color,
                                                                boxShadow: '0 -5px 5px -5px #333',
                                                            } as React.CSSProperties & { [key: string]: any }}
                                                            onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                            className='pipeElement'
                                                            datatype='pipe'
                                                        >

                                                        </div>
                                                        {state == 'select' && <input style={{ width: '13px', height: '13px' }} type="checkbox" />}
                                                    </div>

                                                }


                                                { // circle data when pipe is clicked 
                                                    showProps &&
                                                    <div
                                                        className='pipeElement'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            // width: '13px', 
                                                            // height: '13px', 
                                                            borderRadius: '15px',
                                                            lineHeight: '13px'
                                                        } as React.CSSProperties & {
                                                            [key: string]: any
                                                        }}
                                                    >
                                                        {pipe.props && pipe.props.map(prop => (
                                                            <div>
                                                                <span>{prop.name}</span>
                                                                <span>{prop.type}</span>

                                                            </div>
                                                        ))}

                                                    </div>
                                                }

                                                {/** redering tail: 
                                                 *    when pipe's number is bigger than 1, render -- vertical arrow of parent's color pipe
                                                 */}
                                                {i == child.pipes.length - 1 &&
                                                    <div
                                                        datatype='Node'
                                                        data-id={parentId}
                                                    >
                                                        {child.pipes.length > 1 &&
                                                            <div
                                                                className='pipeElement'
                                                                datatype='pipe'
                                                                style={{
                                                                    height: `${PIPE_HEIGHT_VERTICAL}px`,
                                                                    width: `${PIPE_WIDTH_VERTICAL}px`,
                                                                    "--bg-color": pipe.color,
                                                                    boxShadow: '0 -5px 5px -5px #333',
                                                                } as React.CSSProperties & { [key: string]: any }}
                                                                onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                            >
                                                            </div>
                                                        }
                                                        {child.pipes.length == 1 &&
                                                            <div
                                                                datatype='pipe'
                                                                style={{
                                                                    position: 'relative',
                                                                    height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                                    width: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                                    backgroundColor: pipe.color,
                                                                    clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 60%, 40% 60%, 40% 0%)',

                                                                }}>
                                                            </div>
                                                        }
                                                        {/** rendering Node  */}
                                                        {/**showing header of current state of muting current Node */}
                                                        {child.state == 'select' &&
                                                            <div>
                                                                {/* <input style={{ width: '18px', height: '18px' }} type="checkbox" />  */}
                                                                <div className='flex justify-center'>
                                                                    <div >
                                                                        <div className='bg-white px-1 rounded '>Selecting...</div>
                                                                    </div>
                                                                    {/* we need to emptyFilteredMutingAttribute then call updateNode to change the current Node's state to 'none' */}
                                                                    {/* <span onClick={() => updateNode(child.color, '-', { target: 'node', state: 'none'})} >Done</span> */}
                                                                    <span className='bg-white hover:bg-gray-200 ml-2 px-1 rounded ' onClick={() => changeMutingToMuted()} >Done</span>

                                                                </div>
                                                            </div>}

                                                        {/* {state == 'select' && child.type != 'ghost' &&
                                                            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
                                                                onClick={() => updateNode(child.color, '-', { target: 'node', state: 'mute', muteOptions: 'mute' })}
                                                                title="Mute Node"
                                                            >M</button>
                                                        } */}



                                                        {child.type != 'ghost' && <div className='NodePositionWrapper relative'
                                                            datatype='Node'
                                                            data-id={`${pipe.color}`}
                                                        >
                                                            {/** muting state pop-up icons */}
                                                            <div className='flex absolute top-[0px] right-[0px] flex-col'>
                                                                <div className='bg-white hover:bg-gray-300 px-1.5'
                                                                    onClick={() => updateNode(parentId, child.id, { target: 'node', state: 'mute', muteOptions: 'notMuted' })}
                                                                    title='unmute Node'
                                                                >
                                                                    U
                                                                </div>
                                                                <div className='bg-white hover:bg-gray-300 px-1.5'
                                                                    onClick={() => updateNode(parentId, child.id, { target: 'node', state: 'mute', muteOptions: 'mute' })}
                                                                    title='mute back Node'
                                                                >
                                                                    {"<"}
                                                                </div>
                                                            </div>

                                                            <div
                                                                className="childNode"
                                                                datatype='Node'
                                                                data-id={child.id}
                                                                style={{
                                                                    backgroundColor: child.color,
                                                                    marginLeft: '20px',
                                                                    marginRight: '10px',
                                                                    marginBottom: '5px',
                                                                    marginTop: '5px',

                                                                    minWidth: '100px',
                                                                    minHeight: '70px',
                                                                    padding: '0px 5px 5px 5px',
                                                                    boxShadow: '5px 5px 10px'
                                                                }}>  {/*child's outer boundary*/}


                                                                {/** Child's boundary */}
                                                                <div
                                                                    style={{
                                                                        marginLeft: '20px',
                                                                        marginRight: '20px',
                                                                        marginBottom: '5px',
                                                                        boxShadow: 'inset 0 -5px 5px -5px #333, inset -5px 0 5px -5px #333, inset 5px 0 5px -5px #333'
                                                                    }}
                                                                >
                                                                    <div className='NodeTitle'
                                                                        style={{
                                                                            height: '30px',
                                                                            fontSize: 'x-large',
                                                                            fontWeight: '900',
                                                                            padding: '0px 5px',
                                                                            maxWidth: '200px'
                                                                        }}
                                                                        //contentEditable='true'
                                                                        datatype='Node'
                                                                        data-id={child.id}
                                                                    >
                                                                        {child.title}
                                                                    </div>
                                                                </div>
                                                                {!child.muteAll &&
                                                                    <div className='AttributeContainer'
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '5px',
                                                                            flexWrap: 'wrap',
                                                                            // alignItems: 'flex-start',
                                                                            padding: '4px 2px'
                                                                        }}

                                                                    > {/** displaying attributes */}

                                                                        {/** displaying muted attributes , onClick changes to show, muted and muting*/}
                                                                        {mutedAttributeCount > 0 &&
                                                                            <div className='flex items-end'>
                                                                                <div style={{ fontSize: '18px', fontWeight: '500' }} className='bg-white hover:bg-gray-300 flex px-0.5 rounded'
                                                                                    title="expand muted"
                                                                                >
                                                                                    <div onClick={() => updateStatesInArray()}>{mutedAttributeCount} ...</div>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                        {/** displaying muting attributes */}
                                                                        {filteredMutingAttribute &&
                                                                            filteredMutingAttribute.map((attr: Attribute, index: number) => {
                                                                                const isExpanded = expandedAttributes.includes(attr.id);
                                                                                return (
                                                                                    <div className='flex items-end'>
                                                                                        <div>
                                                                                            <div className='flex justify-center'>
                                                                                                <div className='bg-white hover:bg-gray-300 px-0.5'
                                                                                                    onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                                    title='mute back'
                                                                                                >
                                                                                                    {"<"}
                                                                                                </div>
                                                                                                <div className='bg-white hover:bg-gray-300 px-0.5'
                                                                                                    onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'notMuted' })}
                                                                                                    title='unmute'
                                                                                                >
                                                                                                    U
                                                                                                </div>
                                                                                            </div>
                                                                                            <AttributeIconWrapper nodeId={child.id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                                        </div>
                                                                                    </div>

                                                                                )
                                                                            })
                                                                        }
                                                                        {child.attributes && filteredUnMutedAttribute.map((attr: Attribute, index: number) => {
                                                                            const isExpanded = expandedAttributes.includes(attr.id);
                                                                            return (
                                                                                <div className='flex items-end'>
                                                                                    {child.state == 'select' &&
                                                                                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded'
                                                                                            //onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                            onClick={() => findElementWithTypes(child.id, attr.id, 'attribute')}
                                                                                            title="mute"
                                                                                        >-</button>}
                                                                                    <AttributeIconWrapper nodeId={child.id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                                </div>
                                                                            )

                                                                        })}
                                                                    </div>}
                                                                {child.muteAll == true && <button onClick={() => handleUnmute(child.id)}>...</button>}
                                                                {!child.muteAll && renderChildren(child.children, level + 1, child.id, child.state as NodeState)}
                                                            </div>
                                                        </div>}
                                                    </div>
                                                }
                                            </div>
                                        )

                                    })}

                                </div>
                            </div>
                        </div>
                    )

                })}
                {/* {filteredUnMutedReactChilds && 
                <ReactChildrenWrapper 
                    reactChildren={filteredUnMutedReactChilds}
                    renderChildren={renderChildren}
                    expandedAttributes={expandedAttributes}
                    expandedprops={expandedprops}
                    state={state}
                    level={level}
                    parentId={parentId}
                    handleUnmute={handleUnmute}
                    findElementWithTypes={findElementWithTypes}
                    handleClickOnAttribute={handleClickOnAttribute}
                    attributeColors={attributeColors}
                    updateNode={updateNode}
                    updateNodeV2={updateNodeV2}
                    handlePropGoingInToChild={handlePropGoingInToChild}
                    displayPropsData={displayPropsData}
                    /> 
                } */}

                {filteredUnMutedReactChilds && filteredUnMutedReactChilds.map((child, index) => {

                    //set current Node's attribute to be currently saved filteredMutingAttribute, filteredUnMutedAttribute and filteredMutedAttribute
                    function updateNodeInArray() {
                        const nodes: Node[] = getNodes();

                        //get the id of node 
                        const path = indexMap![child.color].split('-').map(Number);


                        let format = {
                            children: [nodes[0].data],
                        }
                        const updatedRoot = { ...format };
                        let currentNode = updatedRoot;

                        for (let i = 0; i < path.length; i++) {
                            const currentIndex = path[i];

                            if (i === path.length - 1) {
                                currentNode.children[currentIndex].attributes = [...filteredMutingAttribute, ...filteredUnMutedAttribute, ...filteredMutedAttribute];
                            }

                            currentNode = currentNode.children[currentIndex];
                        }

                        nodes[0].data = updatedRoot.children[0];
                        let newNode: Node[] = nodes.map(node => ({ ...node }));

                        newNode[0].data = updatedRoot.children[0];

                        setNodes(newNode);
                    }

                    //this function is used for the part of changing current Node's state to 'none'
                    //where the Node needs to have mutingAttribute:[] to be changed into mutedAttribute:[]
                    const changeMutingToMuted = () => {

                        if (filteredMutingAttribute && filteredMutingAttribute.length > 0) {
                            //1. add mutingAttribute into mutedAttribute 
                            const temp: Attribute[]
                                = filteredMutingAttribute.map(attribute => ({
                                    ...attribute,
                                    mute: 'mute', // Update the `muting` state to 'muted'
                                }));

                            filteredMutedAttribute = [...temp, ...filteredMutedAttribute];
                            //2. have unmutedAttribute
                            // give these two arrayList into updateNode
                            // updateNode will set it's state to be 'none' and set .attribute = [...1, ...2]
                            updateNodeV2(child.color, '-',
                                {
                                    target: 'node', state: 'none',  //changing node's state to 'none'
                                    detailOptions:
                                    {
                                        muteOptions:
                                        {
                                            unmutingData:
                                            {
                                                updatedMutedAttributes: filteredMutedAttribute,  //1
                                                unMutedAttributes: filteredUnMutedAttribute  //2
                                            }
                                        }
                                    }
                                })
                        } else {
                            updateNode(child.color, '-', { target: 'node', state: 'none' })
                        }
                    }

                    let mutedAttributeCount: number;
                    let filteredMutingAttribute: Attribute[];
                    let filteredUnMutedAttribute: Attribute[];
                    let filteredMutedAttribute: Attribute[];

                    //change currently locally saved 'muted' filterd array -> 'muting' locally(it won't cause re-render and won't set nodes in global scope)
                    //then call updateNodeInArray to set current Node's with newly updated 3 filtered arrays, 'muted', 'notmuted' and 'muting'
                    const updateStatesInArray = () => {

                        const temp: Attribute[]
                            = filteredMutedAttribute.map(attribute => ({
                                ...attribute,
                                mute: 'muting', // Update the `mute` state to 'muting'
                            }));

                        filteredMutingAttribute = [...temp, ...filteredMutingAttribute];
                        filteredMutedAttribute = []; //set muted array to be empty since they all have benn changed into 'muting' state

                        updateNodeInArray();
                    }

                    if (child.attributes) {
                        filteredUnMutedAttribute = child.attributes.filter(attibute => attibute.mute === 'notMuted' || attibute.mute === undefined);
                        filteredMutedAttribute = child.attributes.filter(attibute => attibute.mute === 'mute');
                        filteredMutingAttribute = child.attributes.filter(attibute => attibute.mute === 'muting');
                        mutedAttributeCount = filteredMutedAttribute.length;
                        //console.log(child.title, "filtered unmuted:", filteredUnMutedAttribute, "filtered muted",filteredMutedAttribute, "filtered muting", filteredMutingAttribute)
                    }

                    return (

                        <div
                            key={index}
                            style={{
                                marginLeft: '10px',
                                padding: '1px',
                            }}
                        > {/* parent's inner boundary where return statement goes */}

                            <div className='pipeStickyWrapper'
                                style={{ position: 'relative' }}
                            >
                                <div
                                    style={{
                                        // position: 'absolute',
                                        top: '0px',
                                        left: '0px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'visible',
                                        filter: 'drop-shadow(rgba(0, 0, 0, 0.9) 6px 4px 2.5px)',
                                    }}
                                    datatype='Node'
                                    data-id={parentId}  //HERE id of Node(parent)
                                >

                                    {/** rendering numbers of props going in to child*/}
                                    {state == 'select' && <input style={{ width: '18px', height: '18px' }} type="checkbox" />}
                                    <div
                                        datatype='pipe'
                                        className='bg-white hover:bg-gray-300'
                                        style={{ width: '18px', height: '18px', position: 'relative', left: '-5px' }}>
                                        {child.numbersOfPropsGoingIn}
                                    </div>


                                    {child.pipes.map((pipe, i) => {
                                        const isExpanded = expandedAttributes.includes(pipe.id);
                                        const showProps = expandedprops.includes(pipe.id);

                                        return (
                                            <div id="pipes" className="flex -left-2 relative gap-0.5" key={i}
                                                style={{ transition: 'all 0.3s ease' }}

                                            >

                                                { // circle data when pipe is clicked 
                                                    isExpanded &&
                                                    <div
                                                        className='pipeElement circle'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            width: !showProps ? '13px' : '',
                                                            height: !showProps ? '13px' : '',
                                                            borderRadius: '15px',
                                                            lineHeight: '13px', //ease
                                                            transition: 'all 0.3s ease'
                                                        } as React.CSSProperties & { [key: string]: any }}
                                                        onClick={(e) => { displayPropsData(pipe) }}
                                                    >
                                                        {pipe.numbersOfProps}

                                                    </div>
                                                }

                                                {/** rendering each pipes except the tail */}
                                                {i != child.pipes.length - 1 &&
                                                    <div className='flex'>

                                                        <div
                                                            style={{
                                                                height: !showProps ? `${PIPE_HEIGHT_HORIZONTAL}px` : '',
                                                                width: !showProps ? `${PIPE_WIDTH_HORIZONTAL}px` : '',
                                                                position: 'relative',
                                                                // backgroundColor: pipe.color,
                                                                "--bg-color": pipe.color,
                                                                boxShadow: '0 -5px 5px -5px #333',
                                                            } as React.CSSProperties & { [key: string]: any }}
                                                            onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                            className='pipeElement'
                                                            datatype='pipe'
                                                        >

                                                        </div>
                                                        {state == 'select' && <input style={{ width: '13px', height: '13px' }} type="checkbox" />}
                                                    </div>

                                                }


                                                { // circle data when pipe is clicked 
                                                    showProps &&
                                                    <div
                                                        className='pipeElement'
                                                        style={{
                                                            "--bg-color": pipe.color,
                                                            // width: '13px', 
                                                            // height: '13px', 
                                                            borderRadius: '15px',
                                                            lineHeight: '13px'
                                                        } as React.CSSProperties & {
                                                            [key: string]: any
                                                        }}
                                                    >
                                                        {pipe.props && pipe.props.map(prop => (
                                                            <div>
                                                                <span>{prop.name}</span>
                                                                <span>{prop.type}</span>

                                                            </div>
                                                        ))}

                                                    </div>
                                                }

                                                {/** redering tail: 
                                                 *    when pipe's number is bigger than 1, render -- vertical arrow of parent's color pipe
                                                 */}
                                                {i == child.pipes.length - 1 &&
                                                    <div
                                                        datatype='Node'
                                                        data-id={parentId}
                                                    >
                                                        {child.pipes.length > 1 &&
                                                            <div
                                                                className='pipeElement'
                                                                datatype='pipe'
                                                                style={{
                                                                    height: `${PIPE_HEIGHT_VERTICAL}px`,
                                                                    width: `${PIPE_WIDTH_VERTICAL}px`,
                                                                    "--bg-color": pipe.color,
                                                                    boxShadow: '0 -5px 5px -5px #333',
                                                                } as React.CSSProperties & { [key: string]: any }}
                                                                onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                            >
                                                            </div>
                                                        }
                                                        {child.pipes.length == 1 &&
                                                            <div
                                                                datatype='pipe'
                                                                style={{
                                                                    position: 'relative',
                                                                    height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                                    width: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                                    backgroundColor: pipe.color,
                                                                    clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 60%, 40% 60%, 40% 0%)',

                                                                }}>
                                                            </div>
                                                        }
                                                        {/** rendering Node  */}
                                                        {/**showing header of current state of muting current Node */}
                                                        {child.state == 'select' &&
                                                            <div>
                                                                {/* <input style={{ width: '18px', height: '18px' }} type="checkbox" />  */}
                                                                <div className='flex justify-center' >
                                                                    <div className=''>
                                                                        <div className='bg-white px-1 rounded typewrite'>Selecting...</div>
                                                                    </div>
                                                                    {/* we need to emptyFilteredMutingAttribute then call updateNode to change the current Node's state to 'none' */}
                                                                    {/* <span onClick={() => updateNode(child.color, '-', { target: 'node', state: 'none'})} >Done</span> */}
                                                                    <span className='bg-white hover:bg-gray-200 ml-2 px-1 rounded ' onClick={() => changeMutingToMuted()} >Done</span>

                                                                </div>
                                                            </div>}
                                                        {/** inside filteredUnMutedNodes, chaging current Node's children Nodes' state into 'mute'*/}

                                                        {child.type != 'ghost' && <div className='NodePositionWrapper relative'
                                                            datatype='Node'
                                                            data-id={`${pipe.color}`}
                                                        >
                                                            {state == 'select' && child.type != 'ghost' &&
                                                                <button className='absolute top-[0px] right-[0px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
                                                                    onClick={() => updateNode(parentId, child.id, { target: 'node', state: 'mute', muteOptions: 'mute' })}
                                                                    title="Mute Node"
                                                                >M</button>
                                                            }
                                                            <div
                                                                className="childNode"
                                                                datatype='Node'
                                                                data-id={child.id}
                                                                style={{
                                                                    backgroundColor: child.color,
                                                                    marginLeft: '20px',
                                                                    marginRight: '10px',
                                                                    marginBottom: '5px',
                                                                    marginTop: '5px',

                                                                    minWidth: '100px',
                                                                    minHeight: '70px',
                                                                    padding: '0px 5px 5px 5px',
                                                                    boxShadow: '5px 5px 10px'
                                                                }}>  {/*child's outer boundary*/}


                                                                {/** Child's boundary */}
                                                                <div
                                                                    style={{
                                                                        marginLeft: '20px',
                                                                        marginRight: '20px',
                                                                        marginBottom: '5px',
                                                                        boxShadow: 'inset 0 -5px 5px -5px #333, inset -5px 0 5px -5px #333, inset 5px 0 5px -5px #333'
                                                                    }}
                                                                >
                                                                    <div className='NodeTitle'
                                                                        style={{
                                                                            height: '30px',
                                                                            fontSize: 'x-large',
                                                                            fontWeight: '900',
                                                                            padding: '0px 5px',
                                                                            maxWidth: '200px'
                                                                        }}
                                                                        //contentEditable='true'
                                                                        datatype='Node'
                                                                        data-id={child.id}
                                                                    >
                                                                        {child.title}
                                                                    </div>
                                                                </div>
                                                                {!child.muteAll &&
                                                                    <div className='AttributeContainer'
                                                                        style={{
                                                                            display: 'flex',
                                                                            gap: '5px',
                                                                            flexWrap: 'wrap',
                                                                            // alignItems: 'flex-start',
                                                                            padding: '4px 2px'
                                                                        }}

                                                                    > {/** displaying attributes */}

                                                                        {/** displaying muted attributes , onClick changes to show, muted and muting*/}
                                                                        {mutedAttributeCount > 0 &&
                                                                            <div className='flex items-end'>
                                                                                <div style={{ fontSize: '18px', fontWeight: '500' }} className='bg-white hover:bg-gray-300 flex px-0.5 rounded'
                                                                                    title="expand muted"
                                                                                >
                                                                                    <div onClick={() => updateStatesInArray()}>{mutedAttributeCount} ...</div>
                                                                                </div>
                                                                            </div>
                                                                        }
                                                                        {/** displaying muting attributes */}
                                                                        {filteredMutingAttribute &&
                                                                            filteredMutingAttribute.map((attr: Attribute, index: number) => {
                                                                                const isExpanded = expandedAttributes.includes(attr.id);
                                                                                return (
                                                                                    <div className='flex items-end'>
                                                                                        <div>
                                                                                            <div className='flex justify-center'>
                                                                                                <div className='bg-white hover:bg-gray-300 px-0.5'
                                                                                                    onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                                    title='mute back'
                                                                                                >
                                                                                                    {"<"}
                                                                                                </div>
                                                                                                <div className='bg-white hover:bg-gray-300 px-0.5'
                                                                                                    onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'notMuted' })}
                                                                                                    title='unmute'
                                                                                                >
                                                                                                    U
                                                                                                </div>
                                                                                            </div>
                                                                                            <AttributeIconWrapper nodeId={child.id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                                        </div>
                                                                                    </div>

                                                                                )
                                                                            })
                                                                        }
                                                                        {child.attributes && filteredUnMutedAttribute.map((attr: Attribute, index: number) => {
                                                                            const isExpanded = expandedAttributes.includes(attr.id);
                                                                            return (
                                                                                <div className='flex items-end'>
                                                                                    {child.state == 'select' &&
                                                                                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded'
                                                                                            //onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                            onClick={() => updateElements(child.id, attr.id, 'attribute', { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                            title="mute"
                                                                                        >-</button>}
                                                                                    <AttributeIconWrapper nodeId={child.id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                                </div>
                                                                            )

                                                                        })}
                                                                    </div>}
                                                                {child.muteAll == true && <button onClick={() => handleUnmute(child.id)}>...</button>}
                                                                {!child.muteAll && renderChildren(child.children, level + 1, child.id, child.state as NodeState)}
                                                            </div>
                                                        </div>}
                                                    </div>
                                                }
                                            </div>
                                        )

                                    })}

                                </div>
                            </div>
                        </div>
                    )

                })}

            </div>
        );
    };

    return (
        <div style={{ backgroundColor: color }}
            datatype='Node'
            data-id={color}
        >
            <h3>{title}</h3>
            <div style={{ display: 'flex' }}>
                {attributes.map((attr: Attribute) => (
                    <div>
                        <div>{attr.nameOfAttribute}</div>
                        <div>{attr.totalNumberOfAttribute}</div>
                    </div>
                ))}
            </div>
            {renderChildren(children, 1, color, children.state)}
        </div>
    );
};

ReactNode.displayName = 'ReactNode';

export default ReactNode;
