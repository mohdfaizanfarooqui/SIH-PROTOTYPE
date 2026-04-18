console.log('HMPI Application main.js loaded successfully!');

async function runDiseaseAnalysis() {
    if (!validateFormData()) return;
    
    const metals = [
        parseFloat(document.getElementById('lead').value) || 0,
        parseFloat(document.getElementById('mercury').value) || 0,
        parseFloat(document.getElementById('cadmium').value) || 0,
        parseFloat(document.getElementById('arsenic').value) || 0,
        parseFloat(document.getElementById('chromium').value) || 0,
        parseFloat(document.getElementById('copper').value) || 0,
        parseFloat(document.getElementById('zinc').value) || 0,
        parseFloat(document.getElementById('nickel').value) || 0
    ];
    
    try {
        showNotification('Running ML disease prediction analysis...', 'info');
        
        let predictions;
        if (typeof diseasePredictor !== 'undefined') {
            predictions = await diseasePredictor.predictDiseaseRisk(metals);
        } else {
            predictions = await fallbackDiseasePredictor(metals);
        }
        
        displayDiseaseResults(predictions, metals);
        showNotification('Disease risk analysis completed successfully!', 'success');
        
    } catch (error) {
        console.error('Error in disease analysis:', error);
        showNotification('Error in disease analysis. Using fallback method.', 'error');
        const fallbackPredictions = await fallbackDiseasePredictor(metals);
        displayDiseaseResults(fallbackPredictions, metals);
    }
}

async function fallbackDiseasePredictor(metalConcentrations) {
    const diseases = [
        'Neurological Disorders',
        'Kidney Disease', 
        'Cardiovascular Disease',
        'Respiratory Issues',
        'Gastrointestinal Problems',
        'Skin Disorders',
        'Cancer Risk',
        'Bone Disease'
    ];
    
    const limits = [0.01, 0.006, 0.003, 0.01, 0.05, 2.0, 3.0, 0.07];
    const normalized = metalConcentrations.map((conc, i) => conc / limits[i]);
    
    return diseases.map((disease) => {
        let probability;
        switch(disease) {
            case 'Neurological Disorders':
                probability = Math.min(95, (normalized[0] * 40 + normalized[1] * 50) + Math.random() * 10);
                break;
            case 'Kidney Disease':
                probability = Math.min(95, (normalized[2] * 40 + normalized[0] * 30 + normalized[1] * 20) + Math.random() * 10);
                break;
            case 'Cardiovascular Disease':
                probability = Math.min(95, (normalized[0] * 30 + normalized[3] * 40) + Math.random() * 30);
                break;
            case 'Respiratory Issues':
                probability = Math.min(95, (normalized[4] * 40 + normalized[7] * 30) + Math.random() * 30);
                break;
            case 'Gastrointestinal Problems':
                probability = Math.min(95, (normalized[5] * 30 + normalized[6] * 20) + Math.random() * 50);
                break;
            case 'Skin Disorders':
                probability = Math.min(95, (normalized[3] * 30 + normalized[4] * 20 + normalized[7] * 30) + Math.random() * 20);
                break;
            case 'Cancer Risk':
                probability = Math.min(95, (normalized[3] * 40 + normalized[2] * 30 + normalized[4] * 20) + Math.random() * 10);
                break;
            case 'Bone Disease':
                probability = Math.min(95, (normalized[2] * 40 + normalized[0] * 30) + Math.random() * 30);
                break;
            default:
                probability = Math.random() * 30;
        }
        
        probability = Math.max(1, probability);
        
        return {
            disease,
            probability: Math.round(probability),
            riskLevel: getRiskLevel(probability),
            recommendations: getDiseaseRecommendations(disease, probability)
        };
    });
}

function getRiskLevel(probability) {
    if (probability < 20) return { level: 'Low', class: 'status-excellent' };
    if (probability < 40) return { level: 'Moderate', class: 'status-good' };
    if (probability < 60) return { level: 'High', class: 'status-poor' };
    return { level: 'Critical', class: 'status-very-poor' };
}

function getDiseaseRecommendations(disease, probability) {
    const recommendations = {
        'Neurological Disorders': [
            'Regular neurological check-ups',
            'Cognitive function monitoring',
            'Limit exposure to lead and mercury sources'
        ],
        'Kidney Disease': [
            'Regular kidney function tests',
            'Monitor blood pressure',
            'Stay hydrated'
        ],
        'Cardiovascular Disease': [
            'Regular cardiac check-ups',
            'Blood pressure monitoring',
            'Exercise and healthy diet'
        ],
        'Respiratory Issues': [
            'Pulmonary function tests',
            'Avoid dust and chemical exposure',
            'Use protective equipment'
        ],
        'Gastrointestinal Problems': [
            'Regular digestive health monitoring',
            'Balanced diet with adequate fiber',
            'Monitor copper and zinc intake'
        ],
        'Skin Disorders': [
            'Regular dermatological examinations',
            'Skin cancer screenings',
            'Use protective clothing'
        ],
        'Cancer Risk': [
            'Regular cancer screenings',
            'Avoid tobacco and excessive alcohol',
            'Maintain healthy lifestyle'
        ],
        'Bone Disease': [
            'Bone density tests',
            'Adequate calcium and vitamin D intake',
            'Weight-bearing exercises'
        ]
    };
    
    const baseRecommendations = recommendations[disease] || [];
    
    if (probability > 60) {
        return [...baseRecommendations, 'URGENT: Consult healthcare provider immediately'];
    } else if (probability > 40) {
        return [...baseRecommendations, 'Schedule medical consultation within 30 days'];
    }
    
    return baseRecommendations;
}

let map;
let markers = [];
let waterQualityData = [];
let chartInstances = {};

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeEventListeners();
    initializeCharts();
    initializeMLModel();
    document.getElementById('sample-date').valueAsDate = new Date();
});

function initializeMLModel() {
    const statusElement = document.getElementById('ml-status');
    const predictButton = document.getElementById('predict-btn');
    
    if (typeof tf === 'undefined') {
        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> TensorFlow.js not loaded. Using fallback prediction method.';
        statusElement.className = 'alert alert-error';
        predictButton.disabled = false;
        return;
    }
    
    setTimeout(() => {
        if (typeof diseasePredictor !== 'undefined' && diseasePredictor.isModelLoaded) {
            statusElement.innerHTML = '<i class="fas fa-check-circle"></i> ML Model loaded successfully. Ready for disease prediction.';
            statusElement.className = 'alert alert-success';
            predictButton.disabled = false;
        } else {
            statusElement.innerHTML = '<i class="fas fa-info-circle"></i> Model loading... Using rule-based prediction method.';
            statusElement.className = 'alert alert-info';
            predictButton.disabled = false;
        }
    }, 3000);
}

console.log('HMPI Application main.js loaded successfully!');
