// Pricing tabs and Budget calculator logic

document.addEventListener('DOMContentLoaded', () => {
    initPricingTabs();
    initBudgetCalculator();
});

function initPricingTabs() {
    const tabs = document.querySelectorAll('.pricing-tab');
    const prices = {
        monthly: { free: 0, premium: 19, pro: 39 },
        yearly: { free: 0, premium: 19 * 12 * 0.8, pro: 39 * 12 * 0.8 } // 20% off
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const period = tab.getAttribute('data-period');
            updatePlanPrices(prices[period], period);
        });
    });
}

function updatePlanPrices(values, period) {
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        const title = card.querySelector('.plan-header h3').textContent.trim().toLowerCase();
        const priceEl = card.querySelector('.plan-price .price');
        const periodEl = card.querySelector('.plan-price .period');
        if (!priceEl || !periodEl) return;

        let key = title; // 'free', 'premium', 'pro'
        if (key in values) {
            const amount = key === 'free' ? 0 : Math.round(values[key]);
            priceEl.textContent = `$${amount}`;
            periodEl.textContent = period === 'yearly' ? '/year' : '/month';
        }
    });
}

function initBudgetCalculator() {
    const input = document.getElementById('weekly-budget');
    const button = document.getElementById('calculate-budget');
    const results = document.getElementById('budget-results');

    if (!input || !button || !results) return;

    button.addEventListener('click', () => {
        const budget = parseFloat(input.value);
        if (isNaN(budget) || budget < 20) {
            results.innerHTML = `<div class="budget-error">Enter a valid budget (min $20).</div>`;
            return;
        }

        // Simple mocked plan distribution
        const perMeal = Math.max(1.5, (budget / 21)); // 3 meals/day * 7
        const perSnack = Math.max(0.5, (budget / 14));

        results.innerHTML = `
            <div class="budget-summary">
                <h4>Recommended Budget Allocation</h4>
                <ul>
                    <li>Breakfast: ${currency(perMeal)} per meal</li>
                    <li>Lunch: ${currency(perMeal)} per meal</li>
                    <li>Dinner: ${currency(perMeal + 0.5)} per meal</li>
                    <li>Snacks: ${currency(perSnack)} each</li>
                </ul>
            </div>
            <div class="budget-suggestions">
                <h5>AI Suggestions</h5>
                <p>Based on $${budget.toFixed(2)} weekly budget, focus on legumes, whole grains, frozen vegetables, canned fish, and seasonal produce. Swap premium proteins for eggs, tofu, and beans.</p>
            </div>
        `;
    });
}

function currency(n) {
    return `$${n.toFixed(2)}`;
}