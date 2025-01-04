


import React, { memo } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import type { NodeProps, ReactChild, Attribute, Pipe } from '../../types';

function darkenHexColor(hex: string, amount = 10) {
    // Ensure the hex value starts with '#'
    if (!hex || hex[0] !== '#') {
        throw new Error("Invalid hex color format");
    }

    // Parse the hex color into its RGB components
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    // Decrease each component by the specified amount, ensuring it doesn't go below 0
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);

    // Convert the RGB components back to hex and return the new color
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}


const ReactNode = ({
    isConnectable,
    data,

}: NodeProps) => {

    const { children, title, color, attributes } = data;

    


    const handlePropGoingInToChild = (pipe: Pipe) => {
        console.log("pipe clicked ", pipe)
    }

    // Recursive function to render children
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentColor: string): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        return (
            <div id='parents_InnerBoundary_Box' 
                style={{boxShadow: '3px 4px 15px inset', padding: '3px'}}
            >
                {children.map((child, index) => {

                    const darkerColor = darkenHexColor(parentColor, 20);
                    return (
                        <div
                            key={index}
                            style={{
                                marginLeft: '20px',

                                padding: '1px',
                                // backgroundColor: darkerColor,
                                // boxShadow: 'inset 0 0 5px',

                            }}
                        > {/* parent's inner boundary where return statement goes */}



                            <div id='pipe_sticky_wrapper' style={{ position: 'relative' }}>
                                <div
                                    id="child_Node"
                                    style={{
                                        backgroundColor: child.color,
                                        marginLeft: '20px',
                                        marginRight: '10px',
                                        marginBottom: '5px',
                                        marginTop: '5px',

                                        minWidth: '100px',
                                        minHeight: '70px',
                                        padding: '0px 5px',
                                    }}>  {/*child's outer boundary*/}


                                    {/** Child's boundary */}
                                    <div style={{ marginLeft: '20px', marginRight: '20px', boxShadow: 'inset 0 -5px 5px -5px #333, inset -5px 0 5px -5px #333, inset 5px 0 5px -5px #333' }}>
                                        <div style={{ height: '30px', fontSize: 'x-large', fontWeight: '900'}}>
                                            {child.title}
                                        </div>
                                    </div>
                                    <div style={{display: 'flex'}}> {/** displaying attributes */}
                                            {child.attributes && child.attributes.map((attr: Attribute) => (
                                                <div style={{border: '1px solid black'}}>
                                                    <div>{attr.nameOfAttribute}</div>
                                                    <div>{attr.totalNumberOfAttribute}</div>
                                                </div>
                                            ))}
                                    </div>



                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '0px',
                                            left: '0px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'visible',
                                            filter: 'drop-shadow(3px 4px 2.5px rgba(0, 0, 0, 0.8))',
                                        }}>

                                        <div style={{ width: '18px', height: '18px', backgroundColor: "white" }}> {/** rendering numbers of props going in to child*/}
                                            {child.numbersOfPropsGoingIn}
                                        </div>

                                        {child.pipes.map((pipe, i) => {
                                            //console.log("pipe", i , child.pipes.length, child.pipes);
                                            return (
                                                <div key={i}>
                                                    {i != child.pipes.length - 1 &&
                                                        <div style={{
                                                            height: '13px',
                                                            width: '5px',
                                                            backgroundColor: pipe.color,
                                                            // border: '1px solid black',
                                                            boxShadow: '0 -5px 5px -5px #333',
                                                        }}
                                                            onClick={(e)=>{handlePropGoingInToChild(pipe)}}
                                                        >
                                                        </div>
                                                    }
                                                    {/** when pipe's number are odd and bigger than 1, render -- vertical arrow of parent's color pipe  */}
                                                    {i == child.pipes.length - 1 && child.pipes.length > 1 && child.pipes.length % 2 == 0 &&
                                                        <div style={{
                                                            height: '5px',
                                                            width: '13px',
                                                            backgroundColor: pipe.color,
                                                            // border: '1px solid black',
                                                            boxShadow: '0 -5px 5px -5px #333',
                                                        }}
                                                            onClick={(e)=>{handlePropGoingInToChild(pipe)}}
                                                        >
                                                        </div>
                                                    }
                                                    {/** when pipe's number are even, render |_ corner type arrow of parent's color pipe  */}
                                                    {i == child.pipes.length - 1 && child.pipes.length % 2 != 0 &&
                                                        <div
                                                            style={{
                                                                position: 'relative',
                                                                width: '15px',
                                                                height: '15px',
                                                                backgroundColor: pipe.color,
                                                                clipPath: 'polygon(0 0, 0 100%, 100% 100%, 100% 60%, 40% 60%, 40% 0%)',
                                                                border: '1px solid black',

                                                            }}>
                                                        </div>
                                                    }
                                                </div>
                                            )

                                        })}
                                    </div>
                                    {renderChildren(child.children, level + 1, child.color)}
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
            <div style={{display: 'flex'}}>
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
