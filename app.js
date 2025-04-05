// Global variables
let currentUser = null;
let scanHistory = JSON.parse(localStorage.getItem('scanHistory')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    if (document.getElementById('loginForm')) {
        initLoginPage();
    } else if (document.getElementById('imageInput')) {
        initDashboardPage();
    } else if (document.getElementById('historyList')) {
        initHistoryPage();
    }
});

// Login Page Functions
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simple validation
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }
        
        // Mock authentication
        currentUser = {
            email: email,
            token: 'mock-auth-token-' + Date.now()
        };
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    });
}

// Dashboard Page Functions
function initDashboardPage() {
    const dropzone = document.getElementById('dropzone');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const preview = document.getElementById('preview');
    const removeImage = document.getElementById('removeImage');
    const submitBtn = document.getElementById('submitBtn');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const resultDetails = document.getElementById('resultDetails');

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropzone.classList.add('active');
    }

    function unhighlight() {
        dropzone.classList.remove('active');
    }

    dropzone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    imageInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    previewContainer.classList.remove('hidden');
                    submitBtn.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            } else {
                alert('Please select an image file');
            }
        }
    }

    removeImage.addEventListener('click', function() {
        imageInput.value = '';
        preview.src = '';
        previewContainer.classList.add('hidden');
        submitBtn.classList.add('hidden');
        results.classList.add('hidden');
    });

    submitBtn.addEventListener('click', function() {
        if (!imageInput.files[0]) {
            alert('Please select an image first');
            return;
        }

        // Show loading state
        results.classList.remove('hidden');
        loading.classList.remove('hidden');
        resultDetails.innerHTML = '';

        // Mock API call with timeout
        setTimeout(function() {
            loading.classList.add('hidden');
            
            // Mock response data
            const isFake = Math.random() > 0.7; // 30% chance of being fake
            const response = isFake ? 
                {
                    status: 'Fake Vehicle',
                    details: 'This vehicle appears to have a counterfeit number plate'
                } : 
                {
                    status: 'Genuine Vehicle',
                    vehicle: {
                        registration_no: 'DL' + Math.floor(1000 + Math.random() * 9000),
                        color: ['Red', 'Blue', 'White', 'Black', 'Silver'][Math.floor(Math.random() * 5)],
                        maker: ['Maruti', 'Hyundai', 'Tata', 'Mahindra', 'Honda'][Math.floor(Math.random() * 5)],
                        maker_model: ['Swift', 'Creta', 'Nexon', 'XUV700', 'City'][Math.floor(Math.random() * 5)],
                        vehicle_category: ['Hatchback', 'SUV', 'Sedan', 'MPV', 'Coupe'][Math.floor(Math.random() * 5)],
                        registration_date: new Date(Date.now() - Math.floor(Math.random() * 5 * 365 * 24 * 60 * 60 * 1000)).toLocaleDateString()
                    }
                };

            // Display results
            displayResults(response);

            // Save to history
            saveToHistory(response, preview.src);
        }, 2000);
    });

    function displayResults(data) {
        let html = '';
        
        if (data.status === 'Fake Vehicle') {
            html = `
                <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800">${data.status}</h3>
                            <div class="mt-2 text-sm text-red-700">
                                <p>${data.details}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html = `
                <div class="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <i class="fas fa-check-circle text-green-500"></i>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-green-800">${data.status}</h3>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Registration No</p>
                        <p class="font-medium">${data.vehicle.registration_no}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Color</p>
                        <p class="font-medium">${data.vehicle.color}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Maker</p>
                        <p class="font-medium">${data.vehicle.maker}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Model</p>
                        <p class="font-medium">${data.vehicle.maker_model}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Category</p>
                        <p class="font-medium">${data.vehicle.vehicle_category}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Registration Date</p>
                        <p class="font-medium">${data.vehicle.registration_date}</p>
                    </div>
                </div>
            `;
        }
        
        resultDetails.innerHTML = html;
    }

    function saveToHistory(data, imageSrc) {
        const scan = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            imagePreview: imageSrc,
            result: data,
            isFake: data.status === 'Fake Vehicle'
        };
        
        scanHistory.unshift(scan);
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
    }
}

// History Page Functions
function initHistoryPage() {
    const historyList = document.getElementById('historyList');
    const emptyState = document.getElementById('emptyState');
    const filter = document.getElementById('filter');

    function renderHistory(filterValue = 'all') {
        let filteredHistory = scanHistory;
        
        if (filterValue === 'fake') {
            filteredHistory = scanHistory.filter(scan => scan.isFake);
        } else if (filterValue === 'genuine') {
            filteredHistory = scanHistory.filter(scan => !scan.isFake);
        }
        
        if (filteredHistory.length === 0) {
            emptyState.classList.remove('hidden');
            historyList.innerHTML = '';
            historyList.appendChild(emptyState);
            return;
        }
        
        emptyState.classList.add('hidden');
        historyList.innerHTML = '';
        
        filteredHistory.forEach(scan => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg overflow-hidden shadow-md history-card';
            card.innerHTML = `
                <img src="${scan.imagePreview}" class="w-full h-48 object-cover" alt="Vehicle scan" />
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-medium text-gray-900">${scan.result.status}</h3>
                        <span class="text-xs text-gray-500">${scan.timestamp}</span>
                    </div>
                    ${scan.isFake ? 
                        `<p class="text-sm text-red-600"><i class="fas fa-exclamation-circle mr-1"></i> ${scan.result.details}</p>` : 
                        `<p class="text-sm text-gray-600"><i class="fas fa-car mr-1"></i> ${scan.result.vehicle.registration_no}</p>
                         <p class="text-sm text-gray-600"><i class="fas fa-palette mr-1"></i> ${scan.result.vehicle.color}</p>`
                    }
                </div>
            `;
            historyList.appendChild(card);
        });
    }
    
    filter.addEventListener('change', function() {
        renderHistory(this.value);
    });
    
    // Initial render
    renderHistory();
}