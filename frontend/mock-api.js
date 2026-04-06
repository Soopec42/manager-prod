(function () {
  const users = [
    { id: 1, full_name: "Olivia Manager", email: "manager@demo.local", role: "manager", password: "secret123" },
    { id: 2, full_name: "Daniel Agent", email: "agent@demo.local", role: "agent", password: "secret123" },
    { id: 3, full_name: "Julia Agent", email: "julia@demo.local", role: "agent", password: "secret123" },
    { id: 4, full_name: "Nina Customer", email: "customer@demo.local", role: "customer", password: "secret123" }
  ];

  const tickets = [
    {
      id: 101,
      title: "Customer does not receive email",
      description: "Client says confirmation email never arrives after registration.",
      status: "in_progress",
      priority: "high",
      customer_name: "Nina Carter",
      customer_email: "nina@example.com",
      created_by_id: 4,
      assignee_id: 2,
      assignee_name: "Daniel Agent",
      created_at: "2026-04-03T10:25:00",
      updated_at: "2026-04-03T11:40:00",
      due_at: "2026-04-04T10:25:00"
    },
    {
      id: 102,
      title: "Invoice PDF has wrong logo",
      description: "Brand logo is outdated in generated invoice document.",
      status: "waiting_customer",
      priority: "medium",
      customer_name: "Sarah Wilson",
      customer_email: "sarah@example.com",
      created_by_id: 4,
      assignee_id: 3,
      assignee_name: "Julia Agent",
      created_at: "2026-04-03T08:10:00",
      updated_at: "2026-04-03T12:15:00",
      due_at: "2026-04-05T08:10:00"
    },
    {
      id: 103,
      title: "Payment page returns 500",
      description: "When customer clicks pay, backend responds with 500 error.",
      status: "new",
      priority: "high",
      customer_name: "Alex Brown",
      customer_email: "alex@example.com",
      created_by_id: 4,
      assignee_id: null,
      assignee_name: null,
      created_at: "2026-04-04T07:40:00",
      updated_at: "2026-04-04T07:40:00",
      due_at: "2026-04-05T07:40:00"
    },
    {
      id: 104,
      title: "Password reset link expires too early",
      description: "Reset link becomes invalid within a few minutes.",
      status: "resolved",
      priority: "low",
      customer_name: "Michael Stone",
      customer_email: "michael@example.com",
      created_by_id: 4,
      assignee_id: 2,
      assignee_name: "Daniel Agent",
      created_at: "2026-04-02T14:00:00",
      updated_at: "2026-04-03T16:50:00",
      due_at: "2026-04-03T14:00:00"
    }
  ];

  const comments = {
    101: [
      {
        id: 501,
        ticket_id: 101,
        author_id: 2,
        author_name: "Daniel Agent",
        body: "We are checking SMTP logs now.",
        is_internal: false,
        created_at: "2026-04-03T10:40:00"
      },
      {
        id: 502,
        ticket_id: 101,
        author_id: 1,
        author_name: "Olivia Manager",
        body: "Likely config issue after deploy.",
        is_internal: true,
        created_at: "2026-04-03T10:55:00"
      }
    ],
    102: [
      {
        id: 503,
        ticket_id: 102,
        author_id: 3,
        author_name: "Julia Agent",
        body: "Please attach one broken invoice example.",
        is_internal: false,
        created_at: "2026-04-03T12:16:00"
      }
    ],
    103: [],
    104: [
      {
        id: 504,
        ticket_id: 104,
        author_id: 2,
        author_name: "Daniel Agent",
        body: "Bug fixed and deployed.",
        is_internal: false,
        created_at: "2026-04-03T16:40:00"
      }
    ]
  };

  let activeUser = null;

  function delay(result, ms = 250) {
    return new Promise((resolve) => setTimeout(() => resolve(result), ms));
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function computeOverview() {
    const now = new Date("2026-04-04T12:00:00");
    const openStatuses = ["new", "waiting_customer"];
    return {
      open_tickets: tickets.filter((ticket) => openStatuses.includes(ticket.status)).length,
      in_progress_tickets: tickets.filter((ticket) => ticket.status === "in_progress").length,
      overdue_tickets: tickets.filter((ticket) => new Date(ticket.due_at) < now && ticket.status !== "resolved").length,
      resolved_today: tickets.filter((ticket) => ticket.status === "resolved" && ticket.updated_at.startsWith("2026-04-04")).length,
      avg_first_response_minutes: 18
    };
  }

  function getVisibleComments(ticketId) {
    const ticketComments = comments[ticketId] || [];
    if (!activeUser || activeUser.role === "customer") {
      return ticketComments.filter((item) => !item.is_internal);
    }
    return ticketComments;
  }

  function enrichTicket(ticket) {
    const assignee = users.find((user) => user.id === ticket.assignee_id);
    return {
      ...ticket,
      assignee_name: assignee ? assignee.full_name : null
    };
  }

  function listTickets(filters = {}) {
    const page = Number(filters.page || 1);
    const pageSize = Number(filters.page_size || 20);
    const search = (filters.search || "").trim().toLowerCase();
    const status = filters.status || "";
    const priority = filters.priority || "";

    let items = tickets.slice();

    if (activeUser && activeUser.role === "customer") {
      items = items.filter((ticket) => ticket.created_by_id === activeUser.id);
    }

    if (status) {
      items = items.filter((ticket) => ticket.status === status);
    }

    if (priority) {
      items = items.filter((ticket) => ticket.priority === priority);
    }

    if (search) {
      items = items.filter((ticket) =>
        ticket.title.toLowerCase().includes(search) ||
        ticket.customer_email.toLowerCase().includes(search) ||
        ticket.customer_name.toLowerCase().includes(search)
      );
    }

    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = items.length;
    const start = (page - 1) * pageSize;
    const paged = items.slice(start, start + pageSize).map(enrichTicket);

    return {
      items: clone(paged),
      total,
      page,
      page_size: pageSize
    };
  }

  const MockApi = {
    async login(payload) {
      const user = users.find(
        (item) => item.email === payload.email && item.password === payload.password
      );

      if (!user) {
        throw new Error("Неверный email или пароль");
      }

      activeUser = { ...user };
      const safeUser = { id: user.id, full_name: user.full_name, email: user.email, role: user.role };

      return delay({
        access_token: "mock-jwt-token",
        token_type: "bearer",
        user: safeUser
      });
    },

    async me() {
      if (!activeUser) {
        throw new Error("Пользователь не авторизован");
      }
      return delay({
        id: activeUser.id,
        full_name: activeUser.full_name,
        email: activeUser.email,
        role: activeUser.role
      });
    },

    async getDashboardOverview() {
      return delay(clone(computeOverview()));
    },

    async getAgents() {
      return delay(
        clone(
          users
            .filter((user) => user.role === "agent")
            .map((user) => ({
              id: user.id,
              full_name: user.full_name,
              email: user.email,
              role: user.role
            }))
        )
      );
    },

    async getTickets(filters) {
      return delay(clone(listTickets(filters)));
    },

    async getTicket(ticketId) {
      const ticket = tickets.find((item) => item.id === Number(ticketId));
      if (!ticket) {
        throw new Error("Тикет не найден");
      }

      if (activeUser && activeUser.role === "customer" && ticket.created_by_id !== activeUser.id) {
        throw new Error("Нет доступа к этому тикету");
      }

      return delay(clone(enrichTicket(ticket)));
    },

    async createTicket(payload) {
      const nextId = Math.max(...tickets.map((ticket) => ticket.id)) + 1;
      const now = new Date().toISOString();

      const ticket = {
        id: nextId,
        title: payload.title,
        description: payload.description,
        status: "new",
        priority: payload.priority,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        created_by_id: activeUser ? activeUser.id : 4,
        assignee_id: null,
        assignee_name: null,
        created_at: now,
        updated_at: now,
        due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      tickets.push(ticket);
      comments[nextId] = [];
      return delay(clone(ticket));
    },

    async updateTicket(ticketId, payload) {
      const ticket = tickets.find((item) => item.id === Number(ticketId));
      if (!ticket) {
        throw new Error("Тикет не найден");
      }

      const allowedTransitions = {
        new: ["in_progress"],
        in_progress: ["waiting_customer", "resolved"],
        waiting_customer: ["in_progress"],
        resolved: []
      };

      if (payload.status && payload.status !== ticket.status) {
        const nextAllowed = allowedTransitions[ticket.status] || [];
        if (!nextAllowed.includes(payload.status)) {
          throw new Error("Недопустимый переход статуса");
        }
        ticket.status = payload.status;
      }

      if (payload.priority) {
        ticket.priority = payload.priority;
      }

      ticket.updated_at = new Date().toISOString();
      return delay(clone(enrichTicket(ticket)));
    },

    async assignTicket(ticketId, payload) {
      const ticket = tickets.find((item) => item.id === Number(ticketId));
      if (!ticket) {
        throw new Error("Тикет не найден");
      }

      const assignee = users.find((user) => user.id === Number(payload.assignee_id) && user.role === "agent");
      if (!assignee) {
        throw new Error("Агент не найден");
      }

      ticket.assignee_id = assignee.id;
      ticket.assignee_name = assignee.full_name;
      ticket.updated_at = new Date().toISOString();

      return delay({ message: "Ticket assigned successfully" });
    },

    async getComments(ticketId) {
      return delay(clone(getVisibleComments(Number(ticketId))));
    },

    async addComment(ticketId, payload) {
      const id = Number(ticketId);
      const ticket = tickets.find((item) => item.id === id);
      if (!ticket) {
        throw new Error("Тикет не найден");
      }

      if (activeUser && activeUser.role === "customer" && payload.is_internal) {
        throw new Error("Клиент не может создавать внутренние комментарии");
      }

      const ticketComments = comments[id] || [];
      const nextCommentId = Object.values(comments)
        .flat()
        .reduce((maxId, comment) => Math.max(maxId, comment.id), 500) + 1;

      const newComment = {
        id: nextCommentId,
        ticket_id: id,
        author_id: activeUser ? activeUser.id : 1,
        author_name: activeUser ? activeUser.full_name : "System",
        body: payload.body,
        is_internal: Boolean(payload.is_internal),
        created_at: new Date().toISOString()
      };

      ticketComments.push(newComment);
      comments[id] = ticketComments;
      ticket.updated_at = new Date().toISOString();

      if (payload.is_internal && activeUser && activeUser.role === "customer") {
        return delay(clone({ ...newComment, is_internal: false }));
      }

      return delay(clone(newComment));
    }
  };

  window.MockApi = MockApi;
})();