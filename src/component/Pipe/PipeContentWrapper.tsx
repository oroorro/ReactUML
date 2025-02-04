
import { PipeContentWrapperProps } from "../../types"
import { useEffect, useRef, useState } from "react"
import PipeContentPropWrapper from "./PipeContentPropWrapper"
import AttributeContentWrapper from "../NodeAttribute/AttributeContentWrapper"
import type { UniqueId, AttributeData, ReactChild, AttributeContent } from "../../types"
import { useStoreApi } from "../../hook/useStore"
import { useFindNodeById } from "../../hook/useFindNodeById"
import { generateUniqueId } from "../../utils/generateId"
import { isAttributeContent } from "../../utils/helper"

const PipeContentWrapper = ({
    pipe,
    showProps,
    nodeId
}:PipeContentWrapperProps) => {

    const store = useStoreApi();
    const { setNodes, getNodes } = store.getState();
    const { findNodeById } = useFindNodeById();

    const contentNameRef = useRef<HTMLInputElement>(null);
    const contentTypeRef = useRef<HTMLInputElement>(null);

    const handleUpdateAttributeContent = (option: string, contentId: UniqueId = '-', data?: AttributeData) => {

        const nodes = getNodes();

        const reactChild: ReactChild[] = [nodes[0].data];

        let node = findNodeById(nodeId, reactChild);

        const targetPipe = node?.pipes.find((attri) => attri.id == pipe.id);

        if (targetPipe) {
            //add 
            if (option == 'add') {
                if (contentNameRef.current && contentNameRef.current.value != '') {
                    //create new AttributeContent 
                    const newAttributeContet: AttributeContent = { //AttributeContent used as Pipe's content since they have same property 
                        id: generateUniqueId(),
                        name: contentNameRef.current?.value as string,
                        type: contentTypeRef.current?.value as string,
                        belongsTo: pipe.id
                    }
                    //adding newly created AttributeContent with previously existing AttributeContents in target Attribute 
                    targetPipe.props = [...targetPipe.props as AttributeContent[], newAttributeContet];

                    //clean <input/> if there was any input given 
                    if (contentNameRef.current && contentTypeRef.current) {
                        contentNameRef.current.value = "";
                        contentTypeRef.current.value = "";
                    }
                }
            } else if (option == 'cancelAdd' || option == 'none') {
                //change state to none 
                targetPipe.state = 'none';
            }
            //show options
            else if (option == 'showOptions') {
                targetPipe.state = 'showOptions';
            }
            else if (option == 'editing') { //showing two input HTML elements with two buttons for creating '+' and cancelling 'x'
                targetPipe.state = 'editing';
            }
            //changing value 
            else if(option == 'changeValue'){

                //find AttributeContent by given contentId
                const targetContent: AttributeContent = targetPipe.props.find((content)=> content.id == contentId) as AttributeContent;

                //change value using AttributeData
                if(isAttributeContent(targetContent)){
                    targetContent.name = data?.changingContent.name as string;
                    targetContent.type = data?.changingContent.type as string;
                }

            }
            //for given AttributeContent, change it's name and type into given value 
            else if (option == 'delete') {
                const contents: AttributeContent[] = targetPipe.props as AttributeContent[];
                const filteredContents = contents.filter((attrib) => attrib.id != contentId)
                console.log("filteredContents", filteredContents)
                targetPipe.props = [...filteredContents];
            }

        } else {
            console.warn("targetAttribute couldn't be found");
        }

        //console.log("targetAttribute", targetAttribute,);
        setNodes(nodes);
    }

    return(
    <div
        id="propContent"
        className={(showProps || pipe.state == 'editing') ? 'pipeElementExpanded py-1' : 'pipeElement'}
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
        {pipe.props && pipe.props.map(propContent => {
            return (
                // <AttributeContentWrapper content={propContent} />
                <PipeContentPropWrapper 
                    propContent={propContent} 
                    handleUpdateAttributeContent={handleUpdateAttributeContent}
                />
            )
        }
        )}

        {pipe.state == 'editing' &&
            <div className="relative">
                <input ref={contentNameRef} style={{ width: '120px' }} />
                <span>: </span>
                <input ref={contentTypeRef} style={{ width: '120px' }} />
                <div className="absolute bg-white right-[-15px] top-[0px]">
                    <button >+</button>
                    {/**change current pipe'state to be 'none' */}
                    <button>x</button>
                </div>
            </div>
        }

    </div>
    )
}

export default PipeContentWrapper;