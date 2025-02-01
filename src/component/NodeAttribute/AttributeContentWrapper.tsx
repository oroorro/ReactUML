import { useState, useRef, useEffect } from "react";
import { AttributeContent, ReactInBuiltAttributeContent, AttributeContentWrapperProps, AttributeData,UniqueId } from "../../types"



const AttributeContentWrapper = ({
    content,
    handleUpdateAttributeContent,
    nodeId,
    attributeId
    //option button or minimize button, they will make isEditing to be false 
    //update Attribute's content in data structure 
}: AttributeContentWrapperProps) => {

    const isAttributeContent = (content: AttributeContent | ReactInBuiltAttributeContent): content is AttributeContent => {
        return (content as AttributeContent).name !== undefined;
      };

    const [isEditing, setIsEditing] = useState(false);

     const [editableContent, setEditableContent] = useState(
        isAttributeContent(content)
        ? { name: content.name, type: content.type ?? "N/A" }
        : { name: "", type: "N/A" }
    );


 

    const handleDoubleClick = () => {
        if (isAttributeContent(content)) {
          setIsEditing(true);
        }
      };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableContent((prev) => ({ ...prev, [name]: value }));
    };

    const handleBlur = () => {
        setIsEditing(false);

        const attribData: AttributeData = {
            changingContent: {
                name: editableContent.name,
                type: editableContent.type
            }
        }

        handleUpdateAttributeContent('changeValue', content.id, attribData);
    };


    return (
        // <div>
            <div
                onDoubleClick={handleDoubleClick}
            >

                {isEditing ? (
                    <>
                        <input
                            name="name"
                            value={editableContent.name}
                            onChange={handleChange}
                            onBlur={()=>handleBlur()}
                            autoFocus
                            className="border rounded px-1"
                        />
                        <span>: </span>
                        <input
                            name="type"
                            value={editableContent.type}
                            onChange={handleChange}
                            onBlur={()=>handleBlur()}
                            className="border rounded px-1"
                        />
                    </>
                ) : (
                    <>
                        {"name" in content &&
                            <div 
                            datatype="AttributeContent"
                            data-id={`${nodeId}+${attributeId}+${content.id}`}
                            className='attributeContentWrapper relative inline-block p-2 border-2 border-transparent hover:border-blue-500 transition duration-300' style={{ border: '1px solid black', padding: '0px 3px', borderRadius: '5px' }}>
                                <span  className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.name}</span>
                                <span>: </span>
                                <span  className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{content.type ?? "N/A"}</span>
                            </div>

                        }
                    </>
                )}

                
            </div>
           
        // </div>
    )
}

export default AttributeContentWrapper;