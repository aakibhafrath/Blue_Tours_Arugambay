/* ==========================================================================
   BLUE TOURS ARUGAMBAY - ROOT ADMIN CONTROLLER (admin.js)
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
    isUploading: false,
    listenersAttached: false
  };

  // DOM Elements
  const el = {
    loginSection: document.getElementById('loginSection'),
    dashboardSection: document.getElementById('dashboardSection'),
    configNoticeAlert: document.getElementById('configNoticeAlert'),
    loginAlert: document.getElementById('loginAlert'),
    loginAlertText: document.getElementById('loginAlertText'),
    
    // Login Form
    adminLoginForm: document.getElementById('adminLoginForm'),
    loginKeyGroup: document.getElementById('loginKeyGroup'),
    loginPublishableKey: document.getElementById('loginPublishableKey'),
    btnToggleKeyInline: document.getElementById('btnToggleKeyInline'),
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
    if (!state.listenersAttached) {
      setupEventListeners();
      state.listenersAttached = true;
    }

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
      console.warn('Session retrieval exception:', err);
      showLoginView();
    }
  }

  function checkConfigStatus() {
    const isConfigured = window.BlueToursSupabase && window.BlueToursSupabase.isConfigured();
    if (!isConfigured) {
      if (el.configNoticeAlert) el.configNoticeAlert.classList.add('show');
      if (el.loginKeyGroup) el.loginKeyGroup.style.display = 'flex';
    } else {
      if (el.configNoticeAlert) el.configNoticeAlert.classList.remove('show');
      if (el.loginKeyGroup) el.loginKeyGroup.style.display = 'none';
    }
  }

  function showLoginView() {
    if (el.loginSection) el.loginSection.style.display = 'flex';
    if (el.dashboardSection) el.dashboardSection.style.display = 'none';
  }

  function showDashboardView() {
    if (el.loginSection) el.loginSection.style.display = 'none';
    if (el.dashboardSection) el.dashboardSection.style.display = 'flex';
  }

  // =========================================================================
  // 2. AUTHENTICATION HANDLERS
  // =========================================================================
  async function handleLogin(e) {
    e.preventDefault();
    hideAlert();

    // Check if user entered key in inline input field
    if (el.loginPublishableKey && el.loginPublishableKey.value.trim()) {
      const keyVal = el.loginPublishableKey.value.trim();
      const currentUrl = window.BlueToursSupabase.getUrl() || 'https://lhcdnllntqcnzlrusmsm.supabase.co';
      window.BlueToursSupabase.setCredentials(currentUrl, keyVal);
      checkConfigStatus();
    }

    const email = el.loginEmail.value.trim();
    const password = el.loginPassword.value;

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) {
      showAlert('Please enter your Supabase Publishable / Anon Key first.');
      if (el.loginKeyGroup) {
        el.loginKeyGroup.style.display = 'flex';
        el.loginPublishableKey.focus();
      } else {
        openSettingsModal();
      }
      return;
    }

    setLoginLoading(true);

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        showAlert(error.message || 'Invalid login credentials.');
      } else if (data && data.user) {
        state.user = data.user;
        showToast('Login successful', 'success');
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
      try {
        await client.auth.signOut();
      } catch (err) {
        console.warn('Signout warning:', err);
      }
    }
    state.user = null;
    state.items = [];
    showToast('Logged out successfully', 'success');
    showLoginView();
  }

  function setLoginLoading(isLoading) {
    if (el.btnLoginSubmit) el.btnLoginSubmit.disabled = isLoading;
    if (el.btnLoginText) el.btnLoginText.style.display = isLoading ? 'none' : 'inline';
    if (el.btnLoginSpinner) el.btnLoginSpinner.style.display = isLoading ? 'inline' : 'none';
  }

  function showAlert(msg) {
    if (el.loginAlertText) el.loginAlertText.textContent = msg;
    if (el.loginAlert) el.loginAlert.classList.add('show');
  }

  function hideAlert() {
    if (el.loginAlert) el.loginAlert.classList.remove('show');
  }

  // =========================================================================
  // 3. GALLERY CRUD OPERATIONS
  // =========================================================================
  async function loadGalleryItems() {
    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) return;

    if (el.adminGalleryGrid) {
      el.adminGalleryGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:2.5rem;">
          <div style="font-size:1.1rem; color:var(--turquoise,#00B4D8);">Loading gallery...</div>
        </div>
      `;
    }

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
      showToast('Error loading gallery: ' + err.message, 'error');
      if (el.adminGalleryGrid) {
        el.adminGalleryGrid.innerHTML = `
          <div class="admin-empty-state">
            <div class="empty-icon">⚠️</div>
            <div class="empty-title">Failed to load gallery</div>
            <div class="empty-subtitle">${escapeHtml(err.message)}</div>
            <button id="btnRetryLoad" class="btn-admin-primary" style="width:auto;">Retry</button>
          </div>
        `;
        document.getElementById('btnRetryLoad')?.addEventListener('click', loadGalleryItems);
      }
    }
  }

  function updateMetrics() {
    const photos = state.items.filter(i => i.media_type === 'image').length;
    const videos = state.items.filter(i => i.media_type === 'video').length;
    if (el.statTotalPhotos) el.statTotalPhotos.textContent = photos;
    if (el.statTotalVideos) el.statTotalVideos.textContent = videos;
    if (el.statTotalMedia) el.statTotalMedia.textContent = state.items.length;
  }

  function renderGalleryGrid() {
    if (!el.adminGalleryGrid) return;
    let filtered = state.items;

    // Filter by type
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
            ${state.items.length === 0 ? 'Your gallery has no uploads yet. Click below to add your first photo!' : 'No items match your search or filter.'}
          </div>
          <button onclick="document.getElementById('btnQuickAddPhoto').click()" class="btn-admin-primary" style="width:auto;">+ Add First Photo</button>
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
            <span class="card-category-badge">${escapeHtml(item.category)}</span>
          </div>
          <div class="admin-card-body">
            <h4 class="admin-card-title">${escapeHtml(item.title)}</h4>
            <p class="admin-card-desc">${escapeHtml(item.description || 'No description.')}</p>
            <div class="admin-card-meta">
              <span>📅 ${formattedDate}</span>
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

    if (el.formItemId) el.formItemId.value = '';
    if (el.formMediaType) el.formMediaType.value = type;
    if (el.formTitle) el.formTitle.value = '';
    if (el.formCategory) el.formCategory.value = 'safari';
    if (el.formDescription) el.formDescription.value = '';

    if (el.modalTitle) el.modalTitle.textContent = type === 'video' ? 'Upload New Video' : 'Upload New Photo';
    if (el.btnSaveText) el.btnSaveText.textContent = type === 'video' ? 'Upload Video' : 'Upload Photo';

    if (el.formFileInput) {
      el.formFileInput.value = '';
      el.formFileInput.accept = type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*';
    }
    if (el.dropzoneIcon) el.dropzoneIcon.textContent = type === 'video' ? '🎥' : '📸';
    if (el.dropzoneText) el.dropzoneText.textContent = type === 'video' ? 'Tap to select video from phone' : 'Tap to select photo from phone';
    if (el.dropzoneHint) el.dropzoneHint.textContent = type === 'video' ? 'Supports MP4, WebM (Max 50MB)' : 'Supports JPG, PNG, WEBP (Max 15MB)';

    hidePreview();
    if (el.fileDropzone) el.fileDropzone.style.display = 'block';
    if (el.uploadProgressBar) el.uploadProgressBar.style.display = 'none';
    if (el.uploadProgressFill) el.uploadProgressFill.style.width = '0%';

    if (el.mediaModal) el.mediaModal.classList.add('active');
  }

  function openEditModal(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    state.currentEditId = itemId;
    state.selectedFile = null;

    if (el.formItemId) el.formItemId.value = item.id;
    if (el.formMediaType) el.formMediaType.value = item.media_type;
    if (el.formTitle) el.formTitle.value = item.title;
    if (el.formCategory) el.formCategory.value = item.category;
    if (el.formDescription) el.formDescription.value = item.description || '';

    if (el.modalTitle) el.modalTitle.textContent = `Edit ${item.media_type === 'video' ? 'Video' : 'Photo'}`;
    if (el.btnSaveText) el.btnSaveText.textContent = 'Save Changes';

    showPreview(item.media_url, item.media_type);
    if (el.dropzoneText) el.dropzoneText.textContent = 'Tap to replace media file (optional)';

    if (el.uploadProgressBar) el.uploadProgressBar.style.display = 'none';
    if (el.mediaModal) el.mediaModal.classList.add('active');
  }

  function closeModal() {
    if (el.mediaModal) el.mediaModal.classList.remove('active');
    state.selectedFile = null;
    state.currentEditId = null;
  }

  function handleFileSelection(file) {
    if (!file) return;

    const isVideo = el.formMediaType.value === 'video';
    const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024; // 50MB vs 15MB

    if (file.size > maxSize) {
      showToast(`File too large (${(file.size / (1024*1024)).toFixed(1)}MB). Max: ${isVideo ? '50MB' : '15MB'}`, 'error');
      return;
    }

    state.selectedFile = file;

    if (!el.formTitle.value.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      el.formTitle.value = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }

    const objectUrl = URL.createObjectURL(file);
    showPreview(objectUrl, isVideo ? 'video' : 'image');
  }

  function showPreview(url, type) {
    if (el.previewContainer) el.previewContainer.style.display = 'block';
    if (type === 'video') {
      if (el.imagePreview) el.imagePreview.style.display = 'none';
      if (el.videoPreview) {
        el.videoPreview.style.display = 'block';
        el.videoPreview.src = url;
      }
    } else {
      if (el.videoPreview) el.videoPreview.style.display = 'none';
      if (el.imagePreview) {
        el.imagePreview.style.display = 'block';
        el.imagePreview.src = url;
      }
    }
  }

  function hidePreview() {
    if (el.previewContainer) el.previewContainer.style.display = 'none';
    if (el.imagePreview) el.imagePreview.src = '';
    if (el.videoPreview) el.videoPreview.src = '';
  }

  async function handleSaveMedia() {
    const title = el.formTitle.value.trim();
    const category = el.formCategory.value;
    const description = el.formDescription.value.trim();
    const mediaType = el.formMediaType.value;

    if (!title) {
      showToast('Please enter a title', 'error');
      el.formTitle.focus();
      return;
    }

    if (!state.currentEditId && !state.selectedFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) {
      showToast('Supabase client not ready', 'error');
      return;
    }

    setModalSaving(true);

    try {
      let mediaUrl = null;

      // 1. Upload file if selected
      if (state.selectedFile) {
        if (el.uploadProgressBar) el.uploadProgressBar.style.display = 'block';
        if (el.uploadProgressFill) el.uploadProgressFill.style.width = '25%';

        const ext = state.selectedFile.name.split('.').pop() || (mediaType === 'video' ? 'mp4' : 'jpg');
        const uniqueFileName = `${mediaType}s/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;

        const { error: uploadError } = await client.storage
          .from('gallery')
          .upload(uniqueFileName, state.selectedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        if (el.uploadProgressFill) el.uploadProgressFill.style.width = '70%';

        const { data: { publicUrl } } = client.storage
          .from('gallery')
          .getPublicUrl(uniqueFileName);

        mediaUrl = publicUrl;
      }

      if (el.uploadProgressFill) el.uploadProgressFill.style.width = '90%';

      // 2. Insert or update in gallery_items table
      if (state.currentEditId) {
        const updatePayload = {
          title,
          category,
          description
        };
        if (mediaUrl) {
          updatePayload.media_url = mediaUrl;
          updatePayload.media_type = mediaType;
        }

        const { error: updateError } = await client
          .from('gallery_items')
          .update(updatePayload)
          .eq('id', state.currentEditId);

        if (updateError) throw updateError;
        showToast('Updated successfully', 'success');
      } else {
        const insertPayload = {
          title,
          category,
          description,
          media_type: mediaType,
          media_url: mediaUrl
        };

        const { error: insertError } = await client
          .from('gallery_items')
          .insert([insertPayload]);

        if (insertError) throw insertError;
        showToast(`${mediaType === 'video' ? 'Video' : 'Photo'} uploaded successfully`, 'success');
      }

      if (el.uploadProgressFill) el.uploadProgressFill.style.width = '100%';
      closeModal();
      await loadGalleryItems();
    } catch (err) {
      console.error('Error saving media:', err);
      showToast(err.message || 'Upload failed. Check storage permissions.', 'error');
    } finally {
      setModalSaving(false);
    }
  }

  async function handleDeleteItem(itemId) {
    const item = state.items.find(i => i.id === itemId);
    if (!item) return;

    const confirmed = confirm(`Delete "${item.title}"?`);
    if (!confirmed) return;

    const client = window.BlueToursSupabase ? window.BlueToursSupabase.getClient() : null;
    if (!client) return;

    try {
      const { error: dbError } = await client
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (dbError) throw dbError;

      if (item.media_url && item.media_url.includes('/gallery/')) {
        try {
          const parts = item.media_url.split('/gallery/');
          if (parts[1]) {
            const storagePath = decodeURIComponent(parts[1].split('?')[0]);
            await client.storage.from('gallery').remove([storagePath]);
          }
        } catch (e) {
          console.warn('Storage removal notice:', e);
        }
      }

      showToast('Deleted successfully', 'success');
      await loadGalleryItems();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Delete failed: ' + err.message, 'error');
    }
  }

  function setModalSaving(isSaving) {
    state.isUploading = isSaving;
    if (el.btnSaveMedia) el.btnSaveMedia.disabled = isSaving;
    if (el.btnSaveText) el.btnSaveText.textContent = isSaving ? 'Uploading...' : (state.currentEditId ? 'Save Changes' : 'Upload');
  }

  // =========================================================================
  // 5. SETTINGS / CONFIG MODAL
  // =========================================================================
  function openSettingsModal() {
    if (el.configSupabaseUrl) el.configSupabaseUrl.value = window.BlueToursSupabase.getUrl() || 'https://lhcdnllntqcnzlrusmsm.supabase.co';
    if (el.configSupabaseAnonKey) el.configSupabaseAnonKey.value = window.BlueToursSupabase.getPublishableKey() || '';
    if (el.settingsModal) el.settingsModal.classList.add('active');
  }

  function closeSettingsModal() {
    if (el.settingsModal) el.settingsModal.classList.remove('active');
  }

  function handleSaveSettings() {
    const url = el.configSupabaseUrl.value.trim();
    const key = el.configSupabaseAnonKey.value.trim();

    if (!url || !key) {
      showToast('Both URL and Publishable Key are required', 'error');
      return;
    }

    window.BlueToursSupabase.setCredentials(url, key);
    closeSettingsModal();
    checkConfigStatus();
    showToast('Credentials saved in browser', 'success');

    // Attempt re-check session or prepare client
    const client = window.BlueToursSupabase.getClient();
    if (client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          state.user = session.user;
          showDashboardView();
          loadGalleryItems();
        } else {
          showLoginView();
        }
      }).catch(() => {
        showLoginView();
      });
    }
  }

  // =========================================================================
  // 6. EVENT LISTENERS SETUP
  // =========================================================================
  function setupEventListeners() {
    if (el.adminLoginForm) el.adminLoginForm.addEventListener('submit', handleLogin);
    if (el.btnAdminLogout) el.btnAdminLogout.addEventListener('click', handleLogout);

    // Toggle inline key input field on login page
    if (el.btnToggleKeyInline) {
      el.btnToggleKeyInline.addEventListener('click', () => {
        if (el.loginKeyGroup) {
          const isHidden = el.loginKeyGroup.style.display === 'none';
          el.loginKeyGroup.style.display = isHidden ? 'flex' : 'none';
          if (isHidden && el.loginPublishableKey) el.loginPublishableKey.focus();
        }
      });
    }

    // Password Toggle
    if (el.btnTogglePassword) {
      el.btnTogglePassword.addEventListener('click', () => {
        const isPassword = el.loginPassword.type === 'password';
        el.loginPassword.type = isPassword ? 'text' : 'password';
        el.eyeIcon.innerHTML = isPassword ?
          '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>' :
          '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      });
    }

    // Quick Action Buttons
    if (el.btnQuickAddPhoto) el.btnQuickAddPhoto.addEventListener('click', () => openAddModal('image'));
    if (el.btnQuickAddVideo) el.btnQuickAddVideo.addEventListener('click', () => openAddModal('video'));
    if (el.btnRefreshGrid) el.btnRefreshGrid.addEventListener('click', loadGalleryItems);

    // Filter Tabs
    el.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        el.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.filterType = btn.getAttribute('data-type');
        renderGalleryGrid();
      });
    });

    // Category Pills
    el.categoryPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.filterCategory = pill.getAttribute('data-category');
        renderGalleryGrid();
      });
    });

    // Live Search
    if (el.adminSearchInput) {
      el.adminSearchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.trim();
        renderGalleryGrid();
      });
    }

    // Dropzone & File Picker
    if (el.fileDropzone) el.fileDropzone.addEventListener('click', () => el.formFileInput.click());
    if (el.formFileInput) {
      el.formFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFileSelection(e.target.files[0]);
        }
      });
    }

    if (el.btnRemovePreview) {
      el.btnRemovePreview.addEventListener('click', (e) => {
        e.stopPropagation();
        state.selectedFile = null;
        if (el.formFileInput) el.formFileInput.value = '';
        hidePreview();
      });
    }

    // Modal Action Buttons
    if (el.btnCloseModal) el.btnCloseModal.addEventListener('click', closeModal);
    if (el.btnCancelModal) el.btnCancelModal.addEventListener('click', closeModal);
    if (el.btnSaveMedia) el.btnSaveMedia.addEventListener('click', handleSaveMedia);

    // Settings Modal
    if (el.btnOpenSettings) el.btnOpenSettings.addEventListener('click', openSettingsModal);
    if (el.btnOpenSetupGuide) {
      el.btnOpenSetupGuide.addEventListener('click', (e) => {
        e.preventDefault();
        openSettingsModal();
      });
    }
    if (el.btnCloseSettings) el.btnCloseSettings.addEventListener('click', closeSettingsModal);
    if (el.btnSaveSettings) el.btnSaveSettings.addEventListener('click', handleSaveSettings);

    // Close on backdrop tap
    if (el.mediaModal) {
      el.mediaModal.addEventListener('click', (e) => {
        if (e.target === el.mediaModal && !state.isUploading) closeModal();
      });
    }
    if (el.settingsModal) {
      el.settingsModal.addEventListener('click', (e) => {
        if (e.target === el.settingsModal) closeSettingsModal();
      });
    }
  }

  // =========================================================================
  // 7. UTILITIES
  // =========================================================================
  function showToast(msg, type = 'success') {
    if (!el.adminToast) return;
    el.toastMessage.textContent = msg;
    el.adminToast.className = `admin-toast admin-toast-${type} show`;
    setTimeout(() => {
      el.adminToast.classList.remove('show');
    }, 3500);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose methods for action buttons
  window.adminApp = {
    editItem: openEditModal,
    deleteItem: handleDeleteItem
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
