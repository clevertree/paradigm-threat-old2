import React from 'react';
import {render, screen} from '@testing-library/react';
import VideoAsset from "./VideoAsset.js";
import AssetBrowser from "../../AssetBrowser.js";

describe('VideoAsset Component', () => {
    const alt = 'Video Alt Value';
    const src = 'youtube.com/shorts/Vv-cOmA2sz0';
    const srcAlt = 'youtube.com shorts Vv cOmA2sz0';

    test('renders', () => {
        render(<AssetBrowser>
                <VideoAsset
                    src={src}
                    caption="Test *Caption*"
                />
            </AssetBrowser>
        );
        const imgElement = screen.getByTitle(srcAlt);
        expect(imgElement).toBeInTheDocument();
    });

    test('renders with alt', () => {
        render(<AssetBrowser>
                <VideoAsset
                    alt={alt}
                    src={src}
                    caption="Test *Caption*"
                />
            </AssetBrowser>
        );
        const imgElement = screen.getByTitle(alt);
        expect(imgElement).toBeInTheDocument();
    });
})
