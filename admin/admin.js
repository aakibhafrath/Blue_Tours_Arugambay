/* ==========================================================================
   BLUE TOURS ARUGAMBAY - ADMIN CONTROLLER LOGIC
   ========================================================================== */

(function () {
  // Application State
  const state = {
    user: null,
    items: [],
    filterType: 'all',     // 'all' | 'image' | 'video'
    filterCategory: 'all', // 'all' | 'safari' | 'lagoon' etc.
    searchQuery: '',
    currentEditId: null,
    selectedFile: null,
    isUploading: false
  };

  // DOM Elements
  const el = {
    // Views
    loginSection: document.getElementById('loginSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    configNoticeAlert: document.getElementById('configNoticeAlert'),
    loginAlert: document.getElementById('loginAlert'),
    loginAlertText: document.getElementById('loginAlertText'),
    
    // Login Form
    adminLoginForm: document.getElementById('adminLoginForm'),
    loginEmail: document.getElementById('loginEmail'),
    loginPassword: document.getElementById('loginPassword'),
    btnLoginSubmit: document.getElementById('btnLoginSubmit'),
    btnLoginText: document.getElementById('btnLoginText'),
    btnLoginSpinner: document.getElementById('btnLoginSpinner'),
    btnTogglePassword: document.getElementById('btnTogglePassword'),
    eyeIcon: document.getElementById('eyeIcon'),

    // Dashboard Header & Stats
    btnAdminLogout: document.getElementById('btnAdminLogout'),
    btnOpenSettings: document.getElementById('btnOpenSettings'),
    statTotalPhotos: document.getElementById('statTotalPhotos'),
    statTotalVideos: document.getElementById('statTotalVideos'),
    statTotalMedia: document.getElementById('statTotalMedia'),

    // Action Toolbar & Filters
    btnQuickAddPhoto: document.getElementById('btnQuickAddPhoto'),
    btnQuickAddVideo: document.getElementById('btnQuickAddVideo'),
    btnRefreshGrid: document.getElementById('btnRefreshGrid'),
    adminSearchInput: document.getElementById('adminSearchInput'),
    tabButtons: document.querySelectorAll('.admin-tab-btn'),
    categoryPills: document.querySelectorAll('.category-pill'),
    adminGalleryGrid: document.getElementById('adminGalleryGrid'),

    // Media Modal
    mediaModal: document.getElementById('mediaModal'),
    modalTitle: document.getElementById('modalTitle'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnSaveMedia: document.getElementById('btnSaveMedia'),
    btnSaveText: document.getElementById('btnSaveText'),
    formItemId: document.getElementById('formItemId'),
    formMediaType: document.getElementById('formMediaType'),
    fileDropzone: document.getElementById('fileDropzone'),
    formFileInput: document.getElementById('formFileInput'),
    dropzoneIcon: document.getElementById('dropzoneIcon'),
    dropzoneText: document.getElementById('dropzoneText'),
    dropzoneHint: document.getElementById('dropzoneHint'),
    previewContainer: document.getElementById('previewContainer'),
    imagePreview: document.getElementById('imagePreview'),
    videoPreview: document.getElementById('videoPreview'),
    btnRemovePreview: document.getElementById('btnRemovePreview'),
    uploadProgressBar: document.getElementById('uploadProgressBar'),
    uploadProgressFill: document.getElementById('uploadProgressFill'),
    formTitle: document.getElementById('formTitle'),
    formCategory: document.getElementById('formCategory'),
    formDescription: document.getElementById('formDescription'),

    // Settings Modal
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnOpenSetupGuide: document.getElementById('btnOpenSetupGuide'),
    configSupabaseUrl: document.getElementById('configSupabaseUrl'),
    configSupabaseAnonKey: document.getElementById('configSupabaseAnonKey'),
    btnSaveSettings: document.getElementById('btnSaveSettings'),

    // Toast
    adminToast: document.getElementById('adminToast'),
    toastMessage: document.getElementById('toastMessage')
  };

  // =========================================================================
  // 1. INITIALIZATION & AUTH STATE
  // =========================================================================
  async function init() {
    setupEventListeners();
    checkConfigStatus();

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) {
      showLoginView();
      return;
    }

    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (error || !session) {
        showLoginView();
      } else {
        state.user = session.user;
        showDashboardView();
        loadGalleryItems();
      }
    } catch (err) {
      console.error('Session retrieval error:', err);
      showLoginView();
    }
  }

  function checkConfigStatus() {
    const isConfigured = window.BlueToursSupabase && window.BlueToursSupabase.isConfigured();
    if (!isConfigured) {
      el.configNoticeAlert.classList.add('show');
    } else {
      el.configNoticeAlert.classList.remove('show');
    }
  }

  function showLoginView() {
    el.loginSection.style.display = 'flex';
    el.dashboardSection.style.display = 'none';
  }

  function showDashboardView() {
    el.loginSection.style.display = 'none';
    el.dashboardSection.style.display = 'flex';
  }

  // =========================================================================
  // 2. AUTHENTICATION HANDLERS
  // =========================================================================
  async function handleLogin(e) {
    e.preventDefault();
    hideAlert();

    const email = el.loginEmail.value.trim();
    const password = el.loginPassword.value;

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) {
      showAlert('Please configure your Supabase URL & Anon Key first.');
      openSettingsModal();
      return;
    }

    setLoginLoading(true);

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        showAlert(error.message || 'Invalid credentials. Please verify your email and password.');
      } else if (data && data.user) {
        state.user = data.user;
        showToast('Welcome back! Successfully logged in.', 'success');
        showDashboardView();
        loadGalleryItems();
      }
    } catch (err) {
      showAlert(err.message || 'Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLogout() {
    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (client) {
      await client.auth.signOut();
    }
    state.user = null;
    state.items = [];
    showToast('Signed out successfully.', 'success');
    showLoginView();
  }

  function setLoginLoading(isLoading) {
    el.btnLoginSubmit.disabled = isLoading;
    el.btnLoginText.style.display = isLoading ? 'none' : 'inline';
    el.btnLoginSpinner.style.display = isLoading ? 'inline' : 'none';
  }

  function showAlert(msg) {
    el.loginAlertText.textContent = msg;
    el.loginAlert.classList.add('show');
  }

  function hideAlert() {
    el.loginAlert.classList.remove('show');
  }

  // =========================================================================
  // 3. GALLERY CRUD OPERATIONS
  // =========================================================================
  async function loadGalleryItems() {
    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) return;

    el.adminGalleryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding:3rem;">
        <div style="font-size:1.2rem; color:var(--turquoise);">Loading media items...</div>
      </div>
    `;

    try {
      const { data, error } = await client
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      state.items = data || [];
      updateMetrics();
      renderGalleryGrid();
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      showToast('Error loading gallery items: ' + err.message, 'error');
      el.adminGalleryGrid.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Failed to load media</div>
          <div class="empty-subtitle">${err.message}</div>
          <button id="btnRetryLoad" class="btn-admin-primary" style="width:auto;">Retry</button>
        </div>
      `;
      document.getElementById('btnRetryLoad')?.addEventListener('click', loadGalleryItems);
    }
  }

  function updateMetrics() {
    const photos = state.items.filter(i => i.media_type === 'image').length;
    const videos = state.items.filter(i => i.media_type === 'video').length;
    el.statTotalPhotos.textContent = photos;
    el.statTotalVideos.textContent = videos;
    el.statTotalMedia.textContent = state.items.length;
  }

  function renderGalleryGrid() {
    let filtered = state.items;

    // Filter by type (all/image/video)
    if (state.filterType !== 'all') {
      filtered = filtered.filter(i => i.media_type === state.filterType);
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(i => i.category === state.filterCategory);
    }

    // Filter by search
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        (i.title && i.title.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      el.adminGalleryGrid.innerHTML = `
        <div class="admin-empty-state">
          <div class="empty-icon">📷</div>
          <div class="empty-title">No Media Found</div>
          <div class="empty-subtitle">
            ${state.items.length === 0 ? 'Your gallery has no uploads yet. Click below to add your first photo or video!' : 'No items match your current filter criteria.'}
          </div>
          <button onclick="document.getElementById('btnQuickAddPhoto').click()" class="btn-admin-primary" style="width:auto;">+ Upload First Photo</button>
        </div>
      `;
      return;
    }

    el.adminGalleryGrid.innerHTML = filtered.map(item => {
      const isVideo = item.media_type === 'video';
      const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      return `
        <div class="admin-gallery-card" data-id="${item.id}">
          <div class="admin-card-media">
            ${isVideo ? 
              `<video src="${item.media_url}" preload="metadata" muted playsinline></video>` : 
              `<img src="${item.media_url}" alt="${escapeHtml(item.title)}" loading="lazy">`
            }
            <span class="card-type-badge">${isVideo ? '🎥 Video' : '📸 Photo'}</span>
            <span class="card-category-badge">${item.category}</span>
          </div>
          <div class="admin-card-body">
            <h4 class="admin-card-title">${escapeHtml(item.title)}</h4>
            <p class="admin-card-desc">${escapeHtml(item.description || 'No description provided.')}</p>
            <div class="admin-card-meta">
              <span>📅 ${formattedDate}</span>
              <span>${item.is_published ? '🟢 Live' : '⚪ Draft'}</span>
            </div>
            <div class="admin-card-actions">
              <button class="btn-card-action btn-card-edit" onclick="window.adminApp.editItem('${item.id}')">
                ✏️ Edit
              </button>
              <button class="btn-card-action btn-card-delete" onclick="window.adminApp.deleteItem('${item.id}')">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // 4. MODAL: UPLOAD & EDIT MEDIA
  // =========================================================================
  function openAddModal(type = 'image') {
    state.currentEditId = null;
    state.selectedFile = null;

    el.formItemId.value = '';
    el.formMediaType.value = type;
    el.formTitle.value = '';
    el.formCategory.value = 'safari';
    el.formDescription.value = '';

    el.modalTitle.textContent = type === 'video' ? 'Upload New Video' : 'Upload New Photo';
    el.btnSaveText.textContent = 'Upload & Publish';

    el.formFileInput.value = '';
    el.formFileInput.accept = type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp';
    el.dropzoneIcon.textContent = type === 'video' ? '🎥' : '📸';
    el.dropzoneText.textContent = type === 'video' ? 'Tap to choose or drop video' : 'Tap to choose or drop photo';
    el.dropzoneHint.textContent = type === 'video' ? 'Supports MP4, WebM (Max 50MB)' : 'Supports JPG, PNG, WEBP (Max 15MB)';

    hidePreview();
    el.fileDropzone.style.display = 'block';
    el.uploadProgressBar.style.display = 'none';
    el.uploadProgressFill.style.width = '0%';

    el.mediaModal.classList.add('active');
  }

  function openEditModal(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    state.currentEditId = itemId;
    state.selectedFile = null;

    el.formItemId.value = item.id;
    el.formMediaType.value = item.media_type;
    el.formTitle.value = item.title;
    el.formCategory.value = item.category;
    el.formDescription.value = item.description || '';

    el.modalTitle.textContent = `Edit ${item.media_type === 'video' ? 'Video' : 'Photo'}`;
    el.btnSaveText.textContent = 'Save Changes';

    // Show existing preview
    showPreview(item.media_url, item.media_type);
    el.dropzoneText.textContent = 'Tap to replace this media file (optional)';

    el.uploadProgressBar.style.display = 'none';
    el.mediaModal.classList.add('active');
  }

  function closeModal() {
    el.mediaModal.classList.remove('active');
    state.selectedFile = null;
    state.currentEditId = null;
  }

  function handleFileSelection(file) {
    if (!file) return;

    const isVideo = el.formMediaType.value === 'video';
    const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024; // 50MB vs 15MB

    if (file.size > maxSize) {
      showToast(`File is too large (${(file.size / (1024*1024)).toFixed(1)}MB). Max allowed: ${isVideo ? '50MB' : '15MB'}`, 'error');
      return;
    }

    state.selectedFile = file;

    // Auto-fill title if empty
    if (!el.formTitle.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      el.formTitle.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    const objectUrl = URL.createObjectURL(file);
    showPreview(objectUrl, isVideo ? 'video' : 'image');
  }

  function showPreview(url, type) {
    el.previewContainer.style.display = 'block';
    if (type === 'video') {
      el.imagePreview.style.display = 'none';
      el.videoPreview.style.display = 'block';
      el.videoPreview.src = url;
    } else {
      el.videoPreview.style.display = 'none';
      el.imagePreview.style.display = 'block';
      el.imagePreview.src = url;
    }
  }

  function hidePreview() {
    el.previewContainer.style.display = 'none';
    el.imagePreview.src = '';
    el.videoPreview.src = '';
  }

  async function handleSaveMedia() {
    const title = el.formTitle.value.trim();
    const category = el.formCategory.value;
    const description = el.formDescription.value.trim();
    const mediaType = el.formMediaType.value;

    if (!title) {
      showToast('Please enter a title.', 'error');
      el.formTitle.focus();
      return;
    }

    // If new item, a file must be selected
    if (!state.currentEditId && !state.selectedFile) {
      showToast('Please select a photo or video to upload.', 'error');
      return;
    }

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) {
      showToast('Supabase client not initialized.', 'error');
      return;
    }

    setModalSaving(true);

    try {
      let mediaUrl = null;
      let storagePath = null;

      // 1. Upload File if selected
      if (state.selectedFile) {
        el.uploadProgressBar.style.display = 'block';
        el.uploadProgressFill.style.width = '30%';

        const ext = state.selectedFile.name.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
        const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
        storagePath = `${mediaType}s/${filename}`;

        const { error: uploadError } = await client.storage
          .from('gallery')
          .upload(storagePath, state.selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        el.uploadProgressFill.style.width = '75%';

        // Get Public URL
        const { data: { publicUrl } } = client.storage
          .from('gallery')
          .getPublicUrl(storagePath);

        mediaUrl = publicUrl;
      }

      el.uploadProgressFill.style.width = '90%';

      // 2. Insert or Update Database Row
      if (state.currentEditId) {
        // Update existing
        const updatePayload = {
          title,
          category,
          description,
          updated_at: new Date().toISOString()
        };
        if (mediaUrl) {
          updatePayload.media_url = mediaUrl;
          updatePayload.storage_path = storagePath;
        }

        const { error: updateError } = await client
          .from('gallery_items')
          .update(updatePayload)
          .eq('id', state.currentEditId);

        if (updateError) throw updateError;
        showToast('Media updated successfully!', 'success');
      } else {
        // Insert new
        const insertPayload = {
          title,
          category,
          description,
          media_type: mediaType,
          media_url: mediaUrl,
          storage_path: storagePath,
          is_published: true,
          sort_order: 0
        };

        const { error: insertError } = await client
          .from('gallery_items')
          .insert([insertPayload]);

        if (insertError) throw insertError;
        showToast(`${mediaType === 'video' ? 'Video' : 'Photo'} uploaded and live on website!`, 'success');
      }

      el.uploadProgressFill.style.width = '100%';
      closeModal();
      await loadGalleryItems();
    } catch (err) {
      console.error('Error saving media:', err);
      showToast('Save failed: ' + (err.message || err.error_description || 'Unknown error'), 'error');
    } finally {
      setModalSaving(false);
    }
  }

  async function handleDeleteItem(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    const confirmed = confirm(`Are you sure you want to permanently delete "${item.title}"?`);
    if (!confirmed) return;

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) return;

    try {
      // 1. Delete from database
      const { error: dbError } = await client
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (dbError) throw dbError;

      // 2. Attempt deleting from storage if storage_path exists
      if (item.storage_path) {
        await client.storage.from('gallery').remove([item.storage_path]);
      }

      showToast('Item deleted successfully.', 'success');
      await loadGalleryItems();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  function setModalSaving(isSaving) {
    state.isUploading = isSaving;
    el.btnSaveMedia.disabled = isSaving;
    el.btnSaveText.textContent = isSaving ? 'Saving...' : (state.currentEditId ? 'Save Changes' : 'Upload & Publish');
  }

  // =========================================================================
  // 5. SETTINGS / CONFIG MODAL
  // =========================================================================
  function openSettingsModal() {
    el.configSupabaseUrl.value = window.BlueToursSupabase.getUrl() || '';
    el.configSupabaseAnonKey.value = window.BlueToursSupabase.getAnonKey() || '';
    el.settingsModal.classList.add('active');
  }

  function closeSettingsModal() {
    el.settingsModal.classList.remove('active');
  }

  function handleSaveSettings() {
    const url = el.configSupabaseUrl.value.trim();
    const key = el.configSupabaseAnonKey.value.trim();

    if (!url || !key) {
      showToast('Both Supabase URL and Anon Key are required.', 'error');
      return;
    }

    window.BlueToursSupabase.setCredentials(url, key);
    closeSettingsModal();
    checkConfigStatus();
    showToast('Credentials saved in browser!', 'success');
    
    // Retry session check
    init();
  }

  // =========================================================================
  // 6. EVENT LISTENERS SETUP
  // =========================================================================
  function setupEventListeners() {
    // Auth Form
    el.adminLoginForm.addEventListener('submit', handleLogin);
    el.btnAdminLogout.addEventListener('click', handleLogout);

    // Password Toggle
    el.btnTogglePassword.addEventListener('click', () => {
      const isPassword = el.loginPassword.type === 'password';
      el.loginPassword.type = isPassword ? 'text' : 'password';
      el.eyeIcon.innerHTML = isPassword ?
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>' :
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    });

    // Quick Action Add Buttons
    el.btnQuickAddPhoto.addEventListener('click', () => openAddModal('image'));
    el.btnQuickAddVideo.addEventListener('click', () => openAddModal('video'));
    el.btnRefreshGrid.addEventListener('click', loadGalleryItems);

    // Filter Tabs (all / photo / video)
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterType = btn.getAttribute('data-type');
        renderGalleryGrid();
      });
    });

    // Filter Category Pills
    el.categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterCategory = pill.getAttribute('data-category');
        renderGalleryGrid();
      });
    });

    // Live Search Input
    el.adminSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderGalleryGrid();
    });

    // Dropzone & File Input
    el.fileDropzone.addEventListener('click', () => el.formFileInput.click());
    el.formFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelection(e.target.files[0]);
      }
    });

    // Drag & Drop
    el.fileDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      el.fileDropzone.classList.add('dragover');
    });
    el.fileDropzone.addEventListener('dragleave', () => el.fileDropzone.classList.remove('dragover'));
    el.fileDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      el.fileDropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelection(e.dataTransfer.files[0]);
      }
    });

    el.btnRemovePreview.addEventListener('click', (e) => {
      e.stopPropagation();
      state.selectedFile = null;
      el.formFileInput.value = '';
      hidePreview();
    });

    // Media Modal Buttons
    el.btnCloseModal.addEventListener('click', closeModal);
    el.btnCancelModal.addEventListener('click', closeModal);
    el.btnSaveMedia.addEventListener('click', handleSaveMedia);

    // Settings Modal
    el.btnOpenSettings.addEventListener('click', openSettingsModal);
    el.btnOpenSetupGuide?.addEventListener('click', (e) => {
      e.preventDefault();
      openSettingsModal();
    });
    el.btnCloseSettings.addEventListener('click', closeSettingsModal);
    el.btnSaveSettings.addEventListener('click', handleSaveSettings);

    // Close Modals on Overlay Click
    el.mediaModal.addEventListener('click', (e) => {
      if (e.target === el.mediaModal && !state.isUploading) closeModal();
    });
    el.settingsModal.addEventListener('click', (e) => {
      if (e.target === el.settingsModal) closeSettingsModal();
    });
  }

  // =========================================================================
  // 7. UTILITIES
  // =========================================================================
  function showToast(msg, type = 'success') {
    el.toastMessage.textContent = msg;
    el.adminToast.className = `admin-toast admin-toast-${type} show`;
    setTimeout(() => {
      el.adminToast.classList.remove('show');
    }, 4000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose methods for inline action buttons
  window.adminApp = {
    editItem: openEditModal,
    deleteItem: handleDeleteItem
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
