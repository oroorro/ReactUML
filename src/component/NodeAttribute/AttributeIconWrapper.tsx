import { AttributeIcon } from "./AttributeIcon"
import { AttributeIconWrapperProps, AttributeContent, ReactInBuiltAttributeContent } from "../../types"


const AttributeIconWrapper = ({
    attribute, 
    isExpanded, 
    handleClickOnAttribute, 
    attributeColors
}:AttributeIconWrapperProps) =>{

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
                datatype='AttributeContainer'
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
                            </div>}

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
                </div>
            </div>
    )
}

export default AttributeIconWrapper;