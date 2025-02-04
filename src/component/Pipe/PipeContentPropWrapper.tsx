import { PipeContentPropWrapperProps } from "../../types"
import { useState } from "react";

const PipeContentPropWrapper = ({
    propContent,
    handleUpdateAttributeContent
}:PipeContentPropWrapperProps) =>{


    
    const [editableContent, setEditableContent] = useState(
        { name: propContent.name, type: propContent.type ?? "N/A" }
    );

    return (
        <div
            
            className="attributeContentWrapper border-2 border-transparent hover:bg-[#FFFFFF]">
            <span className="hover:bg-[#E8E8E8] transition duration-300 rounded-md px-1">{propContent.name}</span>
            <span>: </span>
            <span className="hover:bg-[#E8E8E8] transition duration-300 rounded-md px-1" >{propContent.type}</span>
        </div>
    )
}

export default PipeContentPropWrapper;