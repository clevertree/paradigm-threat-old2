import React from 'react';
import {render, screen} from '@testing-library/react';
import ImageAsset from "./ImageAsset.js";
import AssetBrowser from "../../AssetBrowser.js";

describe('ImageAsset Component', () => {
    const alt = 'Image Alt Value';
    const src = 'http://localhost/path/some_image.jpg';
    const srcAlt = 'path some image';

    test('renders', () => {
        render(<AssetBrowser>
                <ImageAsset
                    src={src}
                    caption="Test *Caption*"
                />
            </AssetBrowser>
        );
        const imgElement = screen.getByAltText(srcAlt);
        expect(imgElement).toBeInTheDocument();
    });

    test('renders with alt', () => {
        render(<AssetBrowser>
                <ImageAsset
                    alt={alt}
                    src={src}
                    caption="Test *Caption*"
                />
            </AssetBrowser>
        );
        const imgElement = screen.getByAltText(alt);
        expect(imgElement).toBeInTheDocument();
    });
})
