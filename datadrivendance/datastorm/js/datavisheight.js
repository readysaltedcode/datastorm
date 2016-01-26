var screenWidth = window.innerWidth;
if (screenWidth > 600 && screenWidth < 1000) {
    alert("Medium");
    document.getElementById("codepen").data-height="400";
} else if (screenWidth < 601) {
    alert("Small");
    document.getElementById("codepen").data-height="200";
};
