import { useRef } from "react";
import { AttributeIcon } from "./AttributeIcon"
import { AttributeIconWrapperProps, AttributeContent, ReactInBuiltAttributeContent, Attribute, AttributeData } from "../../types"
import { useStoreApi } from "../../hook/useStore";
import { ReactChild, UniqueId } from "../../types";
import { generateUniqueId } from "../../utils/generateId";
import AttributeContentWrapper from "./AttributeContentWrapper";



const AttributeIconWrapper = ({
    attribute,
    isExpanded,
    handleClickOnAttribute,
    attributeColors,
    nodeId
}: AttributeIconWrapperProps) => {

    const store = useStoreApi();
    const { setNodes, getNodes } = store.getState();

    const contentNameRef = useRef<HTMLInputElement>(null);
    const contentTypeRef = useRef<HTMLInputElement>(null);
    

    const isAttributeContent = (content: AttributeContent | ReactInBuiltAttributeContent): content is AttributeContent => {
        return (content as AttributeContent).name !== undefined;
      };

    const getCurrentAttribute = (): Attribute | undefined => {
        const nodes = getNodes();

        //const reactChild: ReactChild[] = [nodes[0].data];
        const currentNodes: ReactChild[] = nodes.map(node => node.data);
        let node = findNodeById(nodeId, currentNodes);

        const targetAttribute = node?.attributes.find((attri) => attri.id == attribute.id);

        return targetAttribute
    }


    function findNodeById(nodeId: UniqueId, initialNodes: ReactChild[]): ReactChild | undefined {
        // Use a queue for Breadth-First Search
        const queue: ReactChild[] = [...initialNodes];

        while (queue.length > 0) {
            const currentNode = queue.shift(); // Dequeue the first node

            if (!currentNode) continue;

            // Check if the current node's id matches
            if (currentNode.id === nodeId) {
                return currentNode;
            }

            // Add children to the queue if they exist
            if (currentNode.children && currentNode.children.length > 0) {
                queue.push(...currentNode.children);
            }
        }

        // Return undefined if the node was not found
        return undefined;
    }

    //nodeId, attributeId, attributeContentId 
    //this function is used to change state of Attribute or it's content 
    //@param option represents state that Attribute will be changing into 
    //@param contentId represents to Attribute's content id; it is used when deleting a content from current(this) Attribute
    const handleUpdateAttributeContent = (option: string, contentId: UniqueId = '-', data?: AttributeData) => {

        const nodes = getNodes();

        //const reactChild: ReactChild[] = [nodes[0].data];
        const currentNodes: ReactChild[] = nodes.map(node => node.data);

        let node = findNodeById(nodeId, currentNodes);

        const targetAttribute = node?.attributes.find((attri) => attri.id == attribute.id);

        if (targetAttribute) {
            //add 
            if (option == 'add') {
                if (contentNameRef.current && contentNameRef.current.value != '') {
                    //create new AttributeContent 
                    const newAttributeContet: AttributeContent = {
                        id: generateUniqueId(),
                        name: contentNameRef.current?.value as string,
                        type: contentTypeRef.current?.value as string,
                        belongsTo: attribute.id
                    }
                    //adding newly created AttributeContent with previously existing AttributeContents in target Attribute 
                    targetAttribute.AttributeContents = [...targetAttribute.AttributeContents as AttributeContent[], newAttributeContet];

                    //clean <input/> if there was any input given 
                    if (contentNameRef.current && contentTypeRef.current) {
                        contentNameRef.current.value = "";
                        contentTypeRef.current.value = "";
                    }
                }
            } else if (option == 'cancelAdd' || option == 'none') {
                //change state to none 
                targetAttribute.state = 'none';
            }
            //show options
            else if (option == 'showOptions') {
                targetAttribute.state = 'showOptions';
            }
            else if (option == 'editing') { //showing two input HTML elements with two buttons for creating '+' and cancelling 'x'
                targetAttribute.state = 'editing';
            }
            //changing value 
            else if(option == 'changeValue'){

                //find AttributeContent by given contentId
                const targetContent: AttributeContent = targetAttribute.AttributeContents.find((content)=> content.id == contentId) as AttributeContent;

                //change value using AttributeData
                if(isAttributeContent(targetContent)){
                    targetContent.name = data?.changingContent.name as string;
                    targetContent.type = data?.changingContent.type as string;
                }

            }
            //for given AttributeContent, change it's name and type into given value 
            else if (option == 'delete') {
                const contents: AttributeContent[] = targetAttribute.AttributeContents as AttributeContent[];
                const filteredContents = contents.filter((attrib) => attrib.id != contentId)
                console.log("filteredContents", filteredContents)
                targetAttribute.AttributeContents = [...filteredContents];
            }

        } else {
            console.warn("targetAttribute couldn't be found");
        }

        //console.log("targetAttribute", targetAttribute,);
        setNodes(nodes);
    }

    //this function will be called from minimize button on expanded mode for AttributeIconWrapper
    //1.set the Attribute state to none so that other editing buttons will disappear
    //2.set handleClickOnAttribute to not include current AttributeId 
    const handleMinimizeButton = () => {
        //1.
        handleUpdateAttributeContent('none');
        //2.
        if (isExpanded) {
            handleClickOnAttribute(attribute.id)
        }
    }

    //1. check current state
    //2. if current state was 'editing' then change the state to ''
    //3. if current state was 'showOptions' then change the state to ''
    const handleOptionsButton = () => {

        //getting currentAttribute 
        const currentAttribute = getCurrentAttribute()

        if (!currentAttribute) console.warn("Attribute is undefined");

        //change to 'none' when state does not exist in currentAttribute or currentAttribute's state is either 'editing' triggered by contextMeun's add button on Attributeor 'showOptions' triggered by clicking options
        if (currentAttribute?.state == 'showOptions' || currentAttribute?.state == 'editing' ) {
            handleUpdateAttributeContent('none')
        } else if (currentAttribute?.state == 'none' || !currentAttribute?.state ) {
            handleUpdateAttributeContent('showOptions')
        }
    }

    return (

        <div
            title={isExpanded ? '' : 'expand'}
            className={isExpanded ? 'attributeIconWrapper bg-white' : 'attributeIconWrapper bg-white hover:bg-gray-300'}
            style={{
                // display: 'flex',
                alignItems: 'baseline',

                borderRadius: '5px',
                flexDirection: 'column',
                gap: '2px',
                padding: isExpanded ? '1px 6px' : '0px 2px',

            }}
            datatype='Attribute'
            //id nodeId-attributeId
            data-id={`${nodeId}+${attribute.id}`}
            onClick={!isExpanded ? () => handleClickOnAttribute(attribute.id) : undefined} // Disable onClick if isExpanded
        >

            <div className={isExpanded ? 'attributeIconWrapperTitle flex justify-center p-1 border-b border-black' : 'attributeIconWrapperTitle flex justify-center'} >
                <div className={isExpanded ? 'flex justify-center ml-auto px-3 gap-3' : 'flex items-center'}>
                    {/** Logo of the Icon */}
                    <AttributeIcon
                        color={attributeColors[attribute.nameOfAttribute]}
                        nameOfIcon={attribute.nameOfAttribute}
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
                        </div>
                    }
                    {/** showing number of Attribute when not expanded  */}
                    <div>
                        <span style={{ marginLeft: '3px', fontSize: '18px', fontWeight: '500' }}>{attribute.AttributeContents.length}</span>
                    </div>
                </div>

                {/** showing button to minimize AttributeWrapper */}
                {isExpanded &&
                    <div>
                        <button
                            title='Options'
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-4 rounded-xl ml-auto"
                            onClick={() => handleOptionsButton()}
                        >
                            c
                        </button>
                        <button
                            title='Minimize'
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-4 rounded-xl ml-auto"
                            //onClick={isExpanded ? () => handleClickOnAttribute(attribute.id) : undefined} 
                            onClick={() => handleMinimizeButton()}
                        >
                            <span className='text-2xl'> - </span>
                        </button>
                    </div>
                }
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
                {isExpanded && attribute.AttributeContents && attribute.AttributeContents.map((content: AttributeContent | ReactInBuiltAttributeContent) => (
                    // <div>
                    //     {"name" in content &&
                    //         <div className='attributeContentWrapper relative inline-block p-2 border-2 border-transparent hover:border-blue-500 transition duration-300' style={{ border: '1px solid black', padding: '0px 3px', borderRadius: '5px' }}>
                    //             <span className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.name}</span>
                    //             <span>: </span>
                    //             <span className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.type ?? "N/A"}</span>
                    //         </div>

                    //     }
                    //     {attribute.state == 'showOptions' && <button
                    //         title="Remove"
                    //         className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold ml-1 px-2 rounded-xl ml-auto"
                    //         onClick={() => handleUpdateAttributeContent('delete', content.id)}
                    //     >
                    //         x
                    //     </button>}
                    // </div>
                    <div className="flex">
                        <AttributeContentWrapper 
                            content={content} 
                            handleUpdateAttributeContent={handleUpdateAttributeContent} 
                            nodeId={nodeId} 
                            attributeId={attribute.id}
                        />
                        {attribute.state == 'showOptions' && <button
                            title="Remove"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold ml-1 px-2 rounded-xl ml-auto"
                            onClick={() => handleUpdateAttributeContent('delete', content.id)}
                        >
                            x
                        </button>}
                    </div>

                ))}
                {attribute.state == 'editing' && <div>
                    <input ref={contentNameRef} className="bg-white shadow-md appearance-none focus:outline-none focus:bg-gray-100"></input>
                    <span className="mx-2 s">:</span>
                    <input ref={contentTypeRef} className="bg-white shadow-md appearance-none focus:outline-none focus:bg-gray-100"></input>
                    <button className="ml-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-xl ml-auto"
                        onClick={() => handleUpdateAttributeContent('add')}
                        title="add"
                    >
                        +
                    </button>
                    <button
                        title="cancel"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-2 rounded-xl ml-auto"
                        onClick={() => handleUpdateAttributeContent('cancelAdd')}
                    >
                        x
                    </button>
                </div>}
                {attribute.state == 'showOptions' &&
                    <button
                        title="Add"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold mt-1 px-2 rounded-xl"
                        onClick={() => handleUpdateAttributeContent('editing')}
                    >+</button>} {/** adding Attribute's content when showoption button is clicked  */}
            </div>
        </div>
    )
}

export default AttributeIconWrapper;