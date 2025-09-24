// Dashboard JavaScript for NutriEmpower

class NutriDashboard {
    constructor() {
        this.currentDate = new Date();
        this.weightData = [];
        this.mealData = [];
        this.init();
    }
    
    init() {
        this.initProgressRings();
        this.initWeightChart();
        this.initCalendar();
        this.initQuickActions();
        this.loadMockData();
        this.bindEvents();
    }
    
    bindEvents() {
        // Calendar navigation
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => this.previousMonth());
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => this.nextMonth());
        }
        
        // Quick action buttons
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e));
        });
    }
    
    initProgressRings() {
        const progressRings = document.querySelectorAll('.ring-progress');
        
        progressRings.forEach(ring => {
            const progress = parseInt(ring.getAttribute('data-progress'));
            const circumference = 2 * Math.PI * 50; // r = 50
            
            ring.style.strokeDasharray = circumference;
            ring.style.strokeDashoffset = circumference - (progress / 100) * circumference;
            
            // Animate progress on scroll into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateProgressRing(ring, progress, circumference);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(ring);
        });
    }
    
    animateProgressRing(ring, targetProgress, circumference) {
        let currentProgress = 0;
        const increment = targetProgress / 60; // 60 frames for smooth animation
        
        const animate = () => {
            currentProgress += increment;
            if (currentProgress >= targetProgress) {
                currentProgress = targetProgress;
            }
            
            const offset = circumference - (currentProgress / 100) * circumference;
            ring.style.strokeDashoffset = offset;
            
            // Update the displayed value
            const valueElement = ring.parentElement.querySelector('.ring-value');
            if (valueElement) {
                valueElement.textContent = `${Math.floor(currentProgress)}%`;
            }
            
            if (currentProgress < targetProgress) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    initWeightChart() {
        const canvas = document.getElementById('weight-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Create a simple line chart
        this.drawWeightChart(ctx);
    }
    
    drawWeightChart(ctx) {
        const width = canvas.width;
        const height = canvas.height;
        const padding = 20;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (this.weightData.length < 2) return;
        
        // Find min and max values
        const weights = this.weightData.map(d => d.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const weightRange = maxWeight - minWeight;
        
        // Calculate scales
        const xScale = (width - 2 * padding) / (this.weightData.length - 1);
        const yScale = (height - 2 * padding) / weightRange;
        
        // Draw grid lines
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 1;
        
        // Vertical grid lines
        for (let i = 0; i < this.weightData.length; i++) {
            const x = padding + i * xScale;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * (height - 2 * padding);
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw weight line
        ctx.strokeStyle = '#27AE60';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        this.weightData.forEach((dataPoint, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (dataPoint.weight - minWeight) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#27AE60';
        this.weightData.forEach((dataPoint, index) => {
            const x = padding + index * xScale;
            const y = height - padding - (dataPoint.weight - minWeight) * yScale;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Roboto';
        ctx.textAlign = 'center';
        
        // X-axis labels (dates)
        this.weightData.forEach((dataPoint, index) => {
            const x = padding + index * xScale;
            const y = height - padding + 15;
            const date = new Date(dataPoint.date);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(label, x, y);
        });
        
        // Y-axis labels (weights)
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * (height - 2 * padding);
            const weight = maxWeight - (i / gridLines) * weightRange;
            ctx.textAlign = 'right';
            ctx.fillText(`${weight.toFixed(1)} lbs`, padding - 5, y + 4);
        }
    }
    
    initCalendar() {
        this.renderCalendar();
    }
    
    renderCalendar() {
        const currentMonthElement = document.getElementById('current-month');
        const calendarGrid = document.getElementById('calendar-grid');
        
        if (!currentMonthElement || !calendarGrid) return;
        
        // Update month display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        currentMonthElement.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Clear calendar grid
        calendarGrid.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and number of days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Fill calendar with days
        for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Check if it's today
            const today = new Date();
            if (currentDate.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            // Check if it's in current month
            if (currentDate.getMonth() !== this.currentDate.getMonth()) {
                dayElement.style.color = '#ccc';
            }
            
            // Check if it has meal data
            if (this.hasMealData(currentDate)) {
                dayElement.classList.add('has-meal');
            }
            
            // Add click event for meal planning
            dayElement.addEventListener('click', () => this.openMealPlanner(currentDate));
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    hasMealData(date) {
        return this.mealData.some(meal => {
            const mealDate = new Date(meal.date);
            return mealDate.toDateString() === date.toDateString();
        });
    }
    
    openMealPlanner(date) {
        // Placeholder for meal planner modal
        console.log(`Opening meal planner for ${date.toDateString()}`);
        
        // In a real implementation, this would:
        // 1. Open a modal with meal planning interface
        // 2. Show existing meals for the selected date
        // 3. Allow adding/editing meals
        // 4. Integrate with recipe suggestions
        
        alert(`Meal planner for ${date.toLocaleDateString()} will be implemented with full backend integration.`);
    }
    
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }
    
    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }
    
    initQuickActions() {
        // Initialize quick action functionality
        console.log('Quick actions initialized');
    }
    
    handleQuickAction(event) {
        const action = event.currentTarget.textContent.trim();
        
        switch (action) {
            case 'Log Meal':
                this.openMealLogger();
                break;
            case 'Track Water':
                this.openWaterTracker();
                break;
            case 'Log Exercise':
                this.openExerciseLogger();
                break;
            case 'Update Weight':
                this.openWeightLogger();
                break;
            default:
                console.log(`Action: ${action}`);
        }
    }
    
    openMealLogger() {
        // Placeholder for meal logging modal
        console.log('Opening meal logger');
        
        // In a real implementation, this would:
        // 1. Open a modal with meal logging form
        // 2. Allow users to search and select foods
        // 3. Calculate nutritional information
        // 4. Save to user's daily log
        
        alert('Meal logging functionality will be implemented with full backend integration and food database.');
    }
    
    openWaterTracker() {
        // Placeholder for water tracking
        console.log('Opening water tracker');
        
        // In a real implementation, this would:
        // 1. Show current water intake for the day
        // 2. Allow adding water consumption
        // 3. Show progress toward daily goal
        // 4. Send reminders if needed
        
        alert('Water tracking functionality will be implemented with full backend integration.');
    }
    
    openExerciseLogger() {
        // Placeholder for exercise logging
        console.log('Opening exercise logger');
        
        // In a real implementation, this would:
        // 1. Allow users to log different types of exercise
        // 2. Track duration and intensity
        // 3. Calculate calories burned
        // 4. Show exercise history and trends
        
        alert('Exercise logging functionality will be implemented with full backend integration.');
    }
    
    openWeightLogger() {
        // Placeholder for weight logging
        console.log('Opening weight logger');
        
        // In a real implementation, this would:
        // 1. Show current weight and goal
        // 2. Allow entering new weight
        // 3. Show weight trends over time
        // 4. Provide insights and recommendations
        
        alert('Weight logging functionality will be implemented with full backend integration.');
    }
    
    loadMockData() {
        // Load mock weight data for demonstration
        const today = new Date();
        this.weightData = [
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30), weight: 170 },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 23), weight: 168 },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 16), weight: 167 },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 9), weight: 166 },
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2), weight: 165 },
            { date: today, weight: 165 }
        ];
        
        // Load mock meal data
        this.mealData = [
            { date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), meals: ['Breakfast', 'Lunch'] },
            { date: today, meals: ['Breakfast'] }
        ];
        
        // Update weight chart after data is loaded
        setTimeout(() => {
            const canvas = document.getElementById('weight-chart');
            if (canvas) {
                this.drawWeightChart(canvas.getContext('2d'));
            }
        }, 100);
    }
    
    updateProgressRings() {
        // Update progress rings with real data
        // This would be called when new data is available
        console.log('Updating progress rings');
    }
    
    refreshDashboard() {
        // Refresh all dashboard data
        this.loadMockData();
        this.updateProgressRings();
        this.renderCalendar();
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nutriDashboard = new NutriDashboard();
});

// Export for use in other modules
window.NutriDashboard = NutriDashboard;