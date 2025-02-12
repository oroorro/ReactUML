
import type { PipeWrapperProps, NodeState, Attribute, UniqueId } from "../../types"
import PipeContentWrapper from "./PipeContentWrapper";
import AttributeIconWrapper from "../NodeAttribute/AttributeIconWrapper";
import { memo, useEffect, useState } from "react";

const PIPE_WIDTH_VERTICAL = 20;
const PIPE_HEIGHT_VERTICAL = 7;
const PIPE_WIDTH_HORIZONTAL = 10;
const PIPE_HEIGHT_HORIZONTAL = 13;

const PipeWrapper = ({
    pipe,
    parentId,
    displayPropsData,
    handlePropGoingInToChild,
    indexOfCurrentPipe,
    child,
    state,
    mutedAttributeCount,
    filteredMutingAttribute,
    filteredUnMutedAttribute,
    updateNode,
    renderChildren,
    level,
    attributeColors,
    handleUnmute,
    handleClickOnAttribute,
    expandedAttributes,
    expandedprops,
    updateStatesInArray,
    changeMutingToMuted,
    setUpdatingPipeIds,
    mutedPipeAmount,
    updatePipeState
}:PipeWrapperProps) => {

    // const [updatingPipeIds, setUpdatingPipeIds] = useState<UniqueId[]>([]);
    const isExpanded: boolean = expandedAttributes.includes(pipe.id);
    const showProps: boolean = expandedprops.includes(pipe.id);


    //add selected pipe's id when Node's state change into 'selectingPipe' 
    const handleCheckboxChange = (id: UniqueId) => {

        setUpdatingPipeIds((prevIds) =>
            {
            if (prevIds.includes(id)) {
                const updated = prevIds.filter((prevId) => prevId !== id);
                return updated;
            }
            return [...prevIds, id];
            });
      };


    return (
        <div id="pipes" className={ indexOfCurrentPipe == child.pipes.length - 1 ? "flex-col flex -left-2 relative": "flex -left-2 relative gap-0.5"} key={indexOfCurrentPipe}
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
            {indexOfCurrentPipe != child.pipes.length  && pipe.state != 'muted' && 
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
                        <input style={{ width: '13px', height: '13px' }} 
                        onChange={() => handleCheckboxChange(pipe.id)}
                        type="checkbox" 
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
            {indexOfCurrentPipe == child.pipes.length - 1 &&
                <div
                    datatype='Node'
                    data-id={parentId}
                >
                    {/** render muted pipes, just need to display ... and when this is clicked, it shows muted ones and have options to go back or not, just like Attribute  */}
                    {mutedPipeAmount != 0 && 
                    
                    <div
                    style={{
                        
                        position: 'relative',
                        // backgroundColor: pipe.color,
                        height: `${20}px`,
                        width: `${PIPE_HEIGHT_HORIZONTAL}px`,
                        "--bg-color": 'gray',
                        boxShadow: '0 -5px 5px -5px #333',
                    } as React.CSSProperties & { [key: string]: any }}
                    className='pipeElement '
                    >
                        <button className="flex flex-col bg-white border-x  border-black  border-solid rounded-xl"
                            style={{ 
                                writingMode: "vertical-rl", 
                                textOrientation: "mixed", 
                                letterSpacing: "1px", 
                                lineHeight: "9px",
                                textIndent: "2px"
                            }}
                            onClick={()=>updatePipeState('unmute')}
                        >
                            ...
                        </button>
                    </div>
                
                }
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
                            className="childNode" datatype='Node'
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
                                boxShadow: '5px 5px 10px'}}>  {/*child's outer boundary*/}


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
                            {!child.muteAll && renderChildren(child.children, level + 1, child.id, child.state as NodeState)}
                        </div>
                    </div>}
                </div>
            }
        </div>
    )
}

export default memo(PipeWrapper)