import { AttributeContent,  ReactInBuiltAttributeContent} from "../types";

export const isAttributeContent = (content: AttributeContent | ReactInBuiltAttributeContent): content is AttributeContent => {
    return (content as AttributeContent).name !== undefined;
  };