function validateFormData() {
    const location = document.getElementById('location-name').value.trim();
    const lat = document.getElementById('latitude').value;
    const lng = document.getElementById('longitude').value;
    
    if (!location) {
        showNotification('Please enter a location name', 'error');
        return false;
    }
    
    if (!lat || !lng) {
        showNotification('Please provide latitude and longitude coordinates', 'error');
        return false;
    }
    
    const metals = ['lead', 'mercury', 'cadmium', 'arsenic', 'chromium', 'copper', 'zinc', 'nickel'];
    const hasData = metals.some(metal => {
        const value = parseFloat(document.getElementById(metal).value);
        return !isNaN(value) && value > 0;
    });
    
    if (!hasData) {
        showNotification('Please enter at least one metal concentration', 'error');
        return false;
    }
    
    return true;
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.alert').forEach(alert => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    });
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        ${message}
        <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit;">×</button>
    `;
    
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(notification, activeTab.firstChild);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

function formatNumber(value, decimals = 2) {
    return parseFloat(value).toFixed(decimals);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function escapeCSV(value) {
    if (typeof value !== 'string') return value;
    if (value.includes('"') || value.includes(',') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function saveDataToLocal() {
    try {
        localStorage.setItem('hmpi-data', JSON.stringify(waterQualityData));
        return true;
    } catch (e) {
        console.warn('Local storage not available');
        return false;
    }
}

function loadDataFromLocal() {
    try {
        const saved = localStorage.getItem('hmpi-data');
        if (saved) {
            waterQualityData = JSON.parse(saved);
            updateMapMarkers();
            updateLeaderboards();
            updateLocationTable();
            return true;
        }
    } catch (e) {
        console.warn('Error loading from local storage');
    }
    return false;
}

function calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}

function calculateStandardDeviation(values) {
    const avg = calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

function getColorForPollutionLevel(hpi) {
    if (hpi < 15) return '#2ecc71';
    if (hpi < 30) return '#f39c12';
    if (hpi < 45) return '#e67e22';
    return '#e74c3c';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
