// AI Chat Interface JavaScript

class NutriAIChat {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadMockResponses();
        this.setupQuickPrompts();
    }
    
    bindEvents() {
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const aiChatLauncher = document.getElementById('ai-chat-launcher');
        const modal = document.getElementById('ai-chat-modal');
        const modalClose = document.getElementById('modal-close');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        if (aiChatLauncher) {
            aiChatLauncher.addEventListener('click', () => this.openChatModal());
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeChatModal());
        }
        
        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeChatModal();
                }
            });
        }
    }
    
    setupQuickPrompts() {
        const promptBtns = document.querySelectorAll('.prompt-btn');
        promptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.handleQuickPrompt(prompt);
            });
        });
    }
    
    handleQuickPrompt(prompt) {
        // Set the prompt in the input field
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = prompt;
            chatInput.focus();
        }
        
        // Automatically send the message
        this.sendMessage();
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response delay
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
    
    addMessage(content, sender) {
        const message = {
            id: Date.now(),
            content,
            sender,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        this.displayMessage(message);
        this.scrollToBottom();
        
        // Update session summary if it's an AI message
        if (sender === 'ai') {
            this.updateSessionSummary(content);
        }
    }
    
    displayMessage(message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender}-message`;
        messageElement.dataset.messageId = message.id;
        
        const avatar = message.sender === 'ai' ? 
            '<i class="fas fa-robot"></i>' : 
            '<i class="fas fa-user"></i>';
        
        const time = this.formatTime(message.timestamp);
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                ${this.formatMessageContent(message.content)}
            </div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Animate message appearance
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        }, 100);
    }
    
    formatMessageContent(content) {
        // Handle different types of content
        if (typeof content === 'string') {
            // Simple text message
            return `<p>${this.escapeHtml(content)}</p>`;
        } else if (content.type === 'nutrition_analysis') {
            // Nutrition analysis response
            return this.formatNutritionAnalysis(content);
        } else if (content.type === 'meal_plan') {
            // Meal plan response
            return this.formatMealPlan(content);
        } else if (content.type === 'myth_busting') {
            // Myth busting response
            return this.formatMythBusting(content);
        }
        
        return `<p>${this.escapeHtml(content)}</p>`;
    }
    
    formatNutritionAnalysis(analysis) {
        return `
            <div class="nutrition-analysis">
                <h4>Nutrition Analysis</h4>
                <div class="nutrition-metrics">
                    <div class="metric">
                        <span class="metric-label">Calories:</span>
                        <span class="metric-value">${analysis.calories}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Protein:</span>
                        <span class="metric-value">${analysis.protein}g</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Carbs:</span>
                        <span class="metric-value">${analysis.carbs}g</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Fat:</span>
                        <span class="metric-value">${analysis.fat}g</span>
                    </div>
                </div>
                <p class="analysis-summary">${analysis.summary}</p>
            </div>
        `;
    }
    
    formatMealPlan(plan) {
        return `
            <div class="meal-plan">
                <h4>Your Personalized Meal Plan</h4>
                <div class="meal-plan-items">
                    ${plan.meals.map(meal => `
                        <div class="meal-item">
                            <div class="meal-time">${meal.time}</div>
                            <div class="meal-name">${meal.name}</div>
                            <div class="meal-calories">${meal.calories} cal</div>
                        </div>
                    `).join('')}
                </div>
                <p class="plan-summary">${plan.summary}</p>
            </div>
        `;
    }
    
    formatMythBusting(myth) {
        return `
            <div class="myth-busting">
                <h4>Myth Busted!</h4>
                <div class="myth-content">
                    <div class="myth-claim">
                        <strong>Claim:</strong> ${myth.claim}
                    </div>
                    <div class="myth-fact">
                        <strong>Fact:</strong> ${myth.fact}
                    </div>
                    <div class="myth-evidence">
                        <strong>Evidence:</strong> ${myth.evidence}
                    </div>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        
        return timestamp.toLocaleDateString();
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    generateAIResponse(userMessage) {
        const response = this.getMockResponse(userMessage);
        this.addMessage(response, 'ai');
        
        // Update quick actions based on response type
        this.updateQuickActions(response);
    }
    
    getMockResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for specific keywords and provide relevant responses
        if (lowerMessage.includes('allergy') || lowerMessage.includes('nut')) {
            return {
                type: 'nutrition_analysis',
                calories: '1,200',
                protein: '45',
                carbs: '120',
                fat: '35',
                summary: 'Based on your nut allergy, I\'ve created a safe meal plan that avoids all tree nuts and peanuts while maintaining balanced nutrition. All recipes use safe alternatives like seeds, coconut, and soy products.'
            };
        } else if (lowerMessage.includes('budget') || lowerMessage.includes('$50')) {
            return {
                type: 'meal_plan',
                meals: [
                    { time: 'Breakfast', name: 'Oatmeal with Banana', calories: 250 },
                    { time: 'Lunch', name: 'Lentil Soup with Bread', calories: 300 },
                    { time: 'Dinner', name: 'Rice and Beans Bowl', calories: 400 },
                    { time: 'Snack', name: 'Apple with Peanut Butter', calories: 200 }
                ],
                summary: 'This budget-friendly meal plan costs approximately $45 per week and provides balanced nutrition with affordable ingredients like legumes, grains, and seasonal vegetables.'
            };
        } else if (lowerMessage.includes('weight') || lowerMessage.includes('lose')) {
            return {
                type: 'nutrition_analysis',
                calories: '1,500',
                protein: '120',
                carbs: '150',
                fat: '50',
                summary: 'For healthy weight loss, focus on high-protein foods, complex carbohydrates, and healthy fats. This plan creates a 500-calorie daily deficit while maintaining muscle mass and energy levels.'
            };
        } else if (lowerMessage.includes('myth') || lowerMessage.includes('carbs')) {
            return {
                type: 'myth_busting',
                claim: 'Carbohydrates are bad for you and cause weight gain',
                fact: 'Carbohydrates are essential macronutrients that provide energy and support brain function',
                evidence: 'Research shows that the quality and quantity of carbs matter more than avoiding them entirely. Whole grains, fruits, and vegetables are excellent sources of complex carbohydrates that support health.'
            };
        } else {
            // Generic helpful response
            return `Thank you for your question about "${userMessage}". I'm here to help you with personalized nutrition guidance. Could you tell me more about your specific goals or concerns? I can help with meal planning, allergy management, budget-friendly options, and evidence-based nutrition advice.`;
        }
    }
    
    updateQuickActions(response) {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        if (response.type === 'meal_plan') {
            actionButtons[0].innerHTML = '<i class="fas fa-plus"></i> Add to My Plan';
            actionButtons[0].style.display = 'block';
        } else if (response.type === 'nutrition_analysis') {
            actionButtons[1].innerHTML = '<i class="fas fa-bookmark"></i> Save Analysis';
            actionButtons[1].style.display = 'block';
        }
    }
    
    updateSessionSummary(content) {
        const sessionSummary = document.querySelector('.session-summary p');
        if (sessionSummary) {
            if (typeof content === 'string') {
                sessionSummary.textContent = 'Providing personalized nutrition guidance based on your needs.';
            } else if (content.type === 'meal_plan') {
                sessionSummary.textContent = 'Created a personalized meal plan tailored to your preferences and goals.';
            } else if (content.type === 'nutrition_analysis') {
                sessionSummary.textContent = 'Analyzed your nutrition needs and provided detailed recommendations.';
            }
        }
    }
    
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    
    openChatModal() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Focus on input
            const chatInput = document.getElementById('chat-input');
            if (chatInput) {
                setTimeout(() => chatInput.focus(), 100);
            }
        }
    }
    
    closeChatModal() {
        const modal = document.getElementById('ai-chat-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    loadMockResponses() {
        // Preload some common responses for better performance
        this.mockResponses = {
            welcome: "Hello! I'm your AI nutrition specialist. How can I help you today?",
            help: "I can help you with meal planning, nutrition analysis, allergy management, and more. What would you like to know?",
            contact: "For personalized guidance, you can also book a session with one of our certified nutrition specialists."
        };
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nutriAIChat = new NutriAIChat();
});

// Export for use in other modules
window.NutriAIChat = NutriAIChat;