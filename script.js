let kasidas = []; // Holds kasidas from the JSON file
let filterableKeys = {}; // To store which keys have filterby set to true

// Load kasidas from JSON file
fetch('kasidas.json')
    .then(response => response.json())
    .then(data => {
        // Shuffle the kasidas array randomly
        kasidas = shuffleArray(data);

        // Check if this is the kasida detail page or the list page
        const urlParams = new URLSearchParams(window.location.search);
        const kasidaId = urlParams.get('id');

        if (kasidaId) {
            // We are on the kasida details page
            loadKasidaDetails(kasidaId);
        } else {
            // We are on the kasida list page
            const filterButton = document.getElementById('filterButton');
            const filterSection = document.getElementById('filter-section');

            filterButton.addEventListener('click', function () {
                // Toggle the visibility of the filter section with fade effect
                if (filterSection.classList.contains('show')) {
                    filterSection.classList.remove('show'); // Hide with fade-out
                    setTimeout(() => {
                        filterSection.style.display = 'none'; // Set display to none after fade-out
                    }, 100); // Match the timeout with the CSS transition duration
                } else {
                    filterSection.style.display = 'block'; // Show immediately
                    setTimeout(() => {
                        filterSection.classList.add('show'); // Fade in
                    }, 10); // Slight delay to ensure the display change is registered
                }
            });

            document.getElementById('searchInput').addEventListener('input', function () {
                const searchQuery = this.value.toLowerCase();
                const kasidas = document.querySelectorAll('.kasida-card');

                kasidas.forEach(kasida => {
                    const kasidaText = kasida.textContent.toLowerCase();
                    kasida.style.display = kasidaText.includes(searchQuery) ? '' : 'none';
                });
            });

            identifyFilterableKeys(kasidas); // Find which keys have filterby: true
            displayKasidas(kasidas);
            populateFilters(kasidas); // Fill the filter options dynamically based on the filterby flag
        }
    });

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

// Ensure filter section is hidden initially
document.addEventListener("DOMContentLoaded", function () {
    const filterSection = document.getElementById('filter-section');
    filterSection.style.display = 'none'; // Hide filter section initially
});



// Identify filterable keys in the kasida data
function identifyFilterableKeys(kasidas) {
    kasidas.forEach(kasida => {
        Object.keys(kasida).forEach(key => {
            if (kasida[key].filterby) {
                if (!filterableKeys[key]) {
                    filterableKeys[key] = new Set(); // Use Set to avoid duplicates
                }
                // Add the value to the filterable set or "undefined" if missing
                filterableKeys[key].add(kasida[key].value || 'undefined');
            }
        });
    });

    // Check for missing keys in some kasidas and add 'undefined' as a filter option
    kasidas.forEach(kasida => {
        Object.keys(filterableKeys).forEach(key => {
            if (!kasida[key] || kasida[key].value === undefined) {
                filterableKeys[key].add('undefined');
            }
        });
    });
}

// Display kasidas on the page
function displayKasidas(kasidasToDisplay) {
    const kasidaList = document.getElementById('kasida-list');
    kasidaList.innerHTML = ''; // Clear existing kasidas
    kasidasToDisplay.forEach(kasida => {
        const kasidaCard = document.createElement('div');
        kasidaCard.classList.add('kasida-card');
        kasidaCard.innerHTML = `
            <img src="${kasida.thumbnail?.value || 'path/to/default-thumbnail.jpg'}" alt="Thumbnail">
            <h3>${kasida.name.value}</h3>
            <p>الكاتب: ${kasida.author?.value || 'غير معروف'}</p>
            <p>تاريخ النشر: ${kasida.publishDate?.value || 'غير معروف'}</p>
            <a href="kasida.html?id=${kasida.id}">رأيت التفاصيل</a>
        `;
        kasidaList.appendChild(kasidaCard);
    });
}

// Populate the filter dropdowns dynamically based on filterable keys
function populateFilters(kasidas) {
    const filterSection = document.getElementById('filter-section');

    // Clear existing filter options
    filterSection.innerHTML = '<h3>التصفية حسب</h3>'; // Reset header

    const filterCard = document.createElement('div');
    filterCard.className = 'filter-card'; // Add class for styling

    Object.keys(filterableKeys).forEach(key => {
        const filterDiv = document.createElement('div');
        filterDiv.className = 'filter-option'; // Add class for styling

        const label = document.createElement('label');
        label.textContent = `${capitalizeFirstLetter(key)}:`;

        const select = document.createElement('select');
        select.id = `${key}-filter`;

        // Add default "All" option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'اختر'; // Change to Arabic
        select.appendChild(defaultOption);

        // Populate select options based on the unique values for this key
        const uniqueValues = [...filterableKeys[key]]; // Use values directly from Set
        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        // Trigger filtering automatically when the selection changes
        select.onchange = applyFilters;

        filterDiv.appendChild(label);
        filterDiv.appendChild(select);
        filterCard.appendChild(filterDiv);
    });

    // Append the filter card to the filter section
    filterSection.appendChild(filterCard);
}

