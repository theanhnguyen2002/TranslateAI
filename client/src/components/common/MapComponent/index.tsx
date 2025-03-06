/* eslint-disable jsx-a11y/iframe-has-title */
import React from 'react';

const MapComponent = () => {
    const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3408.1895228604976!2d105.88130627486976!3d21.27048058044002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31350500a6f4e291%3A0x941f18fc2a74f0b6!2sHima%20Wedding%20Film!5e1!3m2!1svi!2s!4v1731578970916!5m2!1svi!2s";

    return (
        <div className="w-full">
            <iframe
                src={mapSrc}
                style={{
                    border: 0,
                    borderRadius: "10px",
                    height: 300,
                    width: "100%",
                }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            />
        </div>
    );
};

export default MapComponent;
