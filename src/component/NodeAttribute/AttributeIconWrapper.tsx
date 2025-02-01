import { useRef } from "react";
import { AttributeIcon } from "./AttributeIcon"
import { AttributeIconWrapperProps, AttributeContent, ReactInBuiltAttributeContent } from "../../types"
import { useStoreApi } from "../../hook/useStore";
import { ReactChild, UniqueId } from "../../types";
import { generateUniqueId } from "../../utils/generateId";


const AttributeIconWrapper = ({
    attribute, 
    isExpanded, 
    handleClickOnAttribute, 
    attributeColors,
    nodeId
}:AttributeIconWrapperProps) =>{

    const store = useStoreApi();
    const { setNodes, getNodes } = store.getState();

    const contentNameRef = useRef<HTMLInputElement>(null);
    const contentTypeRef = useRef<HTMLInputElement>(null);



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

    //id of AttributeContent, change state into, 
    const handleUpdateAttributeContent = () => {

        const nodes = getNodes();

        const reactChild: ReactChild[] = [nodes[0].data];

        let node = findNodeById(nodeId, reactChild);
    
        const targetAttribute = node?.attributes.find((attri)=>attri.id == attribute.id);

        //add 
        if(targetAttribute?.AttributeContents && contentNameRef.current && contentNameRef.current.value != ''){

            const newAttributeContet:AttributeContent = {
                id: generateUniqueId(),
                name: contentNameRef.current?.value as string,
                type: contentTypeRef.current?.value as string,
                belongsTo: attribute.id
            }
            targetAttribute.AttributeContents = [...targetAttribute.AttributeContents as AttributeContent[], newAttributeContet];

            //clean <input/> 
            if(contentNameRef.current && contentTypeRef.current){
                contentNameRef.current.value = "";
                contentTypeRef.current.value = "";
            }
           

        }else{
            console.warn("targetAttribute couldn't be found");
        }
        console.log("targetAttribute", targetAttribute,);

        //cancelAdding

        //delete 

        setNodes(nodes);

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
                            <span style={{ marginLeft: '3px', fontSize: '18px', fontWeight: '500' }}>{attribute.totalNumberOfAttribute}</span>
                        </div>
                    </div>

                    {/** showing button to minimize AttributeWrapper */}
                    {isExpanded &&
                        <button 
                            title='minimize'
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-4 rounded-xl ml-auto"
                            onClick={isExpanded ? () => handleClickOnAttribute(attribute.id) : undefined} // Disable onClick if isExpanded
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
                    {isExpanded && attribute.AttributeContents && attribute.AttributeContents.map((content: AttributeContent | ReactInBuiltAttributeContent) => (
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
                    {attribute.state == 'editing' && <div>
                                <input ref={contentNameRef} className="bg-white shadow-md appearance-none focus:outline-none focus:bg-gray-100"></input>
                                <span className="mx-2 s">:</span>
                                <input ref={contentTypeRef} className="bg-white shadow-md appearance-none focus:outline-none focus:bg-gray-100"></input>
                                <button className="ml-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-xl ml-auto"
                                    onClick={()=>handleUpdateAttributeContent()}
                                    title="add"
                                    >
                                    +
                                </button>
                                <button
                                    title="cancel"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold  px-2 rounded-xl ml-auto"
                                    
                                    >
                                x
                                </button>
                    </div>}
                    {/* { isExpanded && <button  >+</button>} */} 
                </div>
            </div>
    )
}

export default AttributeIconWrapper;