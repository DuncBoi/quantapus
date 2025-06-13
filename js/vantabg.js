let vantaInstance = null;

window.initBackground = function() {
    // Cleanup any existing instance first
    if (vantaInstance) {
        vantaInstance.destroy();
    }

    // Create new instance
    vantaInstance = VANTA.WAVES({
        el: "#vanta-bg",
        mouseControls: false,
        gyroControls: true,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        shininess: 10.00,
        waveSpeed: 0.5,
        waveHeight: 25,
        zoom: 0.55,
        color: 0x24252A,
      })

    // Return cleanup function
    return () => {
        if (vantaInstance) {
            console.log('Cleaning up Vanta');
            vantaInstance.destroy();
            vantaInstance = null;
        }
    };
};