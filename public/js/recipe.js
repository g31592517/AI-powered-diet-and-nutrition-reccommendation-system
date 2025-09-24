// Recipes JavaScript for NutriEmpower

class NutriRecipes {
    constructor() {
        this.recipes = [];
        this.filteredRecipes = [];
        this.currentFilters = {
            dietary: 'all',
            budget: 'all',
            time: 'all'
        };
        this.init();
    }
    
    init() {
        this.loadMockRecipes();
        this.bindEvents();
        this.renderRecipes();
        this.initMealPlanner();
    }
    
    bindEvents() {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Meal planner tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleTabClick(e));
        });
        
        // AI customize buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ai-customize-btn')) {
                this.handleAICustomize(e);
            }
        });
    }
    
    handleFilterClick(event) {
        const btn = event.currentTarget;
        const filterType = btn.closest('.filter-group').querySelector('label').textContent.toLowerCase();
        const filterValue = btn.getAttribute('data-filter') || btn.getAttribute('data-budget') || btn.getAttribute('data-time');
        
        // Update active state
        const filterGroup = btn.closest('.filter-group');
        filterGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update filters
        if (filterType.includes('dietary')) {
            this.currentFilters.dietary = filterValue;
        } else if (filterType.includes('budget')) {
            this.currentFilters.budget = filterValue;
        } else if (filterType.includes('time')) {
            this.currentFilters.time = filterValue;
        }
        
        // Apply filters and re-render
        this.applyFilters();
    }
    
    handleTabClick(event) {
        const btn = event.currentTarget;
        const day = btn.getAttribute('data-day');
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active day plan
        document.querySelectorAll('.day-plan').forEach(plan => plan.classList.remove('active'));
        const dayPlan = document.querySelector(`[data-day="${day}"]`);
        if (dayPlan) {
            dayPlan.classList.add('active');
        }
    }
    
    handleAICustomize(event) {
        const recipeCard = event.target.closest('.recipe-card');
        const recipeTitle = recipeCard.querySelector('.recipe-title').textContent;
        
        // Placeholder for AI customization
        console.log(`AI customizing recipe: ${recipeTitle}`);
        
        // In a real implementation, this would:
        // 1. Open AI chat with recipe context
        // 2. Allow users to specify modifications
        // 3. Generate customized recipe variations
        // 4. Save personalized recipes
        
        alert(`AI customization for "${recipeTitle}" will be implemented with full backend integration and AI model.`);
    }
    
    applyFilters() {
        this.filteredRecipes = this.recipes.filter(recipe => {
            // Dietary restrictions filter
            if (this.currentFilters.dietary !== 'all') {
                if (this.currentFilters.dietary === 'vegetarian' && !recipe.isVegetarian) return false;
                if (this.currentFilters.dietary === 'vegan' && !recipe.isVegan) return false;
                if (this.currentFilters.dietary === 'gluten-free' && !recipe.isGlutenFree) return false;
                if (this.currentFilters.dietary === 'dairy-free' && !recipe.hasDairy) return false;
            }
            
            // Budget filter
            if (this.currentFilters.budget !== 'all') {
                if (this.currentFilters.budget === 'budget' && recipe.costPerServing > 3) return false;
                if (this.currentFilters.budget === 'moderate' && (recipe.costPerServing <= 3 || recipe.costPerServing > 6)) return false;
                if (this.currentFilters.budget === 'premium' && recipe.costPerServing <= 6) return false;
            }
            
            // Time filter
            if (this.currentFilters.time !== 'all') {
                if (this.currentFilters.time === 'quick' && recipe.totalTime > 30) return false;
                if (this.currentFilters.time === 'medium' && (recipe.totalTime <= 30 || recipe.totalTime > 60)) return false;
                if (this.currentFilters.time === 'slow' && recipe.totalTime <= 60) return false;
            }
            
            return true;
        });
        
        this.renderRecipes();
    }
    
    renderRecipes() {
        const recipesGrid = document.getElementById('recipes-grid');
        if (!recipesGrid) return;
        
        recipesGrid.innerHTML = '';
        
        if (this.filteredRecipes.length === 0) {
            recipesGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your filters to see more options.</p>
                </div>
            `;
            return;
        }
        
        this.filteredRecipes.forEach(recipe => {
            const recipeCard = this.createRecipeCard(recipe);
            recipesGrid.appendChild(recipeCard);
        });
    }
    
    createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        // Create recipe image placeholder
        const imagePlaceholder = this.getRecipeImagePlaceholder(recipe.category);
        
        // Create tags
        const tags = this.createRecipeTags(recipe);
        
        // Create budget indicator
        const budgetIndicator = this.createBudgetIndicator(recipe.costPerServing);
        
        // Create allergy alerts
        const allergyAlerts = this.createAllergyAlerts(recipe);
        
        card.innerHTML = `
            <div class="recipe-image">
                ${imagePlaceholder}
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-clock"></i> ${recipe.totalTime} min</span>
                    <span><i class="fas fa-users"></i> ${recipe.servings} servings</span>
                    <span><i class="fas fa-fire"></i> ${recipe.calories} cal</span>
                </div>
                <div class="recipe-tags">
                    ${tags}
                </div>
                <div class="recipe-budget">
                    ${budgetIndicator}
                </div>
                ${allergyAlerts}
                <div class="recipe-actions">
                    <button class="recipe-btn secondary">
                        <i class="fas fa-eye"></i> View Recipe
                    </button>
                    <button class="recipe-btn primary ai-customize-btn">
                        <i class="fas fa-robot"></i> AI Customize
                    </button>
                </div>
            </div>
        `;
        
        // Add click event for viewing recipe
        const viewBtn = card.querySelector('.recipe-btn.secondary');
        viewBtn.addEventListener('click', () => this.viewRecipe(recipe));
        
        return card;
    }
    
    getRecipeImagePlaceholder(category) {
        const icons = {
            'breakfast': 'fas fa-egg',
            'lunch': 'fas fa-utensils',
            'dinner': 'fas fa-drumstick-bite',
            'snack': 'fas fa-apple-alt',
            'dessert': 'fas fa-ice-cream',
            'drink': 'fas fa-glass-whiskey'
        };
        
        const icon = icons[category] || 'fas fa-utensils';
        return `<i class="${icon}"></i>`;
    }
    
    createRecipeTags(recipe) {
        const tags = [];
        
        if (recipe.isVegetarian) tags.push('Vegetarian');
        if (recipe.isVegan) tags.push('Vegan');
        if (recipe.isGlutenFree) tags.push('Gluten-Free');
        if (recipe.isDairyFree) tags.push('Dairy-Free');
        if (recipe.isLowCarb) tags.push('Low-Carb');
        if (recipe.isHighProtein) tags.push('High-Protein');
        
        return tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('');
    }
    
    createBudgetIndicator(costPerServing) {
        let budgetClass = 'budget-low';
        let budgetText = 'Budget-Friendly';
        
        if (costPerServing > 6) {
            budgetClass = 'budget-high';
            budgetText = 'Premium';
        } else if (costPerServing > 3) {
            budgetClass = 'budget-medium';
            budgetText = 'Moderate';
        }
        
        return `<span class="budget-indicator ${budgetClass}">$${costPerServing.toFixed(2)} - ${budgetText}</span>`;
    }
    
    createAllergyAlerts(recipe) {
        const allergens = [];
        
        if (recipe.containsNuts) allergens.push('Nuts');
        if (recipe.containsShellfish) allergens.push('Shellfish');
        if (recipe.containsEggs) allergens.push('Eggs');
        if (recipe.containsSoy) allergens.push('Soy');
        if (recipe.containsWheat) allergens.push('Wheat');
        if (recipe.containsFish) allergens.push('Fish');
        
        if (allergens.length === 0) return '';
        
        return `
            <div class="allergy-alerts">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Contains: ${allergens.join(', ')}</span>
            </div>
        `;
    }
    
    viewRecipe(recipe) {
        // Placeholder for recipe detail view
        console.log(`Viewing recipe: ${recipe.title}`);
        
        // In a real implementation, this would:
        // 1. Open a modal or navigate to recipe detail page
        // 2. Show full recipe instructions
        // 3. Display nutritional information
        // 4. Allow saving to favorites
        // 5. Show similar recipes
        
        alert(`Recipe detail view for "${recipe.title}" will be implemented with full backend integration.`);
    }
    
    initMealPlanner() {
        // Initialize meal planner functionality
        console.log('Meal planner initialized');
        
        // Add drag and drop functionality for meal slots
        this.initDragAndDrop();
    }
    
    initDragAndDrop() {
        const mealSlots = document.querySelectorAll('.meal-slot');
        const recipeCards = document.querySelectorAll('.recipe-card');
        
        // Make recipe cards draggable
        recipeCards.forEach(card => {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
        });
        
        // Make meal slots droppable
        mealSlots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e));
            slot.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }
    
    handleDragStart(event) {
        const recipeCard = event.currentTarget;
        const recipeTitle = recipeCard.querySelector('.recipe-title').textContent;
        event.dataTransfer.setData('text/plain', recipeTitle);
        event.dataTransfer.effectAllowed = 'copy';
    }
    
    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        event.currentTarget.style.borderColor = '#27AE60';
        event.currentTarget.style.backgroundColor = '#E8F5E8';
    }
    
    handleDrop(event) {
        event.preventDefault();
        const slot = event.currentTarget;
        const recipeTitle = event.dataTransfer.getData('text/plain');
        
        // Reset slot styling
        slot.style.borderColor = '';
        slot.style.backgroundColor = '';
        
        // Add recipe to meal slot
        this.addRecipeToMealSlot(slot, recipeTitle);
    }
    
    addRecipeToMealSlot(slot, recipeTitle) {
        const slotContent = slot.querySelector('.slot-content');
        
        // Find recipe data
        const recipe = this.recipes.find(r => r.title === recipeTitle);
        if (!recipe) return;
        
        // Create meal item
        const mealItem = document.createElement('div');
        mealItem.className = 'meal-item';
        mealItem.innerHTML = `
            <div class="meal-info">
                <h5>${recipe.title}</h5>
                <span class="meal-calories">${recipe.calories} cal</span>
            </div>
            <button class="remove-meal-btn" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Clear slot and add meal
        slotContent.innerHTML = '';
        slotContent.appendChild(mealItem);
        
        // Update slot styling
        slot.style.borderColor = '#27AE60';
        slot.style.backgroundColor = '#E8F5E8';
        
        // Show success message
        this.showMealAddedMessage(recipeTitle);
    }
    
    showMealAddedMessage(recipeTitle) {
        // Create temporary success message
        const message = document.createElement('div');
        message.className = 'meal-added-message';
        message.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${recipeTitle} added to meal plan!</span>
        `;
        
        // Add to page
        document.body.appendChild(message);
        
        // Animate in
        setTimeout(() => message.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            message.classList.remove('show');
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
    
    loadMockRecipes() {
        // Load mock recipe data for demonstration
        this.recipes = [
            {
                id: 1,
                title: 'Quinoa Buddha Bowl',
                category: 'lunch',
                totalTime: 25,
                servings: 2,
                calories: 420,
                costPerServing: 2.50,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
                isDairyFree: true,
                isLowCarb: false,
                isHighProtein: true,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: false
            },
            {
                id: 2,
                title: 'Grilled Chicken Salad',
                category: 'lunch',
                totalTime: 20,
                servings: 1,
                calories: 350,
                costPerServing: 4.20,
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: true,
                isDairyFree: true,
                isLowCarb: true,
                isHighProtein: true,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: false
            },
            {
                id: 3,
                title: 'Overnight Oats',
                category: 'breakfast',
                totalTime: 5,
                servings: 1,
                calories: 280,
                costPerServing: 1.80,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
                isDairyFree: true,
                isLowCarb: false,
                isHighProtein: false,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: false
            },
            {
                id: 4,
                title: 'Salmon with Roasted Vegetables',
                category: 'dinner',
                totalTime: 35,
                servings: 2,
                calories: 480,
                costPerServing: 7.50,
                isVegetarian: false,
                isVegan: false,
                isGlutenFree: true,
                isDairyFree: true,
                isLowCarb: true,
                isHighProtein: true,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: true
            },
            {
                id: 5,
                title: 'Chocolate Protein Smoothie',
                category: 'snack',
                totalTime: 5,
                servings: 1,
                calories: 220,
                costPerServing: 3.20,
                isVegetarian: true,
                isVegan: false,
                isGlutenFree: true,
                isDairyFree: false,
                isLowCarb: false,
                isHighProtein: true,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: false
            },
            {
                id: 6,
                title: 'Lentil Curry',
                category: 'dinner',
                totalTime: 45,
                servings: 4,
                calories: 320,
                costPerServing: 1.90,
                isVegetarian: true,
                isVegan: true,
                isGlutenFree: true,
                isDairyFree: true,
                isLowCarb: false,
                isHighProtein: true,
                containsNuts: false,
                containsShellfish: false,
                containsEggs: false,
                containsSoy: false,
                containsWheat: false,
                containsFish: false
            }
        ];
        
        this.filteredRecipes = [...this.recipes];
    }
    
    getRecipeById(id) {
        return this.recipes.find(recipe => recipe.id === id);
    }
    
    searchRecipes(query) {
        const searchTerm = query.toLowerCase();
        this.filteredRecipes = this.recipes.filter(recipe => {
            return recipe.title.toLowerCase().includes(searchTerm) ||
                   recipe.category.toLowerCase().includes(searchTerm) ||
                   (recipe.isVegetarian && searchTerm.includes('vegetarian')) ||
                   (recipe.isVegan && searchTerm.includes('vegan')) ||
                   (recipe.isGlutenFree && searchTerm.includes('gluten'));
        });
        
        this.renderRecipes();
    }
    
    generateShoppingList() {
        // Placeholder for shopping list generation
        console.log('Generating shopping list from meal plan');
        
        // In a real implementation, this would:
        // 1. Collect all ingredients from planned meals
        // 2. Consolidate quantities
        // 3. Organize by category (produce, dairy, etc.)
        // 4. Show estimated total cost
        // 5. Allow export to shopping apps
        
        alert('Shopping list generation will be implemented with full backend integration and ingredient database.');
    }
}

// Initialize recipes when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.nutriRecipes = new NutriRecipes();
});

// Export for use in other modules
window.NutriRecipes = NutriRecipes;