// Apply the filters
function applyFilters() {
    const filters = {}; // Store active filters

    // Loop through all filterable keys and store the selected values
    Object.keys(filterableKeys).forEach(key => {
        const selectedValue = document.getElementById(`${key}-filter`).value;
        if (selectedValue) { // Check if the selection is not empty
            filters[key] = selectedValue;
        }
    });

    // Filter the kasidas based on selected filter values
    const filteredKasidas = kasidas.filter(kasida => {
        return Object.keys(filters).every(key => {
            return (kasida[key] && kasida[key].value === filters[key]) || (!kasida[key] && filters[key] === 'undefined');
        });
    });

    displayKasidas(filteredKasidas);
}

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Search functionality
function searchKasidas(query) {
    const filteredKasidas = kasidas.filter(kasida => {
        return Object.keys(kasida).some(key => {
            if (kasida[key].filterby && kasida[key].value.toLowerCase().includes(query.toLowerCase())) {
                return true;
            }
            return false;
        });
    });
    displayKasidas(filteredKasidas);
}

function formatKasidaText(text) {
    // Replace \n\n with _, then \n with _
    text = text.replace(/\\n\\n/g, '_').replace(/\\n/g, '_');

    // Split the text by the symbol '_'
    const lines = text.split('_');

    // Initialize a variable to hold the formatted result
    let formattedText = '';

    // Iterate over the lines array in pairs (right text, left text)
    for (let i = 0; i < lines.length; i += 2) {
        const rightText = lines[i].trim();   // First text (right-align, Arabic)
        const leftText = (lines[i + 1] || '').trim(); // Second text (left-align), default empty if not available

        // Construct the HTML for each pair
        formattedText += `
            <div class="line">
            <span class="left-align">${leftText}</span>
            <span class="space">***</span>
            <span class="right-align">${rightText}</span>
            </div>
        `;
    }

    return formattedText;
}

function loadKasidaDetails(kasidaId) {
    const kasidaData = kasidas.find(k => k.id == kasidaId);

    if (kasidaData) {
        const thumbnailUrl = kasidaData.thumbnail.value || 'default-thumbnail.jpg';
        // document.getElementById('kasida-thumbnail').src = kasidaData.thumbnail.value || 'default-thumbnail.jpg';
        document.getElementById('kasida-title').innerText = kasidaData.name.value;
        const formattedLyrics = formatKasidaText(kasidaData.lyrics.value);
        document.getElementById('kasida-lyrics').innerHTML = formattedLyrics;
        document.getElementById('kasida-author').innerText = kasidaData.author.value || 'غير متوفر';
        document.getElementById('kasida-publish-date').innerText = kasidaData.publishDate.value || 'غير متوفر';

        // Update YouTube video URL
        if (kasidaData.youtubeLink.value) {
            const videoId = kasidaData.youtubeLink.value.split('v=')[1];
            document.getElementById('kasida-video').src = `https://www.youtube.com/embed/${videoId}`;
        }

        document.getElementById('blurred-background').style.backgroundImage = `url('${thumbnailUrl}')`;

        // Clear previous table rows
        const additionalDetailsTable = document.getElementById('additional-details');
        additionalDetailsTable.innerHTML = ''; // Clear existing rows

        // Define the special keys that are displayed on the page
        const specialKeys = ['id', 'name', 'thumbnail', 'lyrics', 'author', 'publishDate', 'youtubeLink'];

        // Track if any rows are added
        let rowsAdded = false;

        // Iterate through all keys in kasidaData and create table rows for non-special keys
        Object.keys(kasidaData).forEach(key => {
            const keyDetails = kasidaData[key];
            // Check if the key is not in specialKeys
            if (!specialKeys.includes(key)) {
                const row = document.createElement('tr');
                const keyCell = document.createElement('td');
                const valueCell = document.createElement('td');

                keyCell.innerText = capitalizeFirstLetter(key); // Key name
                valueCell.innerText = keyDetails.value || 'غير متوفر'; // Key value

                row.appendChild(keyCell);
                row.appendChild(valueCell);
                additionalDetailsTable.appendChild(row);

                // Indicate that a row has been added
                rowsAdded = true;
            }
        });

        // Set the visibility of the additional details section based on whether rows were added
        const additionalDetailsDiv = document.getElementById('additional-details-container');
        if (rowsAdded) {
            additionalDetailsDiv.style.display = 'block'; // Show if rows exist
        } else {
            additionalDetailsDiv.style.display = 'none'; // Hide if no rows
        }
    }
}

function goBack() {
    window.location.href = 'index.html'; // Adjust this URL based on your actual home page URL
}
