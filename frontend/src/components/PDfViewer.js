import React from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { highlightPlugin, Trigger } from '@react-pdf-viewer/highlight';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

const PdfViewer = ({ fileUrl, areas }) => {
    const renderHighlights = (props) => (
        <div>
            {areas
                .filter((area) => area.pageIndex === props.pageIndex)
                .map((area, idx) => (
                    <div
                        key={idx}
                        className="highlight-area"
                        style={Object.assign(
                            {},
                            {
                                background: 'yellow',
                                opacity: 0.4,
                            },
                            props.getCssProperties(area, props.rotation)
                        )}
                    />
                ))}
        </div>
    );

    const highlighter = highlightPlugin({
        renderHighlights,
        trigger: Trigger.None,
    });

    const zoom = zoomPlugin();
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoom;

    return (
        <div
            className="rpv-core__viewer"
            style={{
                border: '1px solid rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            <div
                style={{
                    alignItems: 'center',
                    backgroundColor: '#eeeeee',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '4px',
                }}
            >
                <ZoomOutButton />
                <ZoomPopover />
                <ZoomInButton />
            </div>
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                }}
            ></div>                
            <Viewer fileUrl={fileUrl} plugins={[highlighter, zoom]} defaultScale={1.25} />
        </div>
    );
};

export default PdfViewer;