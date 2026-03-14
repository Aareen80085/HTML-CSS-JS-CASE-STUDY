// --- 1. Our Data (A list of Marinas) ---
var marinas = [
    { name: 'Sunset Bay Marina', lat: 25.7617, lng: -80.1918, techs: 3 },
    { name: 'Palm Harbor Dock', lat: 26.1224, lng: -80.1373, techs: 5 },
    { name: 'Coral Cove Marina', lat: 25.9001, lng: -80.1287, techs: 2 },
    { name: 'Blue Lagoon Port', lat: 26.3423, lng: -80.0835, techs: 4 },
    { name: 'Anchor Point Marina', lat: 25.6501, lng: -80.3328, techs: 6 }
];

// --- 2. Initialize the Map (using the Leaflet library) ---
// We start the map centered on South Florida at zoom level 10
var map = L.map('map').setView([25.95, -80.18], 10);

// This line actually "draws" the map visuals using OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Get the empty <ul> from our HTML so we can put items in it
var listContainer = document.getElementById('marina-list');

// --- 3. Loop through our data to create markers and list items ---
for (var i = 0; i < marinas.length; i++) {

    // Pick out the current marina from the list using the index [i]
    var currentMarina = marinas[i];

    // Create a physical Marker on the map
    var marker = L.marker([currentMarina.lat, currentMarina.lng]).addTo(map);

    // Give the marker a "Popup" that shows when clicked
    marker.bindPopup("<b>" + currentMarina.name + "</b><br> Technicians: " + currentMarina.techs);

    // Create a new List Item (<li>) for the sidebar
    var listItem = document.createElement('li');
    listItem.innerHTML = '<div class="marina-name"><strong>' + currentMarina.name + '</strong></div>' +
        '<div class="marina-techs text-sm text-gray-500">' + currentMarina.techs + ' technicians available</div>';

    // Save the connection: defined what happens when the user clicks a list item
    // I used a separate function to keep things clean
    setupListClick(listItem, marker, currentMarina);

    // Finally I added the list item to the <ul> container
    listContainer.appendChild(listItem);
}

// --- 4. Function to handle clicking a list item ---
// Keep track of selected marina globally
var selectedMarina = null; // Default to null enforcing strict selection

function setupListClick(item, mapMarker, data) {
    // Note: We no longer auto-select a marina right on page load. User must explicitly click one.

    item.onclick = function () {
        selectedMarina = data.name; // update local context
        // A. Move the map camera to the marina
        map.setView([data.lat, data.lng], 13);

        // B. Open the popup on the map automatically
        mapMarker.openPopup();

        // C. Highlight this item in the sidebar (and un-highlight others)
        var allItems = document.querySelectorAll('.marina-list li');
        for (var j = 0; j < allItems.length; j++) {
            allItems[j].classList.remove('active');
        }
        item.classList.add('active');
        
        // Update total engine recalculations just in case location specific fees were added
        if(typeof calculateTotal === 'function') { calculateTotal(); }
    };
}
