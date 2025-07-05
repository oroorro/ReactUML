
import React, { memo, useEffect, useState } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import { useStoreApi } from '../../hook/useStore';
import useUpdateNodeInternals from '../../hook/useUpdateNodeInternals';

import type { NodeProps, ReactChild, Attribute, Pipe, NodeState, updateOptions, Node, NodeDimensionChange, UniqueId, updateOption, UpdateOptionV2, MuteOption, TargetElement } from '../../types';
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
    const { setNodes, getNodes, indexMap } = store.getState();
    const { children, title, color, attributes, id, renderChildrenDirection } = data;
    const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);
    const [expandedprops, setExpandedProps] = useState<string[]>([]);


    function findElementWithTypes(nodeId: UniqueId, otherElementId: UniqueId, elementType: TargetElement): ReactChild | Attribute | undefined {

        const nodes: Node[] = getNodes();

        const currentNodes: ReactChild[] = nodes.map(node => node.data);
        //const reactChild: ReactChild[] = [nodes[0].data];

        const queue: ReactChild[] = [...currentNodes];

        while (queue.length > 0) {
            const currentNode = queue.shift(); // Dequeue the first node

            if (!currentNode) continue;

            // Check if the current node's id matches

            if (currentNode.id === nodeId) {
                if (elementType == 'attribute') {
                    const foundAttribute: Attribute = currentNode.attributes.find(attrib => attrib.id == otherElementId) as Attribute;
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

    useEffect(() => {

        if (data.stateManager && data.stateManager.id) {
            //console.log("data stateManager", data.stateManager.id)
            const id = data.stateManager.id;

            if (!expandedAttributes.includes(id)) {
                setExpandedAttributes((prev) => {

                    return [...prev, id]
                })
            }

        }
    }, [getNodes()])

    const handleUnmute = (id: UniqueId) => {

        const nodes: Node[] = getNodes();

        const currentNodes:ReactChild[] = nodes.map(node => node.data);
        //const reactChild: ReactChild[] = [nodes[0].data];

        let node = findNodeById(id, currentNodes);

        console.log("found node in handleUnmute", node);
        //get the id of node 


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
        if (node) node.muteAll = false;

        setNodes(nodes);

    }

    const updateNodeV2 = (nodeId: string, id: UniqueId, updateOption: UpdateOptionV2) => {

        const nodes: Node[] = getNodes();

        //get the id of node 
        const path = indexMap![nodeId].split('-').map(Number); //FIX this 

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

    const updateNode = (nodeId: UniqueId, targetId: UniqueId, updateOption: updateOption) => {

        //console.log("updateNode", nodeId, targetId, updateOption);
        const nodes: Node[] = getNodes();

        
        const currentNodes: ReactChild[] = nodes.map(node => node.data);
        //const reactChild: ReactChild[] = [nodes[0].data];

        let foundNode = findNodeById(nodeId, currentNodes);
        //console.log("foundNode", foundNode);

        if (foundNode) {
            if (updateOption.target == 'attribute' && updateOption.muteOptions) {
                //const targetAttribute: Attribute = currentNode.children[currentIndex].attributes.find((attrb: Attribute) => attrb.id === id);
                const targetAttribute: Attribute = foundNode.attributes.find((attrb: Attribute) => attrb.id === targetId) as Attribute;
                targetAttribute.mute = updateOption.muteOptions;
            }
            else if (updateOption.target == 'node') {
                if (updateOption.state == 'mute') {
                    foundNode.state = updateOption.muteOptions;
                }
                else if(updateOption.state == 'changingTitle'){
                    const reactChild: ReactChild = foundNode;
                    reactChild.title = updateOption.titleToUpdateTo as string;
                }
                else {
                    const reactChild: ReactChild = foundNode;
                    reactChild.state = updateOption.state;
                }
            }
        } else {
            console.warn("Node can't be found in updateNode");
        }
        setNodes(nodes);
    }

    const handlePropGoingInToChild = (pipe: Pipe) => {

        setExpandedAttributes((prev) => {
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

    //this function gets triggered when user clicks on minimize button on Attributewrapper
    //It will 1. set stateManager.id as empty value in order to prevent re-opening Attributewrapper; since Attributewrapper gets open by getting stateManger.id
    //        2. remove stored stateManager.id in setExpandedAttributes
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
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentId: UniqueId, state: NodeState, renderDirection: string): JSX.Element | null => {
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
            //console.log("mutedAttributeCount", mutedReactChildCount, "data Id:", data.id);
            //console.log(children, "filtered unmuted:", filteredUnMutedReactChilds, "filtered muted", filteredMutedReactChilds, "filtered muting", filteredMutingReactChilds, "data Id:", data.id)
        }

        //using same logic as updateStatesInArray
        //
        const changeReactChildsMuteToMuting = (parentId: UniqueId) => {

            const temp: ReactChild[]
                = filteredMutedReactChilds.map(child => ({
                    ...child,
                    state: 'muting', // Update the `mute` state to 'muting'
                }));

            filteredMutingReactChilds = [...temp, ...filteredMutingReactChilds];
            filteredMutedReactChilds = []; //set muted array to be empty since they all have benn changed into 'muting' state
            updateChildrenInParentNode(parentId);
        }

        //same logic as updateNodeInArray but performed in parent scope 
        //this function receives parentId and find that Node then
        //re-set it's children with filteredMutingReactChilds, filteredUnMutedReactChilds, filteredMutedReactChilds
        //this function is used when clicking on 'muted' child which is the child of parentId
        function updateChildrenInParentNode(parentId: UniqueId) {
            const nodes: Node[] = getNodes();

            const currentNodes: ReactChild[] = nodes.map(node => node.data);
            //const reactChild: ReactChild[] = [nodes[0].data];
            //get the id of parent Node 
            const parentNode = findNodeById(parentId, currentNodes)

            if (parentNode) {
                parentNode.children = [...filteredMutingReactChilds, ...filteredUnMutedReactChilds, ...filteredMutedReactChilds];
            } else {
                console.warn("parentNode couldn't be found in updateChildrenInParentNode(parentId: UniqueId)");
            }

            let newNode: Node[] = nodes.map(node => ({ ...node }));
            setNodes(newNode);
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
                                                    // datatype='Node'
                                                >
                                                    <div
                                                        className="childNode"
                                                        datatype='Node'
                                                        onClick={() => changeReactChildsMuteToMuting(parentId)}

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

                {filteredMutingReactChilds &&
                    <ReactChildrenWrapper
                        reactChildren={filteredMutingReactChilds}
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
                        renderDirection={renderDirection}
                    />
                }
                {filteredUnMutedReactChilds &&
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
                        renderDirection={renderDirection}
                    />
                }


            </div>
        );
    };

    return (

        <div

            style={{
                backgroundColor: color,
                marginLeft: '20px',
                marginRight: '20px',
                marginBottom: '5px',
                // boxShadow: 'inset 0 -5px 5px -5px #333, inset -5px 0 5px -5px #333, inset 5px 0 5px -5px #333'
            }}
            datatype='Node'
            data-id={id}
        >
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
                        // maxWidth: '200px'
                    }}
                    //contentEditable='true'
                    datatype='Node'
                    data-id={id}
                >
                    {title}
                </div>
            </div>

            <div style={{ display: 'flex', }}>

                {attributes && attributes.map((attr: Attribute) => {

                    const isExpanded = expandedAttributes.includes(attr.id);
                    return (
                        <div>
                            {/* <div>{attr.nameOfAttribute}</div>
                            <div>{attr.totalNumberOfAttribute}</div> */}
                            <AttributeIconWrapper nodeId={id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                        </div>
                    );
                })}

            </div>

            {children && renderChildren(children, 1, id, children.state, renderChildrenDirection)}
        </div>
    );
};

ReactNode.displayName = 'ReactNode';

export default ReactNode;
