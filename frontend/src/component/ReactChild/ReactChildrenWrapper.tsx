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
        <div className={ renderDirection == 'horizontal' ? 'flex nodeDirection flex-col' : 'flex nodeDirection '}>
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

                    const reactChild: ReactChild[] = [nodes[0].data];

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

                                
                                {false && child.pipes.map((pipe, i) => {
                                    const isExpanded: boolean = expandedAttributes.includes(pipe.id);
                                    const showProps: boolean = expandedprops.includes(pipe.id);

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
                                                <div className='flex'
                                                    datatype='pipe'
                                                    data-id={`${child.id}+${pipe.id}`}
                                                >
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

                                                    >
                                                    </div>
                                                    {(state == 'select' || child.state == 'selectingPipe')&& 
                                                        <input style={{ width: '13px', height: '13px' }} type="checkbox" 
                                                    />}
                                                </div>
                                            }
                                            {  // circle data when pipe is clicked , showing input when in 'editing' state 
                                                (showProps || pipe.state == 'editing') &&
                                                    <PipeContentWrapper pipe={pipe} showProps={showProps} nodeId={child.id} displayPropsData={displayPropsData}/>
                                            }
                                            
                                            {false && pipe.state == 'editing' && 
                                            <div>
                                                {/**change current pipe'state to be 'none' */}
                                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-md"

                                                >C</button>
                                                {/**set  showProps to be false */}
                                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-md" title="Minimize">M</button>
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

                                                    {child.type != 'ghost' && <div className='NodePositionWrapper relative'
                                                        datatype='Node'
                                                        data-id={`${pipe.color}`}
                                                    >
                                                        {state == 'select' && child.type != 'ghost' &&
                                                            <button className='absolute top-[0px] right-[0px] bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded'
                                                                onClick={() => updateNode(child.id, child.id, { target: 'node', state: 'mute', muteOptions: 'mute' })}
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
                                                                <div className='Title'
                                                                    style={{
                                                                        height: '30px',
                                                                        fontSize: 'x-large',
                                                                        fontWeight: '900',
                                                                        padding: '0px 5px',
                                                                        maxWidth: '200px'
                                                                    }}
                                                                    contentEditable='true'
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
                                                                                                onClick={() => updateNode(child.id, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                                title='mute back'
                                                                                            >
                                                                                                {"<"}
                                                                                            </div>
                                                                                            <div className='bg-white hover:bg-gray-300 px-0.5'
                                                                                                onClick={() => updateNode(child.id, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'notMuted' })}
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
                                                                                        onClick={() => updateNode(child.id, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'mute' })}
                                                                                        //onClick={() => findElementWithTypes(child.id, attr.id, 'attribute')}
                                                                                        title="mute"
                                                                                    >-</button>}
                                                                                <AttributeIconWrapper nodeId={child.id} attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                            </div>
                                                                        )

                                                                    })}
                                                                </div>}
                                                            {child.muteAll == true && <button onClick={() => handleUnmute(child.id)}>...</button>}
                                                            {!child.muteAll && renderChildren(child.children, level + 1, child.id, child.state as NodeState, child.renderChildrenDirection)}
                                                        </div>
                                                    </div>}
                                                </div>
                                            }
                                        </div>
                                    )

                                })}

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