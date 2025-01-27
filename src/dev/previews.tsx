import {ComponentPreview, Previews} from "@react-buddy/ide-toolbox-next";
import {PaletteTree} from "./palette";
import RootLayout from "@/app/layout";

const ComponentPreviews = () => {
    return (
        <Previews palette={<PaletteTree/>}>
            <ComponentPreview path="/PaletteTree">
                <PaletteTree/>
            </ComponentPreview>
            <ComponentPreview path="/RootLayout">
                <RootLayout />
            </ComponentPreview>
        </Previews>
    );
};

export default ComponentPreviews;