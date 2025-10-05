(() => {
    const state = {
        topic: 'All',
        posts: [],
        imageDataUrl: null,
        user: null
    };

    function $(sel){ return document.querySelector(sel); }
    function $all(sel){ return Array.from(document.querySelectorAll(sel)); }

    function renderFeed() {
        const feed = $('#feed');
        if (!feed) return;
        const items = state.topic === 'All' ? state.posts : state.posts.filter(p => p.topic === state.topic);
        if (items.length === 0) {
            feed.innerHTML = '<div class="card empty">No posts yet. Be the first to share! ✨</div>';
            return;
        }
        feed.innerHTML = items.map(p => `
            <article class="card post">
                <div class="post-header">
                    <div class="avatar">${p.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                    <div class="meta">
                        <div class="name">${p.user?.name || 'User'}</div>
                        <div class="sub">${p.topic} • ${new Date(p.createdAt).toLocaleString()}</div>
                    </div>
                </div>
                <div class="content">${escapeHtml(p.text)}</div>
                ${p.image ? `<img class="post-image" src="${p.image}" alt="post" />` : ''}
                <div class="actions">
                    <button class="btn btn-light"><i class="far fa-thumbs-up"></i> Like</button>
                    <button class="btn btn-light"><i class="far fa-comment"></i> Comment</button>
                </div>
            </article>
        `).join('');
    }

    function escapeHtml(str){
        const div = document.createElement('div');
        div.textContent = String(str || '');
        return div.innerHTML;
    }

    function bindTabs(){
        $all('.topic-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                $all('.topic-pill').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.topic = btn.getAttribute('data-topic');
                renderFeed();
            });
        });
    }

    function bindPostForm(){
        const input = $('#post-image');
        const preview = $('#image-preview');
        const previewImg = preview?.querySelector('img');
        const removeBtn = $('#remove-image');
        if (input) {
            input.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    state.imageDataUrl = reader.result;
                    if (preview && previewImg) {
                        previewImg.src = state.imageDataUrl;
                        preview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            });
        }
        if (removeBtn && preview) {
            removeBtn.addEventListener('click', () => {
                state.imageDataUrl = null;
                preview.style.display = 'none';
                const inputEl = $('#post-image');
                if (inputEl) inputEl.value = '';
            });
        }
        const share = $('#share-post');
        share?.addEventListener('click', async () => {
            // Minimal auth gate: require token; otherwise alert (placeholder for modal)
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Please sign up or log in to share a post.');
                return;
            }
            const text = $('#post-text')?.value?.trim();
            if (!text) return;
            const topicBtn = document.querySelector('.topic-pill.active');
            const topic = topicBtn?.getAttribute('data-topic') || 'All';
            // Push to local feed (simulate backend)
            state.posts.unshift({
                id: Date.now(),
                text,
                topic,
                image: state.imageDataUrl,
                user: { name: localStorage.getItem('auth_name') || 'You' },
                createdAt: new Date().toISOString()
            });
            if ($('#post-text')) $('#post-text').value = '';
            state.imageDataUrl = null;
            if (preview) preview.style.display = 'none';
            renderFeed();
        });
    }

    // Seed demo posts
    function seed(){
        state.posts = [
            { id: 1, text: 'My allergy-safe breakfast idea: oats + berries + almond alternative milk 🍓', topic: 'Allergy Support', createdAt: new Date().toISOString(), user: { name: 'Ava' } },
            { id: 2, text: 'Budget lunch: lentil soup + whole grain bread 🥣', topic: 'Budget Nutrition', createdAt: new Date().toISOString(), user: { name: 'Liam' } }
        ];
    }

    document.addEventListener('DOMContentLoaded', () => {
        seed();
        bindTabs();
        bindPostForm();
        renderFeed();
    });
})();


