
import React, { memo, useEffect, useState } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import { useStoreApi } from '../../hook/useStore';
import useUpdateNodeInternals from '../../hook/useUpdateNodeInternals';

import type { NodeProps, ReactChild, Attribute, Pipe, AttributeContent, ReactInBuiltAttributeContent, Node, NodeDimensionChange, UniqueId, updateOption, UpdateOptionV2, MuteOption } from '../../types';
import AttributeIconWrapper from '../NodeAttribute/AttributeIconWrapper';
import { AttributeIcon, AttributeIconProps } from '../NodeAttribute/AttributeIcon';
import './ReactNodeStyle.css';

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

    const handleUnmute = (id: string) => {

        const nodes: Node[] = getNodes();

        //get the id of node 
        const path = indexMap![id].split('-').map(Number);

        //update mute flag then setNode to update the display 
        let format = {
            children: [nodes[0].data],
        }

        const updatedRoot = { ...format };
        let currentNode = updatedRoot;

        for (let i = 0; i < path.length; i++) {
            const currentIndex = path[i];

            if (i === path.length - 1) {
                currentNode.children[currentIndex].muteAll = false;
            }

            currentNode = currentNode.children[currentIndex];
        }

        nodes[0].data = updatedRoot.children[0];
        let newNode: Node[] = nodes.map(node => ({ ...node }));
        newNode[0].data = updatedRoot.children[0];

        setNodes(newNode);

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
                else if(updateOption.target == 'node'){

                    if(updateOption.state == 'none' && updateOption.detailOptions?.muteOptions.unmutingData.unMutedAttributes){
                        currentNode.children[currentIndex].state = updateOption.state;
                        currentNode.children[currentIndex].attributes = [...updateOption.detailOptions?.muteOptions.unmutingData.unMutedAttributes, ...updateOption.detailOptions?.muteOptions.unmutingData.updatedMutedAttributes]
                    }else{
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
                if (updateOption.muteOptions) {
                    const targetAttribute: Attribute = currentNode.children[currentIndex].attributes.find((attrb: Attribute) => attrb.id === id);
                    targetAttribute.mute = updateOption.muteOptions;
                }
                else if(updateOption.target == 'node'){
                  
                    currentNode.children[currentIndex].state = updateOption.state;
                    // switch (updateOption.state) {
                    //     case 'none':
                    //         currentNode.children[currentIndex].state = 'none'
                    //         break;
                    
                    //     default:
                    //         break;
                    // }

                }
            }
            currentNode = currentNode.children[currentIndex];
        }

        nodes[0].data = updatedRoot.children[0];
        let newNode: Node[] = nodes.map(node => ({ ...node }));
        newNode[0].data = updatedRoot.children[0];

        setNodes(newNode);

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
        setExpandedAttributes((prev) => {
            // If already expanded, remove it from the array
            if (prev.includes(id)) {
                const filtered =  prev.filter((name) => name !== id);
                return filtered;
            }
            // Otherwise, add it to the array
            return [...prev, id];
        });
    };

    // Recursive function to render children
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentColor: string, state: string): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        const addPaddingBottom = children[children.length - 1].type && children[children.length - 1].type == 'ghost';

        return (
            <div className='returnScope'
                style={{
                    // boxShadow: 'rgba(0,0,0,0.7) 5px 5px 30px inset', 
                    boxShadow: 'inset 0px 48px 66px 0px rgba(72, 72, 72, 0.59)',
                    paddingTop: '10px',
                    overflow: 'hidden',
                    paddingBottom: addPaddingBottom ? '10px' : '',
                    //if any of this children's children has node type of ghost, then give padding bottom: 10px 
                }}
                datatype='Node'
            >
                {/** muting return scope */}
                {state == 'select' && <input style={{ width: '18px', height: '18px' }} type="checkbox" />}

                {children.map((child, index) => {

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
                    const changeMutingToMuted = () =>{

                        //1. add mutingAttribute into mutedAttribute 
                        const temp: Attribute[]
                            = filteredMutingAttribute.map(attribute => ({
                                ...attribute,
                                mute: 'muted', // Update the `muting` state to 'muted'
                        }));

                        filteredMutedAttribute = [...temp, ...filteredMutedAttribute];
                        //2. have unmutedAttribute
                        // give these two arrayList into updateNode
                        // updateNode will set it's state to be 'none' and set .attribute = [...1, ...2]
                        updateNodeV2(child.color, '-', 
                        { target: 'node', state: 'none',  //changing node's state to 'none'
                        detailOptions: 
                            {muteOptions: 
                                {unmutingData: 
                                    {updatedMutedAttributes: filteredMutedAttribute,  //1
                                    unMutedAttributes: filteredUnMutedAttribute  //2
                                }
                            }} 
                        })
                        

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
                        filteredMutedAttribute = child.attributes.filter(attibute => attibute.mute === 'muted');
                        filteredMutingAttribute = child.attributes.filter(attibute => attibute.mute === 'muting');
                        mutedAttributeCount = filteredMutedAttribute.length;
                        console.log("mutedAttributeCount", mutedAttributeCount);
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
                                    data-id={parentColor}  //HERE id of Node(parent)
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
                                                        data-id={parentColor}
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
                                                        {/** muting current Node  */}
                                                        {child.state == 'select' && 
                                                        <div>
                                                            {/* <input style={{ width: '18px', height: '18px' }} type="checkbox" />  */}
                                                            <div className='selectingHeader '>
                                                                <span>Selecting...</span>
                                                                {/* we need to emptyFilteredMutingAttribute then call updateNode to change the current Node's state to 'none' */}
                                                                {/* <span onClick={() => updateNode(child.color, '-', { target: 'node', state: 'none'})} >Done</span> */}
                                                                <span onClick={() => changeMutingToMuted()} >Done</span>
                                                                
                                                            </div> 
                                                        </div>}
                                                        {/** muting current Node's children Nodes */}
                                                        {state == 'select' && <input style={{ width: '18px', height: '18px' }} type="checkbox" />}
                                                        {child.type != 'ghost' && <div className='NodePositionWrapper'
                                                            datatype='Node'
                                                            data-id={`${pipe.color}`}
                                                        >
                                                            <div
                                                                className="childNode"
                                                                datatype='Node'
                                                                data-id={child.color}
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
                                                                        data-id={child.color}
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
                                                                                                    onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'muted' })}
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
                                                                                            <AttributeIconWrapper attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
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
                                                                                            onClick={() => updateNode(child.color, attr.id, { target: 'attribute', state: 'mute', muteOptions: 'muted' })}
                                                                                            title="mute"
                                                                                        >-</button>}
                                                                                    <AttributeIconWrapper attribute={attr} isExpanded={isExpanded} handleClickOnAttribute={handleClickOnAttribute} attributeColors={attributeColors} />
                                                                                </div>
                                                                            )

                                                                        })}
                                                                    </div>}
                                                                {child.muteAll == true && <button onClick={() => handleUnmute(child.color)}>...</button>}
                                                                {!child.muteAll && renderChildren(child.children, level + 1, child.color, child.state as string)}
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
