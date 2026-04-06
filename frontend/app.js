(function () {
  const state = {
    token: null,
    currentUser: null,
    selectedTicketId: null,
    tickets: [],
    agents: [],
    filters: {
      status: "",
      priority: "",
      search: "",
      page: 1,
      page_size: 20
    }
  };

  const statusLabels = {
    new: "New",
    in_progress: "In Progress",
    waiting_customer: "Waiting Customer",
    resolved: "Resolved"
  };

  const priorityLabels = {
    low: "Low",
    medium: "Medium",
    high: "High"
  };

  const el = {
    loginScreen: document.getElementById("login-screen"),
    appScreen: document.getElementById("app-screen"),
    loginForm: document.getElementById("login-form"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    loginError: document.getElementById("login-error"),
    currentUser: document.getElementById("current-user"),
    logoutButton: document.getElementById("logout-button"),

    metricOpen: document.getElementById("metric-open"),
    metricInProgress: document.getElementById("metric-in-progress"),
    metricOverdue: document.getElementById("metric-overdue"),
    metricResolvedToday: document.getElementById("metric-resolved-today"),
    metricAvgResponse: document.getElementById("metric-avg-response"),

    filterStatus: document.getElementById("filter-status"),
    filterPriority: document.getElementById("filter-priority"),
    filterSearch: document.getElementById("filter-search"),
    ticketsTableBody: document.getElementById("tickets-table-body"),
    ticketsTotal: document.getElementById("tickets-total"),

    detailEmpty: document.getElementById("detail-empty"),
    detailCard: document.getElementById("detail-card"),
    detailTitle: document.getElementById("detail-title"),
    detailMeta: document.getElementById("detail-meta"),
    detailDescription: document.getElementById("detail-description"),
    detailStatus: document.getElementById("detail-status"),
    detailPriority: document.getElementById("detail-priority"),
    detailAssignee: document.getElementById("detail-assignee"),
    saveTicketButton: document.getElementById("save-ticket-button"),

    commentsList: document.getElementById("comments-list"),
    commentForm: document.getElementById("comment-form"),
    commentBody: document.getElementById("comment-body"),
    commentInternal: document.getElementById("comment-internal"),

    createTicketForm: document.getElementById("create-ticket-form"),
    createTitle: document.getElementById("create-title"),
    createDescription: document.getElementById("create-description"),
    createPriority: document.getElementById("create-priority"),
    createCustomerName: document.getElementById("create-customer-name"),
    createCustomerEmail: document.getElementById("create-customer-email"),

    toast: document.getElementById("toast")
  };

  function showToast(message, isError = false) {
    el.toast.textContent = message;
    el.toast.className = "toast visible" + (isError ? " error" : "");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      el.toast.className = "toast";
    }, 2600);
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("ru-RU");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function getAuthHeaders() {
    if (!state.token) return {};
    return {
      Authorization: `Bearer ${state.token}`
    };
  }

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      let detail = "Request failed";
      try {
        const data = await response.json();
        detail = data.detail || JSON.stringify(data);
      } catch (_) {}
      throw new Error(detail);
    }

    return response.json();
  }

  const RealApi = {
    async login(payload) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/auth/login`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    async me() {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/auth/me`);
    },

    async getDashboardOverview() {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/dashboard/overview`);
    },

    async getAgents() {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/users/agents`);
    },

    async getTickets(filters) {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value);
        }
      });

      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets?${params.toString()}`);
    },

    async getTicket(ticketId) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets/${ticketId}`);
    },

    async createTicket(payload) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    async updateTicket(ticketId, payload) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
    },

    async assignTicket(ticketId, payload) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets/${ticketId}/assign`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    },

    async getComments(ticketId) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets/${ticketId}/comments`);
    },

    async addComment(ticketId, payload) {
      return fetchJson(`${window.APP_CONFIG.apiBaseUrl}/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }
  };

  const Api = window.APP_CONFIG.useMockApi ? window.MockApi : RealApi;

  function renderCurrentUser() {
    if (!state.currentUser) {
      el.currentUser.textContent = "Not logged in";
      return;
    }
    el.currentUser.textContent = `${state.currentUser.full_name} · ${state.currentUser.role}`;
  }

  function renderDashboard(data) {
    el.metricOpen.textContent = data.open_tickets ?? 0;
    el.metricInProgress.textContent = data.in_progress_tickets ?? 0;
    el.metricOverdue.textContent = data.overdue_tickets ?? 0;
    el.metricResolvedToday.textContent = data.resolved_today ?? 0;
    el.metricAvgResponse.textContent = `${data.avg_first_response_minutes ?? 0} min`;
  }

  function badgeClass(kind, value) {
    return `badge ${kind} ${value}`;
  }

  function renderTickets() {
    const rows = state.tickets.map((ticket) => {
      return `
        <tr data-ticket-id="${ticket.id}">
          <td>
            <div class="ticket-title">${escapeHtml(ticket.title)}</div>
            <div class="ticket-subtitle">${escapeHtml(ticket.customer_email)}</div>
          </td>
          <td><span class="${badgeClass("status", ticket.status)}">${statusLabels[ticket.status] || ticket.status}</span></td>
          <td><span class="${badgeClass("priority", ticket.priority)}">${priorityLabels[ticket.priority] || ticket.priority}</span></td>
          <td>${ticket.assignee_name ? escapeHtml(ticket.assignee_name) : "—"}</td>
          <td>${formatDate(ticket.created_at)}</td>
        </tr>
      `;
    }).join("");

    el.ticketsTableBody.innerHTML = rows || `
      <tr>
        <td colspan="5" class="empty-row">По текущим фильтрам ничего не найдено</td>
      </tr>
    `;

    document.querySelectorAll("tr[data-ticket-id]").forEach((row) => {
      row.addEventListener("click", () => {
        openTicket(row.dataset.ticketId);
      });
    });
  }

  function setDetailVisible(isVisible) {
    el.detailEmpty.hidden = isVisible;
    el.detailCard.hidden = !isVisible;
  }

  function renderTicketDetail(ticket, comments) {
    setDetailVisible(true);
    el.detailTitle.textContent = `#${ticket.id} · ${ticket.title}`;
    el.detailMeta.innerHTML = `
      <span>${ticket.customer_name} · ${ticket.customer_email}</span>
      <span>Created: ${formatDate(ticket.created_at)}</span>
      <span>Updated: ${formatDate(ticket.updated_at)}</span>
      <span>Due: ${formatDate(ticket.due_at)}</span>
    `;
    el.detailDescription.textContent = ticket.description || "—";

    el.detailStatus.value = ticket.status || "new";
    el.detailPriority.value = ticket.priority || "medium";
    el.detailAssignee.innerHTML = `<option value="">Unassigned</option>` + state.agents.map((agent) => {
      const selected = ticket.assignee_id === agent.id ? "selected" : "";
      return `<option value="${agent.id}" ${selected}>${escapeHtml(agent.full_name)}</option>`;
    }).join("");

    const visibleInternalControl = state.currentUser && state.currentUser.role !== "customer";
    document.getElementById("comment-internal-wrapper").hidden = !visibleInternalControl;
    if (!visibleInternalControl) {
      el.commentInternal.checked = false;
    }

    const ticketActionsVisible = state.currentUser && state.currentUser.role !== "customer";
    document.getElementById("ticket-actions").hidden = !ticketActionsVisible;

    el.commentsList.innerHTML = comments.map((comment) => `
      <article class="comment-card ${comment.is_internal ? "internal" : ""}">
        <div class="comment-header">
          <strong>${escapeHtml(comment.author_name)}</strong>
          <span>${comment.is_internal ? "Internal" : "Public"}</span>
        </div>
        <p>${escapeHtml(comment.body)}</p>
        <small>${formatDate(comment.created_at)}</small>
      </article>
    `).join("") || `<div class="empty-block">Комментариев пока нет</div>`;
  }

  async function loadDashboard() {
    const data = await Api.getDashboardOverview();
    renderDashboard(data);
  }

  async function loadAgents() {
    const agents = await Api.getAgents();
    state.agents = agents;
  }

  async function loadTickets() {
    const result = await Api.getTickets(state.filters);
    state.tickets = result.items || [];
    el.ticketsTotal.textContent = `Всего: ${result.total ?? state.tickets.length}`;
    renderTickets();
  }

  async function openTicket(ticketId) {
    try {
      state.selectedTicketId = Number(ticketId);
      const [ticket, comments] = await Promise.all([
        Api.getTicket(ticketId),
        Api.getComments(ticketId)
      ]);
      renderTicketDetail(ticket, comments);
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function refreshAll() {
    await Promise.all([
      loadDashboard(),
      loadAgents(),
      loadTickets()
    ]);

    if (state.selectedTicketId) {
      await openTicket(state.selectedTicketId);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    el.loginError.textContent = "";

    try {
      const response = await Api.login({
        email: el.loginEmail.value.trim(),
        password: el.loginPassword.value.trim()
      });

      state.token = response.access_token;
      state.currentUser = response.user;
      renderCurrentUser();

      el.loginScreen.hidden = true;
      el.appScreen.hidden = false;

      await refreshAll();
      showToast("Вход выполнен");
    } catch (error) {
      el.loginError.textContent = error.message;
    }
  }

  async function handleLogout() {
    state.token = null;
    state.currentUser = null;
    state.selectedTicketId = null;
    state.tickets = [];
    state.agents = [];
    el.loginScreen.hidden = false;
    el.appScreen.hidden = true;
    setDetailVisible(false);
    renderCurrentUser();
  }

  async function handleFiltersChanged() {
    state.filters.status = el.filterStatus.value;
    state.filters.priority = el.filterPriority.value;
    state.filters.search = el.filterSearch.value.trim();
    state.filters.page = 1;
    await loadTickets();
  }

  async function handleCreateTicket(event) {
    event.preventDefault();

    const payload = {
      title: el.createTitle.value.trim(),
      description: el.createDescription.value.trim(),
      priority: el.createPriority.value,
      customer_name: el.createCustomerName.value.trim(),
      customer_email: el.createCustomerEmail.value.trim()
    };

    if (!payload.title || !payload.description || !payload.customer_name || !payload.customer_email) {
      showToast("Заполни все поля создания тикета", true);
      return;
    }

    try {
      const created = await Api.createTicket(payload);
      el.createTicketForm.reset();
      await refreshAll();
      await openTicket(created.id);
      showToast("Тикет создан");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function handleTicketUpdate() {
    if (!state.selectedTicketId) {
      showToast("Сначала выбери тикет", true);
      return;
    }

    const payload = {
      status: el.detailStatus.value,
      priority: el.detailPriority.value
    };

    try {
      await Api.updateTicket(state.selectedTicketId, payload);

      const selectedAssignee = el.detailAssignee.value;
      if (selectedAssignee) {
        await Api.assignTicket(state.selectedTicketId, {
          assignee_id: Number(selectedAssignee)
        });
      }

      await refreshAll();
      await openTicket(state.selectedTicketId);
      showToast("Тикет обновлён");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  async function handleCommentSubmit(event) {
    event.preventDefault();

    if (!state.selectedTicketId) {
      showToast("Сначала выбери тикет", true);
      return;
    }

    const payload = {
      body: el.commentBody.value.trim(),
      is_internal: el.commentInternal.checked
    };

    if (!payload.body) {
      showToast("Комментарий не может быть пустым", true);
      return;
    }

    try {
      await Api.addComment(state.selectedTicketId, payload);
      el.commentBody.value = "";
      el.commentInternal.checked = false;
      await openTicket(state.selectedTicketId);
      await loadTickets();
      showToast("Комментарий добавлен");
    } catch (error) {
      showToast(error.message, true);
    }
  }

  function bindEvents() {
    el.loginForm.addEventListener("submit", handleLogin);
    el.logoutButton.addEventListener("click", handleLogout);

    el.filterStatus.addEventListener("change", handleFiltersChanged);
    el.filterPriority.addEventListener("change", handleFiltersChanged);
    el.filterSearch.addEventListener("input", handleFiltersChanged);

    el.createTicketForm.addEventListener("submit", handleCreateTicket);
    el.saveTicketButton.addEventListener("click", handleTicketUpdate);
    el.commentForm.addEventListener("submit", handleCommentSubmit);
  }

  function bootstrapDemoCredentials() {
    if (window.APP_CONFIG.useMockApi) {
      el.loginEmail.value = "manager@demo.local";
      el.loginPassword.value = "secret123";
    }
  }

  function init() {
    setDetailVisible(false);
    bindEvents();
    bootstrapDemoCredentials();
    renderCurrentUser();
  }

  init();
})();