// --- 1. Get all the elements from the page ---
var allVesselCards = document.querySelectorAll('.vessel-card');
var allServiceCards = document.querySelectorAll('.service-card');
var allCheckboxes = document.querySelectorAll('.service-card input');
var lengthInput = document.getElementById('boat-length');
var planSelect = document.getElementById('plan-type');
var emergencyToggle = document.getElementById('emergency-toggle');
var totalPriceText = document.getElementById('total-price');
var priceLabel = document.getElementById('price-label');
var bookBtn = document.getElementById('book-btn');
var confirmation = document.getElementById('confirmation');

// Pricing Constants
const PER_FOOT_RATE = 4.50; // $4.50 per foot
const EMERGENCY_FEE = 150.00;
const MONTHLY_DISCOUNT = 0.20; // 20% off

// This variable remembers which boat is currently picked
var currentBoat = "sailboat";

// --- 2. Function to handle clicking a boat card ---
function selectVessel(event) {
    for (var i = 0; i < allVesselCards.length; i++) {
        allVesselCards[i].classList.remove('active');
    }

    var clickedCard = event.currentTarget;
    clickedCard.classList.add('active');
    currentBoat = clickedCard.getAttribute('data-vessel');

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

        if (allowedVessels.includes(currentBoat)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
            var cb = card.querySelector('input');
            if (cb) { cb.checked = false; }
        }
    }
}

// --- 4. Function to calculate the money ---
function calculateTotal() {
    var boatLength = parseInt(lengthInput.value) || 0;

    // A. Length-based pricing
    let price = boatLength * PER_FOOT_RATE;

    // B. Service costs
    for (var j = 0; j < allCheckboxes.length; j++) {
        var box = allCheckboxes[j];

        if (box.checked) {
            // Get base price from the card itself
            const card = box.closest('.service-card');
            const priceText = card.querySelector('.price-val').innerText;
            const baseServicePrice = parseFloat(priceText.replace('$', ''));
            price += baseServicePrice;

            // Add surcharges based on type
            var serviceType = box.getAttribute('data-type');
            if (serviceType === 'eco') { price += 15; }
            if (serviceType === 'emergency') { price += 85; }
        }
    }

    // C. Emergency "On-Water" Surcharge
    if (emergencyToggle.checked) {
        price += EMERGENCY_FEE;
        priceLabel.innerText = "EMERGENCY TOTAL";
        priceLabel.style.color = "#e53e3e";
    } else {
        priceLabel.innerText = "ESTIMATED TOTAL";
        priceLabel.style.color = "#718096";
    }

    // D. Monthly Maintenance Bundle (Discount)
    if (planSelect.value === 'monthly') {
        price = price * (1 - MONTHLY_DISCOUNT);
        priceLabel.innerText += " (BUNDLE RATE)";
    }

    // Display the final number
    totalPriceText.innerText = price.toFixed(2);
}

// --- 5. Booking Action ---
bookBtn.onclick = function () {
    confirmation.style.display = "flex";
};

// Listeners
for (var k = 0; k < allCheckboxes.length; k++) {
    allCheckboxes[k].onchange = calculateTotal;
}
lengthInput.oninput = calculateTotal;
planSelect.onchange = calculateTotal;
emergencyToggle.onchange = calculateTotal;

// Run these once at the start
filterTheList();
calculateTotal();
