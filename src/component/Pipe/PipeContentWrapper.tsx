
import { PipeContentWrapperProps } from "../../types"
import { useEffect, useRef, useState } from "react"
import PipeContentPropWrapper from "./PipeContentPropWrapper"
import AttributeContentWrapper from "../NodeAttribute/AttributeContentWrapper"
import type { UniqueId, AttributeData, ReactChild, AttributeContent, Attribute, Pipe } from "../../types"
import { useStoreApi } from "../../hook/useStore"
import { useFindNodeById } from "../../hook/useFindNodeById"
import { generateUniqueId } from "../../utils/generateId"
import { isAttributeContent } from "../../utils/helper"

const PipeContentWrapper = ({
    pipe,
    showProps,
    nodeId,
    handlePropGoingInToChild
}: PipeContentWrapperProps) => {

    console.log("showProps", showProps, pipe);
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
                        // belongsTo: pipe.id , we need Node's id that is trying to pass down this prop
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
            else if (option == 'changeValue') {

                //find AttributeContent by given contentId
                const targetContent: AttributeContent = targetPipe.props.find((content) => content.id == contentId) as AttributeContent;

                //change value using AttributeData
                if (isAttributeContent(targetContent)) {
                    targetContent.name = data?.changingContent.name as string;
                    targetContent.type = data?.changingContent.type as string;
                }

            }
            //for given AttributeContent, change it's name and type into given value 
            else if (option == 'delete') {
                if(contentId == '-') console.warn("id to delete was not given")
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

    const getCurrentAttribute = (): Pipe | undefined => {
        const nodes = getNodes();

        const reactChild: ReactChild[] = [nodes[0].data];

        let node = findNodeById(nodeId, reactChild);

        const targetAttribute = node?.pipes.find((nodesPipe) => nodesPipe.id == pipe.id);

        return targetAttribute
    }

    //1. check current state
    //2. if current state was 'editing' then change the state to ''
    //3. if current state was 'showOptions' then change the state to ''
    const handleOptionsButton = () => {

        //getting currentAttribute 
        const currentPipe = getCurrentAttribute()

        if (!currentPipe) console.warn("Pipe is undefined");

        //change to 'none' when state does not exist in currentAttribute or currentAttribute's state is either 'editing' triggered by contextMeun's add button on Attributeor 'showOptions' triggered by clicking options
        if (currentPipe?.state == 'showOptions' || currentPipe?.state == 'editing' ) {
            handleUpdateAttributeContent('none')
        } else if (currentPipe?.state == 'none' || !currentPipe?.state ) {
            handleUpdateAttributeContent('showOptions')
        }
    }

    const handleMinimizeButton = () => {
        //1.
        handleUpdateAttributeContent('none');
        //2.
        if (showProps) {
            handlePropGoingInToChild(pipe);
        }
    }

    return (
        <div>
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
                {(showProps || pipe.state == 'editing') && pipe.props && pipe.props.map(propContent => {
                    return (
                        // <AttributeContentWrapper content={propContent} />
                        <div className="flex">
                            <PipeContentPropWrapper
                                propContent={propContent}
                                handleUpdateAttributeContent={handleUpdateAttributeContent}
                            />
                            {/** removing prop's content when options button is clicked within this pipe */}
                            {pipe.state == 'showOptions' && <button
                                title="Remove"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold ml-1 px-2 rounded-xl ml-auto"
                                onClick={() => handleUpdateAttributeContent('delete', propContent.id)}
                            >
                                x
                            </button>}
                        </div>

                    )
                }
                )}
                {pipe.state == 'showOptions' &&
                    <button
                        title="Add"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold mt-1 px-2 rounded-xl"
                        onClick={() => handleUpdateAttributeContent('editing')}
                    >+</button>}

                {pipe.state == 'editing' &&
                    <div className="relative">
                        <input ref={contentNameRef} style={{ width: '120px' }} />
                        <span>: </span>
                        <input ref={contentTypeRef} style={{ width: '120px' }} />
                        <div className="absolute bg-white right-[-15px] top-[0px]">
                            <button onClick={() => handleUpdateAttributeContent('add')}>+</button>
                            {/**change current pipe'state to be 'none' */}
                            <button onClick={() => handleUpdateAttributeContent('cancelAdd')}>x</button>
                        </div>
                    </div>
                }

            </div>

            {(showProps || pipe.state == 'editing') && <div>
                {/**change current pipe'state to be 'none' */}
                <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-md"
                title="Options"
                onClick={() => handleOptionsButton()}
                >
                    C
                </button>
                {/**set  showProps to be false */}
                <button 
                onClick={()=>handleMinimizeButton()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-md" title="Minimize">
                    M
                </button>
            </div>}

        </div>
    )
}

export default PipeContentWrapper;