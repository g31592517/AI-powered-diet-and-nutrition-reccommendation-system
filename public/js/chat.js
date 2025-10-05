// AI Chat Interface JavaScript with Ollama Integration
// Real-time chat with NutriAI Assistant using WebSocket and REST API

class NutriAIChat {
    constructor() {
        this.messages = [];
        this.isTyping = false;
        this.sessionId = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupQuickPrompts();
        // Minimal setup: skip WebSocket; use REST only
        this.loadSession();
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
    
    initializeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.reconnectAttempts = 0;
                this.updateConnectionStatus('connected');
            };
            
            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(event);
            };
            
            this.ws.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.updateConnectionStatus('disconnected');
                this.attemptReconnect();
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.updateConnectionStatus('error');
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.updateConnectionStatus('error');
        }
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.initializeWebSocket();
            }, 2000 * this.reconnectAttempts);
        } else {
            console.error('❌ Max reconnection attempts reached');
            this.updateConnectionStatus('failed');
        }
    }
    
    updateConnectionStatus(status) {
        const statusElement = document.querySelector('.connection-status');
        if (statusElement) {
            statusElement.className = `connection-status ${status}`;
            statusElement.textContent = this.getStatusText(status);
        }
    }
    
    getStatusText(status) {
        const statusTexts = {
            'connected': 'Online • Ready to help',
            'disconnected': 'Connecting...',
            'error': 'Connection error',
            'failed': 'Connection failed'
        };
        return statusTexts[status] || 'Unknown status';
    }
    
    handleWebSocketMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
                case 'welcome':
                    this.sessionId = data.sessionId;
                    this.saveSession();
                    break;
                    
                case 'typing':
                    this.showTypingIndicator();
                    break;
                    
                case 'response_chunk':
                    this.handleResponseChunk(data.content);
                    break;
                    
                case 'response_complete':
                    this.handleResponseComplete(data);
                    break;
                    
                case 'error':
                    this.handleError(data.error);
                    break;
                    
                case 'pong':
                    // Handle ping-pong for connection health
                    break;
            }
        } catch (error) {
            console.error('Error handling WebSocket message:', error);
        }
    }
    
    handleResponseChunk(content) {
        // Update the last AI message with streaming content
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
            lastMessage.content += content;
            this.updateLastMessage(lastMessage);
        }
    }
    
    handleResponseComplete(data) {
        this.hideTypingIndicator();
        
        // Update the complete response
        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai') {
            lastMessage.content = data.content;
            lastMessage.timestamp = new Date(data.timestamp);
            this.updateLastMessage(lastMessage);
        }
        
        // Update session summary
        this.updateSessionSummary(data.content);
    }
    
    handleError(error) {
        this.hideTypingIndicator();
        this.addMessage(`Error: ${error}`, 'ai', 'error');
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // Minimal version: always use REST API for simplicity
        this.sendRestMessage(message);
    }
    
    sendWebSocketMessage(message) {
        const messageData = {
            type: 'chat',
            text: message,
            options: this.getChatOptions()
        };
        
        this.ws.send(JSON.stringify(messageData));
    }
    
    async sendRestMessage(message) {
        try {
            this.showTypingIndicator();
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId,
                    options: this.getChatOptions()
                })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.sessionId = data.sessionId;
                this.saveSession();
                this.addMessage(data.response, 'ai');
                this.updateSessionSummary(data.response);
            } else {
                this.addMessage(`Error: ${data.error}`, 'ai', 'error');
            }
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(`Error: ${error.message}`, 'ai', 'error');
        }
    }
    
    getChatOptions() {
        // Get user preferences from UI or stored data
        return {
            focus: this.getUserFocus(),
            allergies: this.getUserAllergies(),
            budget: this.getUserBudget()
        };
    }
    
    getUserFocus() {
        // This could be determined from user profile or current context
        return null;
    }
    
    getUserAllergies() {
        // This could be retrieved from user profile
        return null;
    }
    
    getUserBudget() {
        // This could be retrieved from user profile
        return null;
    }
    
    addMessage(content, sender, type = 'normal') {
        const message = {
            id: Date.now(),
            content,
            sender,
            type,
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
        messageElement.className = `message ${message.sender}-message ${message.type}`;
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
    
    updateLastMessage(message) {
        const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                contentElement.innerHTML = this.formatMessageContent(message.content);
            }
        }
    }
    
    formatMessageContent(content) {
        // Handle different types of content
        if (typeof content === 'string') {
            // Simple text message with basic formatting
            return `<p>${this.escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
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
                // Extract key topics from the response
                const topics = this.extractTopics(content);
                if (topics.length > 0) {
                    sessionSummary.textContent = `Providing guidance on: ${topics.join(', ')}`;
                } else {
                    sessionSummary.textContent = 'Providing personalized nutrition guidance based on your needs.';
                }
            }
        }
    }
    
    extractTopics(content) {
        const topics = [];
        const lowerContent = content.toLowerCase();
        
        if (lowerContent.includes('meal plan') || lowerContent.includes('meal planning')) {
            topics.push('meal planning');
        }
        if (lowerContent.includes('allergy') || lowerContent.includes('allergies')) {
            topics.push('allergy management');
        }
        if (lowerContent.includes('budget') || lowerContent.includes('cost')) {
            topics.push('budget-friendly options');
        }
        if (lowerContent.includes('weight') || lowerContent.includes('lose weight')) {
            topics.push('weight management');
        }
        if (lowerContent.includes('myth') || lowerContent.includes('fact')) {
            topics.push('nutrition facts');
        }
        
        return topics;
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
    
    saveSession() {
        if (this.sessionId) {
            localStorage.setItem('nutriai_session_id', this.sessionId);
        }
    }
    
    loadSession() {
        this.sessionId = localStorage.getItem('nutriai_session_id');
        if (this.sessionId) {
            this.loadChatHistory();
        }
    }
    
    async loadChatHistory() {
        if (!this.sessionId) return;
        
        try {
            const response = await fetch(`/api/chat/history/${this.sessionId}`);
            const data = await response.json();
            
            if (data.success && data.history.messages) {
                // Clear current messages
                this.messages = [];
                
                // Load history messages
                data.history.messages.forEach(msg => {
                    this.messages.push({
                        id: Date.now() + Math.random(),
                        content: msg.content,
                        sender: msg.role === 'assistant' ? 'ai' : 'user',
                        timestamp: new Date(msg.timestamp)
                    });
                });
                
                // Display messages
                this.messages.forEach(msg => {
                    this.displayMessage(msg);
                });
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }
    
    async clearChat() {
        if (this.sessionId) {
            try {
                await fetch(`/api/chat/${this.sessionId}`, { method: 'DELETE' });
                this.sessionId = null;
                localStorage.removeItem('nutriai_session_id');
            } catch (error) {
                console.error('Error clearing chat:', error);
            }
        }
        
        // Clear UI
        this.messages = [];
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
        }
    }
}

// Initialize chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nutriAIChat = new NutriAIChat();
});

// Export for use in other modules
window.NutriAIChat = NutriAIChat;
