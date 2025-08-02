import type { ReactChildrenWrapperProps, Pipe, Attribute, Node, NodeState, UniqueId, ReactChild } from "../../types";
import { useStoreApi } from "../../hook/useStore";
import AttributeIconWrapper from "../NodeAttribute/AttributeIconWrapper";
import PipeContentWrapper from '../Pipe/PipeContentWrapper'
import PipeWrapper from "../Pipe/PipeWrapper";
import { useState, useEffect } from "react";
import { useFindNodeById } from "../../hook/useFindNodeById";
// const PIPE_WIDTH_VERTICAL = 13;
// const PIPE_HEIGHT_VERTICAL = 5;
// const PIPE_WIDTH_HORIZONTAL = 5;
// const PIPE_HEIGHT_HORIZONTAL = 13;

const PIPE_WIDTH_VERTICAL = 20;
const PIPE_HEIGHT_VERTICAL = 7;
const PIPE_WIDTH_HORIZONTAL = 10;
const PIPE_HEIGHT_HORIZONTAL = 13;


const ReactChildrenWrapper = ({
    reactChildren,
    renderChildren,
    expandedAttributes,
    expandedprops,
    state, //refers to current node's parent state 
    level,
    parentId,
    handleUnmute,
    handleClickOnAttribute,
    attributeColors,
    updateNode,
    updateNodeV2,
    handlePropGoingInToChild,
    displayPropsData,
    renderDirection
}: ReactChildrenWrapperProps) => {


    const store = useStoreApi();
    const { setNodes, getNodes, indexMap } = store.getState();
    const [updatingPipeIds, setUpdatingPipeIds] = useState<UniqueId[]>([]);
    const {findNodeById} = useFindNodeById();
    
    
    return (
        <div className={ renderDirection == 'horizontal' ? 'flex nodeDirection flex-col' : 'flex nodeDirection '} data-id={parentId} datatype="Node">
            {reactChildren && reactChildren.map((child, index) => {

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
                        updateNode(child.id, child.id, { target: 'node', state: 'none' })
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



                const updatePipeState = (type:string) =>{
                    //get Node with child.id 
                    const nodes = getNodes();

                    //const reactChild: ReactChild[] = [nodes[0].data];
                    const reactChild: ReactChild[] = nodes.map(node => node.data);

                    let node = findNodeById(child.id, reactChild);

                    if(node){
                        if(type == 'mute'){
                            //get it's pipes 
                        //shallow copy the pipes 
                        const copiedPipes:Pipe[] = [...node?.pipes];

                        //iterate pipes and see if it exist in updatingPipeIds
                        copiedPipes.forEach((pipe)=>{
                            //if it does exist, change it's state in shallow copied pipes 
                            const targetPipe = updatingPipeIds.find((id)=> id == pipe.id);
                            if(targetPipe){
                                pipe.state = 'muted'
                            }
                        })
                        node.state = 'none';
                        //console.log("copiedPipes", copiedPipes);

                        //empty updatingPipeIds for future use, updatingPipeIds deletes any duplicate ids 
                        setUpdatingPipeIds([]);
                        }else if(type == 'unmute'){

                            const copiedPipes:Pipe[] = [...node?.pipes];

                            copiedPipes.forEach((pipe)=>{
                                //if it does exist, change it's state in shallow copied pipes 
                                //const targetPipe = updatingPipeIds.find((id)=> id == pipe.id);
                                if(pipe.state == 'muted'){
                                    pipe.state = 'none'
                                }
                            })

                        }
                        

                        //call setNodes to update the changes 
                        setNodes(nodes);
                    }else{
                        console.warn('node couldnt be found');
                    }

                }


                //filter muted 
                const mutedPipe = child.pipes.filter((pipe)=> pipe.state == 'muted');

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
                                {(state == 'select') && <input style={{ width: '18px', height: '18px' }} type="checkbox" />}
                                
                                <div className="flex">
                                    <div
                                        datatype='pipe'
                                        className='bg-white hover:bg-gray-300'
                                        style={{ width: '18px', height: '18px', position: 'relative', left: '-10px' }}>
                                        {child.numbersOfPropsGoingIn}
                                        
                                    </div>
                                    {child.state == 'selectingPipe' && 
                                        <span className='bg-white hover:bg-gray-200 ml-2 px-1 rounded '
                                            onClick={()=>updatePipeState('mute')}
                                        >Done</span>
                                    }
                                </div>

                                
                               

                                {child.pipes.map((pipe, i) => {

                                    return (
                                    <PipeWrapper
                                        key={i} 
                                        pipe={pipe}
                                        attributeColors={attributeColors}
                                        parentId={parentId}
                                        displayPropsData={displayPropsData}
                                        handlePropGoingInToChild={handlePropGoingInToChild}
                                        indexOfCurrentPipe={i}
                                        child={child}
                                        state={state}
                                        mutedAttributeCount={mutedAttributeCount}
                                        filteredMutingAttribute={filteredMutingAttribute}
                                        filteredUnMutedAttribute={filteredUnMutedAttribute}
                                        updateNode={updateNode}
                                        renderChildren={renderChildren}
                                        level={level}
                                        handleUnmute={handleUnmute}
                                        handleClickOnAttribute={handleClickOnAttribute}
                                        expandedAttributes={expandedAttributes}
                                        expandedprops={expandedprops}
                                        updateStatesInArray={updateStatesInArray}
                                        changeMutingToMuted={changeMutingToMuted}
                                        setUpdatingPipeIds={setUpdatingPipeIds}
                                        mutedPipeAmount={mutedPipe.length}
                                        updatePipeState={updatePipeState}
                                    />
                                    )
                                })}
                                {/* {mutedPipe && 
                                    <div>
                                        <div
                                            style={{
                                                height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                width: `${PIPE_WIDTH_HORIZONTAL}px`,
                                                position: 'relative',
                                                backgroundColor: 'white',
                                                
                                                boxShadow: '0 -5px 5px -5px #333',
                                            } as React.CSSProperties & { [key: string]: any }}
                                           
                                            className='pipeElement'

                                        >
                                        </div>
                                    </div>
                                } */}

                            </div>
                        </div>
                    </div>
                )

            })}
        </div>
    )
}

export default ReactChildrenWrapper;