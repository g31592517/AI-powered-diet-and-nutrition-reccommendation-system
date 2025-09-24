// Educational section logic: myths accordion and calculators placeholders

document.addEventListener('DOMContentLoaded', () => {
    initMythsAccordion();
    initCalculatorsPlaceholders();
});

function initMythsAccordion() {
    const mythsContainer = document.getElementById('myths-accordion');
    if (!mythsContainer) return;

    const myths = [
        {
            claim: 'Carbs make you gain weight',
            fact: 'Excess calories cause weight gain, not carbs per se.',
            evidence: 'Whole grains and fiber-rich carbs support satiety and long-term weight management.'
        },
        {
            claim: 'Eating after 8pm causes fat gain',
            fact: 'Total daily intake and patterns matter more than meal timing alone.',
            evidence: 'Late meals can impact sleep/choices, but energy balance is primary.'
        },
        {
            claim: 'Detox teas cleanse your body',
            fact: 'Your liver and kidneys already detox effectively.',
            evidence: 'No robust evidence supports detox teas for toxin removal.'
        }
    ];

    mythsContainer.innerHTML = myths.map((m, idx) => `
        <details class="myth-item" ${idx === 0 ? 'open' : ''}>
            <summary>
                <span class="myth-title">Myth: ${m.claim}</span>
                <i class="fas fa-chevron-down"></i>
            </summary>
            <div class="myth-body">
                <p><strong>Fact:</strong> ${m.fact}</p>
                <p><strong>Evidence:</strong> ${m.evidence}</p>
            </div>
        </details>
    `).join('');

    // Improve keyboard accessibility for summary
    mythsContainer.querySelectorAll('summary').forEach(summary => {
        summary.setAttribute('role', 'button');
        summary.setAttribute('tabindex', '0');
    });
}

function initCalculatorsPlaceholders() {
    // Hook up resource buttons to scroll to calculators or show placeholder alerts
    document.querySelectorAll('.resource-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Interactive calculators and modules will be added in a later step.');
        });
    });
}