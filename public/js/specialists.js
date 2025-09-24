// Specialists listing with mock data and simple detail modal

document.addEventListener('DOMContentLoaded', () => {
    initSpecialistsGrid();
});

function initSpecialistsGrid() {
    const grid = document.getElementById('specialists-grid');
    if (!grid) return;

    const specialists = [
        {
            id: 1,
            name: 'Dr. Emily Carter',
            specialty: 'Clinical Nutritionist',
            price: 60,
            rating: 4.9,
            slots: ['Mon 10:00', 'Tue 14:00', 'Thu 09:00']
        },
        {
            id: 2,
            name: 'James Lee, RD',
            specialty: 'Sports Dietitian',
            price: 50,
            rating: 4.7,
            slots: ['Wed 11:00', 'Fri 15:30']
        },
        {
            id: 3,
            name: 'Priya Sharma, MSc',
            specialty: 'Allergy & Gut Health',
            price: 65,
            rating: 4.8,
            slots: ['Tue 10:30', 'Thu 16:00']
        }
    ];

    grid.innerHTML = specialists.map(spec => `
        <div class="specialist-card">
            <div class="specialist-avatar">👩‍⚕️</div>
            <h3 class="specialist-name">${spec.name}</h3>
            <p class="specialist-specialty">${spec.specialty}</p>
            <div class="specialist-meta">
                <span><i class="fas fa-star"></i> ${spec.rating}</span>
                <span><i class="fas fa-dollar-sign"></i> ${spec.price}/session</span>
            </div>
            <div class="specialist-slots">
                ${spec.slots.map(s => `<span class="slot">${s}</span>`).join('')}
            </div>
            <div class="specialist-actions">
                <button class="action-btn view-btn" data-id="${spec.id}"><i class="fas fa-eye"></i> View</button>
                <button class="action-btn book-btn" data-id="${spec.id}"><i class="fas fa-calendar"></i> Book</button>
            </div>
        </div>
    `).join('');

    // Bind actions
    grid.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => openSpecialistModal(btn.dataset.id, specialists)));
    grid.querySelectorAll('.book-btn').forEach(btn => btn.addEventListener('click', () => openBookingPlaceholder()));
}

function openSpecialistModal(id, list) {
    const spec = list.find(s => s.id == id);
    if (!spec) return;

    const modal = document.createElement('div');
    modal.className = 'generic-modal';
    modal.innerHTML = `
        <div class="generic-modal-content">
            <div class="generic-modal-header">
                <h3>${spec.name}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="generic-modal-body">
                <p><strong>Specialty:</strong> ${spec.specialty}</p>
                <p><strong>Rating:</strong> ${spec.rating}</p>
                <p><strong>Price:</strong> $${spec.price} per session</p>
                <h4>Next Available Slots</h4>
                <div class="specialist-slots">${spec.slots.map(s => `<span class='slot'>${s}</span>`).join('')}</div>
                <p class="disclaimer"><i class="fas fa-info-circle"></i> NutriEmpower connects you with certified experts. Medical emergencies should be directed to your local emergency services.</p>
            </div>
            <div class="generic-modal-footer">
                <button class="action-btn book-btn"><i class="fas fa-calendar"></i> Book Session</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function openBookingPlaceholder() {
    alert('Booking flow will connect to calendar and payment in a future update.');
}