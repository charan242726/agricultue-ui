// js/ui.js
// AgroEase Premium UI Handling (Toasts, Skeletons, Dropdowns, Button States)

const UI = {
  // --- TOAST NOTIFICATIONS ---
  toastContainer: null,

  initToastContainer() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'ui-toast-container';
      document.body.appendChild(this.toastContainer);
    }
  },

  toast(message, type = 'success', duration = 3000) {
    this.initToastContainer();
    
    const toastEl = document.createElement('div');
    toastEl.className = `ui-toast ui-toast-${type}`;
    
    let icon = '✅';
    if (type === 'error') icon = '❌';
    else if (type === 'info') icon = 'ℹ️';

    toastEl.innerHTML = `
      <span class="ui-toast-icon">${icon}</span>
      <span class="ui-toast-message">${message}</span>
    `;

    this.toastContainer.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('show');
    });

    setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  },

  // --- BUTTON STATES ---
  setButtonLoading(btnEl, isLoading, text = 'Loading...') {
    if (!btnEl) return;
    if (isLoading) {
      btnEl.dataset.originalText = btnEl.innerHTML;
      btnEl.disabled = true;
      btnEl.classList.add('ui-btn-loading');
      btnEl.innerHTML = `<span class="ui-spinner"></span> ${text}`;
    } else {
      btnEl.disabled = false;
      btnEl.classList.remove('ui-btn-loading');
      if (btnEl.dataset.originalText) {
        btnEl.innerHTML = btnEl.dataset.originalText;
      }
    }
  },

  // --- SKELETON LOADERS ---
  createSkeleton(rows = 3, type = 'text') {
    let html = '';
    for(let i=0; i<rows; i++) {
       html += `<div class="ui-skeleton ui-skeleton-${type}" style="width: ${100 - (i*10)}%; margin-bottom: 8px;"></div>`;
    }
    return html;
  },

  // --- CUSTOM SEARCHABLE DROPDOWN ---
  initDropdown(containerId, options, onSelect, placeholder = 'Select an option') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.classList.add('ui-dropdown-wrapper');
    
    container.innerHTML = `
      <div class="ui-dropdown-header" tabindex="0">
        <span class="ui-dropdown-selected">${placeholder}</span>
        <span class="ui-dropdown-arrow">▼</span>
      </div>
      <div class="ui-dropdown-body">
        <div class="ui-dropdown-search-wrap">
          <input type="text" class="ui-dropdown-search form-input" placeholder="Search..." aria-label="Search" />
        </div>
        <ul class="ui-dropdown-list"></ul>
      </div>
    `;

    const header = container.querySelector('.ui-dropdown-header');
    const body = container.querySelector('.ui-dropdown-body');
    const searchInput = container.querySelector('.ui-dropdown-search');
    const list = container.querySelector('.ui-dropdown-list');
    const selectedText = container.querySelector('.ui-dropdown-selected');
    
    let isOpen = false;
    let selectedValue = null;

    const renderList = (filterText = '') => {
      list.innerHTML = '';
      const filtered = options.filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()));
      
      if (filtered.length === 0) {
        list.innerHTML = '<li class="ui-dropdown-empty">No results found</li>';
        return;
      }

      filtered.forEach(opt => {
        const li = document.createElement('li');
        li.className = 'ui-dropdown-item';
        li.textContent = opt;
        li.dataset.value = opt;
        if (opt === selectedValue) li.classList.add('selected');
        
        li.addEventListener('click', () => {
          selectedValue = opt;
          selectedText.textContent = opt;
          selectedText.classList.add('has-value');
          if (onSelect) onSelect(opt);
          closeDropdown();
        });
        list.appendChild(li);
      });
    };

    const openDropdown = () => {
      isOpen = true;
      body.classList.add('show');
      header.classList.add('active');
      searchInput.value = '';
      renderList();
      searchInput.focus();
    };

    const closeDropdown = () => {
      isOpen = false;
      body.classList.remove('show');
      header.classList.remove('active');
    };

    header.addEventListener('click', () => {
      if (isOpen) closeDropdown();
      else openDropdown();
    });

    searchInput.addEventListener('input', (e) => {
      renderList(e.target.value);
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target) && isOpen) {
        closeDropdown();
      }
    });

    // Keyboard navigation
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
      // Basic arrow support can be added if needed
    });

    // Initial render
    renderList();
    
    // Return an API to interact with it programmatically
    return {
      getValue: () => selectedValue,
      setValue: (val) => {
        selectedValue = val;
        selectedText.textContent = val || placeholder;
        if(val) selectedText.classList.add('has-value');
        else selectedText.classList.remove('has-value');
      },
      setError: (hasError) => {
         if(hasError) header.classList.add('ui-error-border');
         else header.classList.remove('ui-error-border');
      }
    };
  }
};

window.UI = UI;
