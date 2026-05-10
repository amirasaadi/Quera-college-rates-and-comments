document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const coursesGrid = document.getElementById('courses-grid');
    const searchInput = document.getElementById('search-input');
    const themeToggle = document.getElementById('theme-toggle');
    const modal = document.getElementById('course-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalBody = document.getElementById('modal-body');
    const giscusContainer = document.getElementById('giscus-container');

    // Theme Setup
    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark for developers
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Reload giscus with new theme if modal is open
        if (modal.style.display === 'block') {
            loadGiscus(modal.dataset.courseId);
        }
    });

    function updateThemeIcon(theme) {
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
    }

    // Generate Stars HTML
    function getStarsHtml(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '<i class="fa-solid fa-star"></i>';
            } else {
                html += '<i class="fa-regular fa-star"></i>';
            }
        }
        return html;
    }

    // Render Courses
    function renderCourses(courses) {
        coursesGrid.innerHTML = '';
        if (courses.length === 0) {
            coursesGrid.innerHTML = '<p style="text-align:center; width: 100%; color: var(--text-secondary);">دوره‌ای یافت نشد.</p>';
            return;
        }

        courses.forEach(course => {
            const tagsHtml = course.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            const card = document.createElement('div');
            card.className = 'course-card glass-panel';
            card.dataset.id = course.id;
            
            // Truncate comment
            const shortComment = course.authorReview.comment.length > 80 ? 
                course.authorReview.comment.substring(0, 80) + '...' : course.authorReview.comment;

            card.innerHTML = `
                <div class="course-header">
                    <span class="platform-badge">${course.platform}</span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <div class="course-tags">
                    ${tagsHtml}
                </div>
                
                <div class="review-snippet">
                    ${shortComment}
                </div>

                <div class="course-footer">
                    <div class="rating" title="امتیاز: ${course.overallRating} از 5">
                        ${getStarsHtml(course.overallRating)}
                    </div>
                    <span class="view-btn">مشاهده نظرات <i class="fa-solid fa-arrow-left"></i></span>
                </div>
            `;
            
            card.addEventListener('click', () => openModal(course));
            coursesGrid.appendChild(card);
        });
    }

    // Open Modal
    function openModal(course) {
        modalBody.innerHTML = `
            <div class="modal-header-banner">
                <span class="platform-badge" style="margin-bottom: 10px; display: inline-block;">${course.platform}</span>
                <h2>${course.title}</h2>
                <div class="rating">
                    امتیاز اصلی: ${getStarsHtml(course.overallRating)}
                </div>
                <div class="course-tags" style="margin-bottom: 0;">
                    ${course.tags.map(tag => `<span class="tag" style="background: rgba(255,255,255,0.2); color: inherit;">${tag}</span>`).join('')}
                </div>
            </div>
            
            <div style="padding: 20px 30px 0;">
                <div class="author-review-full">
                    <h4><i class="fa-solid fa-user-pen"></i> نظر ثبت‌کننده دوره</h4>
                    <div class="rating" style="margin-bottom: 10px;">${getStarsHtml(course.authorReview.rating)}</div>
                    <p>${course.authorReview.comment}</p>
                </div>
            </div>
        `;
        
        modal.dataset.courseId = course.id;
        loadGiscus(course.id);
        
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Load Giscus
    function loadGiscus(term) {
        giscusContainer.innerHTML = '';
        const script = document.createElement('script');
        script.src = "https://giscus.app/client.js";
        
        // --- TO THE OWNER: REPLACE THESE WITH YOUR REPO INFO ---
        script.setAttribute("data-repo", "amirasaadi/Quera-college-rates-and-comments");
        script.setAttribute("data-repo-id", "R_kgDOSZPZpA");
        script.setAttribute("data-category", "Announcements");
        script.setAttribute("data-category-id", "DIC_kwDOSZPZpM4C8s-f");
        // -------------------------------------------------------

        // Note: Kept data-mapping="specific" and data-term=term so comments are per-course
        script.setAttribute("data-mapping", "specific");
        script.setAttribute("data-term", term);
        script.setAttribute("data-strict", "0");
        script.setAttribute("data-reactions-enabled", "1");
        script.setAttribute("data-emit-metadata", "0");
        script.setAttribute("data-input-position", "bottom");
        
        // Note: Kept dynamic theme so it changes with your site's dark/light toggle
        const theme = document.documentElement.getAttribute('data-theme');
        script.setAttribute("data-theme", theme === 'dark' ? 'dark' : 'light');
        
        script.setAttribute("data-lang", "en");
        script.crossOrigin = "anonymous";
        script.async = true;
        
        giscusContainer.appendChild(script);
    }

    // Close Modal
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = coursesData.filter(course => 
            course.title.toLowerCase().includes(query) ||
            course.tags.some(tag => tag.toLowerCase().includes(query)) ||
            course.authorReview.comment.toLowerCase().includes(query)
        );
        renderCourses(filtered);
    });

    // Initial Render
    renderCourses(coursesData);
});
