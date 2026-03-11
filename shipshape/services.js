// --- 1. Get all the elements from the page ---
var allVesselCards = document.querySelectorAll('.vessel-card');
var allServiceCards = document.querySelectorAll('.service-card');
var allCheckboxes = document.querySelectorAll('.service-card input');
var lengthInput = document.getElementById('boat-length');
var totalPriceText = document.getElementById('total-price');
var bookBtn = document.getElementById('book-btn');
var confirmation = document.getElementById('confirmation');

// This variable remembers which boat is currently picked
var currentBoat = "sailboat";

// --- 2. Function to handle clicking a boat card ---
function selectVessel(event) {
    // A. Remove 'active' class from all cards to reset them
    for (var i = 0; i < allVesselCards.length; i++) {
        allVesselCards[i].classList.remove('active');
    }

    // B. Add 'active' class to the specific card that was clicked
    // We use .closest('.vessel-card') in case they click the icon or text inside
    var clickedCard = event.currentTarget;
    clickedCard.classList.add('active');

    // C. Update our 'currentBoat' variable
    currentBoat = clickedCard.getAttribute('data-vessel');

    // D. Run our other functions to update the page
    filterTheList();
    calculateTotal();
}

// Attach the click event to each card
for (var a = 0; a < allVesselCards.length; a++) {
    allVesselCards[a].onclick = selectVessel;
}

// --- 3. Function to show/hide services based on the boat ---
function filterTheList() {
    for (var i = 0; i < allServiceCards.length; i++) {
        var card = allServiceCards[i];
        var allowedVessels = card.getAttribute('data-vessels');

        // Check if the current boat name is inside the allowed list
        if (allowedVessels.includes(currentBoat)) {
            card.style.display = "block"; // Show it
        } else {
            card.style.display = "none"; // Hide it
            // Also uncheck it so it doesn't add to the price!
            var cb = card.querySelector('input');
            if (cb) { cb.checked = false; }
        }
    }
}

// --- 4. Function to calculate the money ---
function calculateTotal() {
    var boatLength = parseInt(lengthInput.value) || 0;
    var price = 75; // Starting base price

    // Add extra cost for long boats (over 30ft)
    if (boatLength > 30) {
        var extraFeet = boatLength - 30;
        price = price + (extraFeet * 2.5);
    }

    // Loop through checkboxes and add fees if they are checked
    for (var j = 0; j < allCheckboxes.length; j++) {
        var box = allCheckboxes[j];

        // Only count the box if it's checked
        if (box.checked) {
            var serviceType = box.getAttribute('data-type');
            if (serviceType === 'eco') { price = price + 15; }
            if (serviceType === 'emergency') { price = price + 85; }
        }
    }

    // Display the final number
    totalPriceText.innerText = price.toFixed(2);
}

// --- 5. Booking Action ---
bookBtn.onclick = function () {
    confirmation.style.display = "flex";
};

// Make the price update whenever a checkbox or the length changes
for (var k = 0; k < allCheckboxes.length; k++) {
    allCheckboxes[k].onchange = calculateTotal;
}
lengthInput.oninput = calculateTotal;

// Run these once at the start so the page looks right immediately
filterTheList();
calculateTotal();
