import { PipeContentPropWrapperProps } from "../../types"
import { useState } from "react";
import { AttributeData } from "../../types";
const PipeContentPropWrapper = ({
    propContent,
    handleUpdateAttributeContent,
    nodeId,
    pipeId,
    setIsWriting,
    isWriting
}:PipeContentPropWrapperProps) =>{

    const writingFlag = isWriting.find((content) => content == propContent.id) as string;
    const [isEditing, setIsEditing] = useState(false);
    
    const [editableContent, setEditableContent] = useState(
        { name: propContent.name, type: propContent.type ?? "N/A" }
    );

    const handleDoubleClick = () => {
        setIsEditing(true);
        setIsWriting((prev) => {
            //add propContent's id into isWriting only if it did not exist 
            if (prev.includes(propContent.id)) {
                return prev.filter((name) => name !== propContent.id);
            }
            // Otherwise, add it to the array
            return [...prev, propContent.id];
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditableContent((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        setIsWriting((prev) => {
            //remove exisiting propContent's id in isWriting 
            return prev.filter((name) => name !== propContent.id);
        });
        setIsEditing(false);
        const attribData: AttributeData = {
            changingContent: {
                name: editableContent.name,
                type: editableContent.type
            }
        }

        handleUpdateAttributeContent!('changeValue', propContent.id, attribData);
    }


    return (

        <div
            className="flex"
                onDoubleClick={handleDoubleClick}
            >
                {isEditing ? (
                    <>
                    <input
                        name="name"
                        value={editableContent.name}
                        onChange={handleChange}
                        autoFocus
                        className="border rounded px-1"
                    />
                    <span>: </span>
                    <input
                        name="type"
                        value={editableContent.type}
                        onChange={handleChange}
                      
                        className="border rounded px-1"
                    />
                    </>
                ):
                (
                    <>
                        <div 
                        datatype="AttributeContent"
                        data-id={`${nodeId}+${pipeId}+${propContent.id}`}
                        className='attributeContentWrapper relative border-2 border-transparent hover:bg-[#FFFFFF]' 
                        >
                            <span  className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{propContent.name}</span>
                            <span>: </span>
                            <span  className="hover:bg-[#ebebeb] transition duration-300 rounded-md px-1">{propContent.type ?? "N/A"}</span>
                        </div>
                    </>
                )
               
                } 
                {writingFlag && <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold ml-1 px-2 rounded-xl ml-auto"
                onClick={()=>handleSubmit()}>x</button>}
            </div>
    )
}

export default PipeContentPropWrapper;