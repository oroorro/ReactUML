import './AttributeIconStyle.css'

type AttributeIconProps = {
    color: string,
    nameOfIcon: string
}


const AttributeIcon = (props: AttributeIconProps) => {


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
      

      const originalColor: string = '#ffdc6b'; // The color that we want to modify 
      const modifiedColor: string = changeHexColorByReferenceDifference(
        originalColor,
        '#00bfff', //ref color that we are changing from 
        '#acf4fa' //ref color that we are changing to 
      );
      
    console.log(modifiedColor);
      
    return (
        <div className="icon-container">
            <div className="circle">
                <div className="inner-circle" style={{backgroundColor: '#00bfff'}}>
                    <span className="icon">i</span>
                </div>
            </div>
        </div>
    )

}

export {AttributeIcon, type AttributeIconProps}