
import React, { memo, useState } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import { useStoreApi } from '../../hook/useStore';
import useUpdateNodeInternals from '../../hook/useUpdateNodeInternals';

import type { NodeProps, ReactChild, Attribute, Pipe, AttributeContent, ReactInBuiltAttributeContent, Node, NodeDimensionChange } from '../../types';

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
        //let newNode:Node[] = [...nodes];
        let newNode: Node[] = nodes.map(node => ({ ...node }));
        //console.log("Are nodes and newNode the same reference?", nodes === newNode);
        newNode[0].data = updatedRoot.children[0];

        setNodes(newNode);
        //onNodesChange!(changes);
    }

    const updateNode = (type: string, id: string, index: number) => {

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
                currentNode.children[currentIndex].attributes[index].mute = true;
            }

            currentNode = currentNode.children[currentIndex];
        }

        nodes[0].data = updatedRoot.children[0];
        //let newNode:Node[] = [...nodes];
        let newNode: Node[] = nodes.map(node => ({ ...node }));
        //console.log("Are nodes and newNode the same reference?", nodes === newNode);
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

    const handleClickOnAttribute = (attributeName: string) => {
        setExpandedAttributes((prev) => {
            // If already expanded, remove it from the array
            if (prev.includes(attributeName)) {
                return prev.filter((name) => name !== attributeName);
            }
            // Otherwise, add it to the array
            return [...prev, attributeName];
        });
    };

    // Recursive function to render children
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentColor: string, state: string): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        const addPaddingBottom = children[children.length - 1].type && children[children.length - 1].type == 'ghost';
        const [showMuteAttribute, setShowMuteAttribute] = useState<boolean>(false);

        console.log("children", children)

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
                    let filteredUnMutedAttribute: Attribute[];
                    let muteAttributeCount: number; 
                    let filteredMutedAttribute: Attribute[];

                    

                    if(child.attributes){
                        filteredUnMutedAttribute =  child.attributes.filter(attibute => attibute.mute !== true);
                        filteredMutedAttribute = child.attributes.filter(attibute => attibute.mute === true);
                        muteAttributeCount = child.attributes.filter(attibute => attibute.mute == true).length;
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
                                        //console.log("pipe", i , child.pipes.length, child.pipes);
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
                                                        {child.state == 'select' && <div><input style={{ width: '18px', height: '18px' }} type="checkbox" /> <div>selecting</div> </div>}
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
                                                                        
                                                                        {muteAttributeCount !== 0 && 
                                                                        <div style={{fontSize: '18px', fontWeight: '500'}} className='bg-white hover:bg-gray-300 flex px-0.5 rounded'>
                                                                            <div onClick={()=>setShowMuteAttribute(prev=>!prev)}>{muteAttributeCount} ...</div>
                                                                        </div>
                                                                        }
                                                                        {showMuteAttribute && filteredMutedAttribute &&
                                                                            filteredMutedAttribute.map((attr: Attribute, index: number)=>{
                                                                                return(
                                                                                    <div>{attr.nameOfAttribute}</div>
                                                                                )
                                                                            })
                                                                        }
                                                                        {child.attributes && filteredUnMutedAttribute.map((attr: Attribute, index: number) => {
                                                                            //console.log("attributeColors", attr.nameOfAttribute, attributeColors[attr.nameOfAttribute])

                                                                            console.log("child attribute", attributes, child.attributes);
                                                                            const isExpanded = expandedAttributes.includes(attr.nameOfAttribute);

                                                                            //id of attribute 
                                                                            //console.log("isExpanded", isExpanded)
                                                                            return (

                                                                                <div className='flex'>
                                                                                   
                                                                                    <div
                                                                                        className={isExpanded ? 'attributeIconWrapper bg-white' : 'attributeIconWrapper bg-white hover:bg-gray-300'}
                                                                                        style={{
                                                                                            // display: 'flex',
                                                                                            alignItems: 'baseline',

                                                                                            borderRadius: '5px',
                                                                                            flexDirection: 'column',
                                                                                            gap: '2px',
                                                                                            padding: isExpanded ? '1px 6px' : '0px 2px',

                                                                                        }}
                                                                                        datatype='AttributeContainer'
                                                                                        onClick={!isExpanded ? () => handleClickOnAttribute(attr.nameOfAttribute) : undefined} // Disable onClick if isExpanded
                                                                                    >
                                                                                        
                                                                                        <div className={isExpanded ? 'attributeIconWrapperTitle flex justify-center p-1 border-b border-black' : 'attributeIconWrapperTitle flex justify-center'} >
                                                                                            <div className={isExpanded ? 'flex justify-center ml-auto px-3 gap-3' : 'flex items-center'}>
                                                                                                {/** Logo of the Icon */}
                                                                                                <AttributeIcon
                                                                                                    color={attributeColors[attr.nameOfAttribute]}
                                                                                                    nameOfIcon={attr.nameOfAttribute}
                                                                                                    isExpanded={isExpanded}
                                                                                                />
                                                                                                
                                                                                               

                                                                                                {/** numbers of attribute for this  Icon */}
                                                                                                {isExpanded &&
                                                                                                    <div>
                                                                                                        <span
                                                                                                            className='align-middle relative text-base whitespace-nowrap top-0.5'
                                                                                                        >
                                                                                                            {'in total '}
                                                                                                        </span>
                                                                                                    </div>}

                                                                                                <div>
                                                                                                    <span style={{ marginLeft: '3px', fontSize: '18px', fontWeight: '500' }}>{attr.totalNumberOfAttribute}</span>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/** showing button to minimize AttributeWrapper */}
                                                                                            {isExpanded &&
                                                                                                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-4 rounded-xl ml-auto"
                                                                                                    onClick={isExpanded ? () => handleClickOnAttribute(attr.nameOfAttribute) : undefined} // Disable onClick if isExpanded
                                                                                                >
                                                                                                    <span className='text-2xl'> - </span>
                                                                                                </button>}

                                                                                        </div>

                                                                                        <div
                                                                                            style={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'baseline',
                                                                                                minWidth: isExpanded ? '200px' : '0px',
                                                                                                height: isExpanded ? '100px' : '0px',
                                                                                                backgroundColor: 'white',
                                                                                                borderRadius: '5px',
                                                                                                padding: isExpanded ? '2px 16px 2px 2px' : '0px',
                                                                                                transition: 'all 0.3s ease',
                                                                                                flexDirection: 'column',
                                                                                                gap: '2px',
                                                                                                overflow: isExpanded ? 'scroll' : '',
                                                                                                marginTop: isExpanded ? '3px' : '',
                                                                                            }}

                                                                                        >
                                                                                            {isExpanded && attr.AttributeContents && attr.AttributeContents.map((content: AttributeContent | ReactInBuiltAttributeContent) => (
                                                                                                <div>
                                                                                                    {"name" in content &&
                                                                                                        <div className='attributeContentWrapper relative inline-block p-2 border-2 border-transparent hover:border-blue-500 transition duration-300' style={{ border: '1px solid black', padding: '0px 3px', borderRadius: '5px' }}>
                                                                                                            <span className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.name}</span>
                                                                                                            <span>: </span>
                                                                                                            <span className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.type ?? "N/A"}</span>
                                                                                                        </div>
                                                                                                    }
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                    {child.state == 'select' && <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded' onClick={() => updateNode('attribute', child.color, index)}>-</button>}
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

    //console.log("children", children, "attribute", attributes);


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
