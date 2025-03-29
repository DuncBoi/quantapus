let vantaInstance = null;

window.initBackground = function() {
    // Cleanup any existing instance first
    if (vantaInstance) {
        vantaInstance.destroy();
    }

    // Create new instance
    vantaInstance = VANTA.TOPOLOGY({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0x24252A,
        color: 0x487EB5
    });

    // Return cleanup function
    return () => {
        if (vantaInstance) {
            console.log('Cleaning up Vanta');
            vantaInstance.destroy();
            vantaInstance = null;
        }
    };
};