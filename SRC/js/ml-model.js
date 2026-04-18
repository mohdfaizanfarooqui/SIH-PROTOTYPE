class DiseasePredictor {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.diseases = [
            'Neurological Disorders',
            'Kidney Disease', 
            'Cardiovascular Disease',
            'Respiratory Issues',
            'Gastrointestinal Problems',
            'Skin Disorders',
            'Cancer Risk',
            'Bone Disease'
        ];
        
        this.trainingData = this.generateTrainingData();
        this.initializeModel();
    }

    generateTrainingData() {
        const data = [];
        
        for (let i = 0; i < 1000; i++) {
            const sample = {
                features: [
                    Math.random() * 0.1,
                    Math.random() * 0.02,
                    Math.random() * 0.01,
                    Math.random() * 0.05,
                    Math.random() * 0.2,
                    Math.random() * 5.0,
                    Math.random() * 10.0,
                    Math.random() * 0.3
                ],
                labels: []
            };
            
            sample.labels = this.calculateDiseaseRisks(sample.features);
            data.push(sample);
        }
        
        return data;
    }

    calculateDiseaseRisks(metalConcentrations) {
        const limits = [0.01, 0.006, 0.003, 0.01, 0.05, 2.0, 3.0, 0.07];
        const normalized = metalConcentrations.map((conc, i) => conc / limits[i]);
        
        const risks = [
            Math.min(0.95, (normalized[0] * 0.4 + normalized[1] * 0.5 + Math.random() * 0.1)),
            Math.min(0.95, (normalized[2] * 0.4 + normalized[0] * 0.3 + normalized[1] * 0.2 + Math.random() * 0.1)),
            Math.min(0.95, (normalized[0] * 0.3 + normalized[3] * 0.4 + Math.random() * 0.3)),
            Math.min(0.95, (normalized[4] * 0.4 + normalized[7] * 0.3 + Math.random() * 0.3)),
            Math.min(0.95, (normalized[5] * 0.3 + normalized[6] * 0.2 + Math.random() * 0.5)),
            Math.min(0.95, (normalized[3] * 0.3 + normalized[4] * 0.2 + normalized[7] * 0.3 + Math.random() * 0.2)),
            Math.min(0.95, (normalized[3] * 0.4 + normalized[2] * 0.3 + normalized[4] * 0.2 + Math.random() * 0.1)),
            Math.min(0.95, (normalized[2] * 0.4 + normalized[0] * 0.3 + Math.random() * 0.3))
        ];
        
        return risks.map(risk => Math.max(0.01, risk));
    }

    async initializeModel() {
        try {
            this.model = tf.sequential({
                layers: [
                    tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
                    tf.layers.dropout({rate: 0.3}),
                    tf.layers.dense({ units: 16, activation: 'relu' }),
                    tf.layers.dropout({rate: 0.2}),
                    tf.layers.dense({ units: 8, activation: 'sigmoid' })
                ]
            });

            this.model.compile({
                optimizer: tf.train.adam(0.001),
                loss: 'binaryCrossentropy',
                metrics: ['accuracy']
            });

            await this.trainModel();
            this.isModelLoaded = true;
            console.log('Disease prediction model loaded successfully');
            
        } catch (error) {
            console.error('Error initializing ML model:', error);
            this.isModelLoaded = false;
        }
    }

    async trainModel() {
        try {
            const features = this.trainingData.map(d => d.features);
            const labels = this.trainingData.map(d => d.labels);
            
            const xs = tf.tensor2d(features);
            const ys = tf.tensor2d(labels);
            
            await this.model.fit(xs, ys, {
                epochs: 50,
                batchSize: 32,
                validationSplit: 0.2,
                verbose: 0
            });
            
            xs.dispose();
            ys.dispose();
            
            console.log('Model training completed');
            
        } catch (error) {
            console.error('Error training model:', error);
        }
    }

    async predictDiseaseRisk(metalConcentrations) {
        if (!this.isModelLoaded || !this.model) {
            return this.fallbackPrediction(metalConcentrations);
        }
        
        try {
            const limits = [0.01, 0.006, 0.003, 0.01, 0.05, 2.0, 3.0, 0.07];
            const normalizedInputs = metalConcentrations.map((conc, i) => 
                Math.min(conc / limits[i], 10)
            );
            
            const inputTensor = tf.tensor2d([normalizedInputs]);
            const predictions = this.model.predict(inputTensor);
            const predictionData = await predictions.data();
            
            inputTensor.dispose();
            predictions.dispose();
            
            return this.diseases.map((disease, index) => ({
                disease,
                probability: Math.round(predictionData[index] * 100),
                riskLevel: this.getRiskLevel(predictionData[index] * 100),
                recommendations: this.getRecommendations(disease, predictionData[index] * 100)
            }));
            
        } catch (error) {
            console.error('Error making prediction:', error);
            return this.fallbackPrediction(metalConcentrations);
        }
    }

    fallbackPrediction(metalConcentrations) {
        const risks = this.calculateDiseaseRisks(metalConcentrations);
        
        return this.diseases.map((disease, index) => ({
            disease,
            probability: Math.round(risks[index] * 100),
            riskLevel: this.getRiskLevel(risks[index] * 100),
            recommendations: this.getRecommendations(disease, risks[index] * 100)
        }));
    }

    getRiskLevel(probability) {
        if (probability < 20) return { level: 'Low', class: 'status-excellent' };
        if (probability < 40) return { level: 'Moderate', class: 'status-good' };
        if (probability < 60) return { level: 'High', class: 'status-poor' };
        return { level: 'Critical', class: 'status-very-poor' };
    }

    getRecommendations(disease, probability) {
        const recommendations = {
            'Neurological Disorders': [
                'Regular neurological check-ups',
                'Cognitive function monitoring',
                'Limit exposure to lead and mercury sources',
                'Consider chelation therapy if levels are extremely high'
            ],
            'Kidney Disease': [
                'Regular kidney function tests (creatinine, BUN)',
                'Monitor blood pressure',
                'Stay hydrated',
                'Reduce cadmium exposure from smoking/industrial sources'
            ],
            'Cardiovascular Disease': [
                'Regular cardiac check-ups',
                'Blood pressure monitoring',
                'Cholesterol level checks',
                'Exercise and healthy diet'
            ],
            'Respiratory Issues': [
                'Pulmonary function tests',
                'Avoid dust and chemical exposure',
                'Use protective equipment in industrial settings',
                'Regular chest X-rays if high exposure'
            ],
            'Gastrointestinal Problems': [
                'Regular digestive health monitoring',
                'Balanced diet with adequate fiber',
                'Monitor copper and zinc intake',
                'Consult gastroenterologist if symptoms persist'
            ],
            'Skin Disorders': [
                'Regular dermatological examinations',
                'Skin cancer screenings',
                'Use protective clothing and sunscreen',
                'Avoid direct contact with contaminated water'
            ],
            'Cancer Risk': [
                'Regular cancer screenings',
                'Avoid tobacco and excessive alcohol',
                'Maintain healthy lifestyle',
                'Genetic counseling if family history exists'
            ],
            'Bone Disease': [
                'Bone density tests',
                'Adequate calcium and vitamin D intake',
                'Weight-bearing exercises',
                'Limit cadmium exposure'
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

    generateHealthReport(metalConcentrations, predictions) {
        const overallRisk = Math.round(
            predictions.reduce((sum, pred) => sum + pred.probability, 0) / predictions.length
        );
        
        const highestRisks = predictions
            .filter(pred => pred.probability > 30)
            .sort((a, b) => b.probability - a.probability)
            .slice(0, 3);

        return {
            overallRisk,
            overallRiskLevel: this.getRiskLevel(overallRisk),
            highestRisks,
            criticalMetals: this.identifyCriticalMetals(metalConcentrations),
            urgentActions: this.getUrgentActions(predictions),
            followUpSchedule: this.getFollowUpSchedule(overallRisk)
        };
    }

    identifyCriticalMetals(metalConcentrations) {
        const limits = [0.01, 0.006, 0.003, 0.01, 0.05, 2.0, 3.0, 0.07];
        const metalNames = ['Lead', 'Mercury', 'Cadmium', 'Arsenic', 'Chromium', 'Copper', 'Zinc', 'Nickel'];
        
        return metalConcentrations
            .map((conc, i) => ({
                metal: metalNames[i],
                concentration: conc,
                limit: limits[i],
                exceedance: (conc / limits[i] * 100).toFixed(1)
            }))
            .filter(metal => metal.concentration > metal.limit);
    }

    getUrgentActions(predictions) {
        const criticalPredictions = predictions.filter(pred => pred.probability > 60);
        
        if (criticalPredictions.length > 0) {
            return [
                'Seek immediate medical attention',
                'Stop exposure to contaminated water source',
                'Collect water samples for laboratory analysis',
                'Contact local health authorities',
                'Document symptoms if any'
            ];
        } else if (predictions.some(pred => pred.probability > 40)) {
            return [
                'Schedule medical consultation within 2 weeks',
                'Monitor for symptoms',
                'Consider alternative water sources',
                'Regular health monitoring'
            ];
        }
        
        return [
            'Continue regular health check-ups',
            'Monitor water quality periodically',
            'Maintain healthy lifestyle'
        ];
    }

    getFollowUpSchedule(overallRisk) {
        if (overallRisk > 60) {
            return {
                immediate: 'Within 1 week',
                shortTerm: 'Monthly for 6 months',
                longTerm: 'Quarterly thereafter'
            };
        } else if (overallRisk > 40) {
            return {
                immediate: 'Within 1 month',
                shortTerm: 'Every 3 months',
                longTerm: 'Bi-annually'
            };
        }
        
        return {
            immediate: 'Within 3 months',
            shortTerm: 'Every 6 months',
            longTerm: 'Annually'
        };
    }
}

let diseasePredictor;

document.addEventListener('DOMContentLoaded', function() {
    if (typeof tf !== 'undefined') {
        diseasePredictor = new DiseasePredictor();
    } else {
        console.warn('TensorFlow.js not loaded. Disease prediction will use fallback method.');
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiseasePredictor;
}
