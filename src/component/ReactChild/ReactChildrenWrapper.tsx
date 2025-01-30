import type { ReactChildrenWrapperProps, Attribute, Node, NodeState } from "../../types";
import { useStoreApi } from "../../hook/useStore";
import AttributeIconWrapper from "../NodeAttribute/AttributeIconWrapper";

const PIPE_WIDTH_VERTICAL = 13;
const PIPE_HEIGHT_VERTICAL = 5;
const PIPE_WIDTH_HORIZONTAL = 5;
const PIPE_HEIGHT_HORIZONTAL = 13;


const ReactChildrenWrapper = ({
    reactChildren,
    renderChildren,
    expandedAttributes,
    expandedprops,
    state,
    level,
    parentId,
    handleUnmute,
    findElementWithTypes,
    handleClickOnAttribute,
    attributeColors,
    updateNode,
    updateNodeV2, 
    handlePropGoingInToChild,
    displayPropsData

}:ReactChildrenWrapperProps) => {

    const store = useStoreApi();
    const { setNodes, getNodes, indexMap, onNodesChange } = store.getState();

    return(
        <div>
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
        </div>
    )
}

export default ReactChildrenWrapper;