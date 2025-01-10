import './AttributeIconStyle.css'

type AttributeIconProps = {
    color: string,
    nameOfIcon: string,
    size?: number,
    isExpanded?: boolean,
}


const AttributeIcon = (props: AttributeIconProps) => {

    const iconFirstLetter = props.nameOfIcon.charAt(0).toUpperCase();

    function changeHexColorByReferenceDifference(
        hex: string,
        referenceHex: string,
        targetHex: string
      ): string {
        // Helper function to convert hex to RGB array
        const hexToRgb = (hex: string): [number, number, number] => {
          if (hex.startsWith('#')) hex = hex.slice(1);
          return [
            parseInt(hex.substring(0, 2), 16),
            parseInt(hex.substring(2, 4), 16),
            parseInt(hex.substring(4, 6), 16),
          ];
        };
      
        // Helper function to convert RGB array back to hex
        const rgbToHex = (rgb: [number, number, number]): string => {
          return `#${rgb.map((val) => val.toString(16).padStart(2, '0')).join('')}`;
        };
      
        // Helper function to clamp a value between 0 and 255
        const clamp = (value: number): number => {
          return Math.max(0, Math.min(255, value));
        };
      
        // Convert colors to RGB
        const baseRgb: [number, number, number] = hexToRgb(referenceHex); // #00bfff
        const targetRgb: [number, number, number] = hexToRgb(targetHex); // #acf4fa
        const inputRgb: [number, number, number] = hexToRgb(hex); // Given hex color
      
        // Calculate the differences for each channel
        const diff: [number, number, number] = targetRgb.map(
          (value, index) => value - baseRgb[index]
        ) as [number, number, number];
      
        // Apply the differences to the input color
        const modifiedRgb: [number, number, number] = inputRgb.map((value, index) =>
          clamp(value + diff[index])
        ) as [number, number, number];
      
        // Convert back to hex and return
        return rgbToHex(modifiedRgb);
      }
      
      const modifiedColor: string = changeHexColorByReferenceDifference(
        props.color,
        '#00bfff', //ref color that we are changing from 
        '#acf4fa' //ref color that we are changing to 
      );

      const extraModifiedColor: string = changeHexColorByReferenceDifference(
        modifiedColor,
        '#00bfff', //ref color that we are changing from 
        '#acf4fa' //ref color that we are changing to 
      );
      
    //console.log("modifiedColor", props.color, modifiedColor);
      
    if(!props.isExpanded){
        return (
            <div className="icon-container">
                <div className="circle" style={{width: '20px', height: '20px'}}>
                    <div className="inner-circle" style={{backgroundColor: props.color, width: '17px', height: '17px', boxShadow: `0px 4.5px 2px ${modifiedColor} inset , 1px 1.5px 1px ${extraModifiedColor} inset`}}>
                        <span className="icon" style={{fontSize:'15px', transform: 'scaleX(1.2)'}}>{iconFirstLetter}</span>
                    </div>
                </div>
            </div>
        )
    }else{
        return (
            <div className="icon-container">
                <span className="icon text-xl" >{props.nameOfIcon}</span>
            </div>
        )
    }
    

}

export {AttributeIcon, type AttributeIconProps}