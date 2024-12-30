
import React, { memo } from 'react';

import Handle from '../../component/Handle';
import { Position } from '../../types';
import type { NodeProps, ReactChild } from '../../types';

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

    const { children, title, color } = data;
    // Recursive function to render children
    const renderChildren = (children: ReactChild[] | undefined, level: number, parentColor: string): JSX.Element | null => {
        if (!children || children.length === 0) {
            return null;
        }

        return (
            <div id='parents_InnerBoundary_Box' >
                {children.map((child, index) => {

                    const darkerColor = darkenHexColor(parentColor, 20);
                    return (
                        <div
                            key={index}
                            style={{
                                marginLeft: '20px',
                                border: '1px black solid',
                                backgroundColor: darkerColor,

                            }}
                        > {/* parent's inner boundary where return statement goes */}

                            <div id='pipe_sticky_wrapper' style={{ position: 'relative' }}>
                                <div
                                    style={{
                                        backgroundColor: child.color,
                                        marginLeft: '20px',
                                        marginRight: '10px',
                                        marginBottom: '5px',
                                        marginTop: '5px',
                                        border: 'dashed 2px green',
                                    }}>  {/*child's outer boundary*/}
                                    <h4>{child.title}</h4>
                                    <p>Props Going In: {child.numbersOfPropsGoingIn}</p>

                                    <div style={{ position: 'absolute', top: '0px', left: '0px', display: 'flex', flexDirection: 'column', }}>
                                        {child.pipes.map((pipe, i) => {
                                            //console.log("pipe", i , child.pipes.length, child.pipes);
                                            return (
                                                <div >

                                                    {i != child.pipes.length - 1 &&
                                                        <div style={{ height: '15px', width: '5px', backgroundColor: pipe.color, border: '1px solid black' }}>
                                                        </div>
                                                    }
                                                    {i == child.pipes.length - 1 &&
                                                        <div
                                                            style={{
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

    console.log("children", children.color, "title", title);

    return (
        <div style={{ backgroundColor: color }}>
            <h3>{title}</h3>
            {renderChildren(children, 1, color)}
        </div>
    );
};

ReactNode.displayName = 'ReactNode';

export default memo(ReactNode);