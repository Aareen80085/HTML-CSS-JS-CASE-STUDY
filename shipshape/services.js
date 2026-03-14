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

// --- 5. Booking Action & Receipt ---
bookBtn.onclick = function () {
    if (!selectedMarina) {
        alert("Please select a Marina Location before booking.");
        // Scroll the user back up to the map
        document.querySelector('.map-container-inline').scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    if (!sessionStorage.getItem('shipshape_loggedIn')) {
        saveBookingState();
        sessionStorage.setItem('shipshape_pendingBooking', 'true');
        window.location.href = 'login.html';
        return;
    }
    showReceipt();
};

document.getElementById('close-receipt-btn').onclick = function() {
    confirmation.style.display = "none";
};

function saveBookingState() {
    const state = {
        boat: currentBoat,
        length: lengthInput.value,
        plan: planSelect.value,
        emergency: emergencyToggle.checked,
        marina: typeof selectedMarina !== 'undefined' ? selectedMarina : "Unknown Marina",
        services: []
    };
    for (let cb of allCheckboxes) {
        if (cb.checked) state.services.push(cb.id);
    }
    sessionStorage.setItem('shipshape_bookingState', JSON.stringify(state));
}

function restoreBookingState() {
    const stateStr = sessionStorage.getItem('shipshape_bookingState');
    if (!stateStr) return;
    const state = JSON.parse(stateStr);
    
    currentBoat = state.boat;
    lengthInput.value = state.length;
    planSelect.value = state.plan;
    emergencyToggle.checked = state.emergency;
    if (state.marina && typeof selectedMarina !== 'undefined') {
        selectedMarina = state.marina;
    }
    
    for (let c of allVesselCards) {
        c.classList.remove('active');
        if (c.getAttribute('data-vessel') === state.boat) {
            c.classList.add('active');
        }
    }
    
    filterTheList(); 
    
    for (let cb of allCheckboxes) {
        if (state.services.includes(cb.id)) {
            cb.checked = true;
        }
    }
}

function showReceipt() {
    const email = sessionStorage.getItem('shipshape_email') || 'Guest';
    let boatLength = parseInt(lengthInput.value) || 0;
    let serviceItemsHTML = '';
    
    let subtotal = boatLength * PER_FOOT_RATE;
    serviceItemsHTML += `
        <div class="receipt-item">
            <span>Base Rate (${boatLength}ft)</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
    `;

    for (let j = 0; j < allCheckboxes.length; j++) {
        let box = allCheckboxes[j];
        if (box.checked) {
            const card = box.closest('.service-card');
            const name = card.querySelector('.service-name').innerText;
            const priceText = card.querySelector('.price-val').innerText;
            let itemPrice = parseFloat(priceText.replace('$', ''));
            
            var serviceType = box.getAttribute('data-type');
            if (serviceType === 'eco') { itemPrice += 15; }
            if (serviceType === 'emergency') { itemPrice += 85; }

            serviceItemsHTML += `
                <div class="receipt-item">
                    <span>${name}</span>
                    <span>$${itemPrice.toFixed(2)}</span>
                </div>
            `;
        }
    }

    if (emergencyToggle.checked) {
        serviceItemsHTML += `
            <div class="receipt-item">
                <span>Emergency Surcharge</span>
                <span>$${EMERGENCY_FEE.toFixed(2)}</span>
            </div>
        `;
    }

    let planLabel = planSelect.options[planSelect.selectedIndex].text;
    let finalTotal = totalPriceText.innerText;
    let marinaDisplay = typeof selectedMarina !== 'undefined' ? selectedMarina : "Pending Assignment";

    const receiptHTML = `
        <div class="receipt-item">
            <strong>Customer Email:</strong>
            <span>${email}</span>
        </div>
        <div class="receipt-item">
            <strong>Vessel:</strong>
            <span style="text-transform: capitalize;">${currentBoat}</span>
        </div>
        <div class="receipt-item">
            <strong>Location:</strong>
            <span>${marinaDisplay}</span>
        </div>
        <div class="receipt-item">
            <strong>Service Plan:</strong>
            <span>${planLabel}</span>
        </div>
        <div style="margin: 16px 0 8px; font-weight: 700; color: #2d3748; border-bottom: 2px solid #edf2f7; padding-bottom: 4px;">Cost Breakdown</div>
        ${serviceItemsHTML}
        <div class="receipt-item total-row">
            <span>Total Paid</span>
            <span>$${finalTotal}</span>
        </div>
    `;

    document.getElementById('receipt-details').innerHTML = receiptHTML;
    confirmation.style.display = "flex";
}

// Listeners
for (var k = 0; k < allCheckboxes.length; k++) {
    allCheckboxes[k].onchange = calculateTotal;
}
lengthInput.oninput = calculateTotal;
planSelect.onchange = calculateTotal;
emergencyToggle.onchange = calculateTotal;

// Run these once at the start
restoreBookingState();
filterTheList();
calculateTotal();

// Check if returning from login
if (sessionStorage.getItem('shipshape_pendingBooking') === 'true' && sessionStorage.getItem('shipshape_loggedIn')) {
    sessionStorage.removeItem('shipshape_pendingBooking');
    setTimeout(showReceipt, 100);
}

// Update nav dynamically
const navLoginLinks = document.querySelectorAll('a[href="login.html"]');
if (sessionStorage.getItem('shipshape_loggedIn')) {
    navLoginLinks.forEach(link => {
        link.innerText = 'Logout';
        link.onclick = (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.reload();
        };
    });
}

// --- 6. Progress Tracker ---
const progressSteps = document.querySelectorAll('.progress-step');
const bookingSections = document.querySelectorAll('.booking-section');

if (progressSteps.length > 0 && bookingSections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(bookingSections).indexOf(entry.target);
                
                progressSteps.forEach((step, i) => {
                    if (i === index) {
                        step.classList.add('active');
                        step.classList.remove('completed');
                    } else if (i < index) {
                        step.classList.add('completed');
                        step.classList.remove('active');
                    } else {
                        step.classList.remove('active', 'completed');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    bookingSections.forEach(section => observer.observe(section));
    
    // Add click to scroll functionality
    progressSteps.forEach((step, index) => {
        step.style.cursor = 'pointer';
        step.addEventListener('click', () => {
            bookingSections[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}
