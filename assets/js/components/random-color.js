function getRandomColor() {
    var h = Math.floor(Math.random() * 360);
    var s = Math.floor(Math.random() * 100) + 50; // ensure saturation is at least 50%
    var l = Math.floor(Math.random() * 50) + 30; // ensure lightness is between 30% and 80%
    return `hsl(${h},${s}%,${l}%)`;
}

export { getRandomColor }