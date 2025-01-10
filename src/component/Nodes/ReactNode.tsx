
import React, { memo, useState } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import type { NodeProps, ReactChild, Attribute, Pipe, AttributeContent, ReactInBuiltAttributeContent } from '../../types';

import { AttributeIcon, AttributeIconProps } from '../NodeAttribute/AttributeIcon';

const PIPE_WIDTH_VERTICAL = 13;
const PIPE_HEIGHT_VERTICAL = 5;
const PIPE_WIDTH_HORIZONTAL = 5;
const PIPE_HEIGHT_HORIZONTAL = 13;

// setting attribute colors for different icons
const attributeColors: Record<string, string> = {
    import: "#00bfff",
    reactInBuilt: "#ffcc00",
    vars: "#ff5733",
    functions: "#8e44ad",
    hooks: "#ffb0fe",
};


const ReactNode = ({
    isConnectable,
    data,
}: NodeProps) => {

    const { children, title, color, attributes } = data;
    const [expandedAttributes, setExpandedAttributes] = useState<string[]>([]);


    const handlePropGoingInToChild = (pipe: Pipe) => {
        console.log("pipe clicked ", pipe)
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
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentColor: string): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        return (
            <div className='returnScope'
                style={{
                    // boxShadow: 'rgba(0,0,0,0.7) 5px 5px 30px inset', 
                    boxShadow: 'inset 0px 48px 66px 0px rgba(72, 72, 72, 0.59)',
                    paddingTop: '10px',
                    overflow: 'hidden',
                }}
            >
                {children.map((child, index) => {

                    return (
                        <div
                            key={index}
                            style={{
                                marginLeft: '10px',
                                padding: '1px',
                            }}
                        > {/* parent's inner boundary where return statement goes */}

                            <div className='pipeStickyWrapper' style={{ position: 'relative' }}>

                                <div className='NodePositionWrapper' style={{ paddingTop: `${(PIPE_HEIGHT_HORIZONTAL * child.pipes.length) - 10}px` }}>
                                    <div
                                        className="childNode"
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
                                            >
                                                {child.title}
                                            </div>
                                        </div>
                                        <div className='AttributeContainer' style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'flex-start', padding: '4px 2px' }}> {/** displaying attributes */}
                                            {child.attributes && child.attributes.map((attr: Attribute) => {
                                                //console.log("attributeColors", attr.nameOfAttribute, attributeColors[attr.nameOfAttribute])

                                                const isExpanded = expandedAttributes.includes(attr.nameOfAttribute);
                                                //console.log("isExpanded", isExpanded)
                                                return (


                                                    <div
                                                        className='attributeIconWrapper  bg-gray-100 hover:bg-gray-200'
                                                        style={{
                                                            // display: 'flex',
                                                            alignItems: 'baseline',     
                                                            backgroundColor: 'white',
                                                            borderRadius: '5px',
                                                            flexDirection: 'column',
                                                            gap: '2px',
                                                            padding: isExpanded ? '1px 6px' : '0px 2px',
                                                           
                                                        }}
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

                                                )


                                            })}
                                        </div>
                                        {renderChildren(child.children, level + 1, child.color)}
                                    </div>
                                </div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '0px',
                                        left: '0px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        overflow: 'visible',
                                        filter: 'drop-shadow(rgba(0, 0, 0, 0.9) 6px 4px 2.5px)',
                                    }}>

                                    <div style={{ width: '18px', height: '18px', backgroundColor: "white", position: 'relative', left: '-5px' }}> {/** rendering numbers of props going in to child*/}
                                        {child.numbersOfPropsGoingIn}
                                    </div>

                                    {child.pipes.map((pipe, i) => {
                                        //console.log("pipe", i , child.pipes.length, child.pipes);
                                        return (
                                            <div key={i}>
                                                {/** rendering each pipes except the tail */}
                                                {i != child.pipes.length - 1 &&
                                                    <div style={{
                                                        height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                        width: `${PIPE_WIDTH_HORIZONTAL}px`,
                                                        position: 'relative',
                                                        backgroundColor: pipe.color,
                                                        boxShadow: '0 -5px 5px -5px #333',
                                                    }}
                                                        onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                    >
                                                    </div>
                                                }
                                                {/** redering tail 
                                                     * when pipe's number are odd and bigger than 1, render -- vertical arrow of parent's color pipe  */}
                                                {i == child.pipes.length - 1 && child.pipes.length > 1 && child.pipes.length % 2 == 0 &&
                                                    <div style={{
                                                        height: `${PIPE_HEIGHT_VERTICAL}px`,
                                                        width: `${PIPE_WIDTH_VERTICAL}px`,
                                                        backgroundColor: pipe.color,
                                                        boxShadow: '0 -5px 5px -5px #333',
                                                    }}
                                                        onClick={(e) => { handlePropGoingInToChild(pipe) }}
                                                    >
                                                    </div>
                                                }
                                                {/** when pipe's number are even, render |_ corner type arrow of parent's color pipe  */}
                                                {i == child.pipes.length - 1 && child.pipes.length % 2 != 0 &&
                                                    <div
                                                        style={{
                                                            position: 'relative',
                                                            height: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                            width: `${PIPE_HEIGHT_HORIZONTAL}px`,
                                                            backgroundColor: pipe.color,
                                                            clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 60%, 40% 60%, 40% 0%)',

                                                        }}>
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

    console.log("children", children, "attribute", attributes);


    return (
        <div style={{ backgroundColor: color }}>
            <h3>{title}</h3>
            <div style={{ display: 'flex' }}>
                {attributes.map((attr: Attribute) => (
                    <div>
                        <div>{attr.nameOfAttribute}</div>
                        <div>{attr.totalNumberOfAttribute}</div>
                    </div>
                ))}
            </div>
            {renderChildren(children, 1, color)}
        </div>
    );
};

ReactNode.displayName = 'ReactNode';

export default memo(ReactNode);
