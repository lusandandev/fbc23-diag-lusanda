# Mini Task Tracker

A full stack task management app. It has a Next.js front end communicating with an Express.js REST API, persisted by a SQLite database.

## Prerequisites
- **Node.js:** I tested this on Node v22.
- **OS:** This works natively on Windows, macOS, or Linux.

## How to Run Locally

You will need two terminal windows to run both the frontend and backend simultaneously.

### 1. Start the API
Open your first terminal and navigate to the `api` directory:
\`\`\`bash
cd api
npm install
npm run dev
\`\`\`
The Express server will automatically create a local `dev.db` file and start on **http://localhost:3001**.

### 2. Start the Web App
Open your second terminal and navigate to the `web` directory:
\`\`\`bash
cd web
npm install
npm run dev
\`\`\`
The Next.js application will start on **http://localhost:3000**. Open this URL in your browser to use the app.

---

## My Choices

- **Database: SQLite**
  It requires no external setup or any credentials from mentors. It persists data to a local file, so the team can clone and run the project without configuring a database server like Postgres/MSSQL. You can see my data model in [task-tracker-erd.pdf](./task-tracker-erd.pdf).
- **Styling: Tailwind CSS**
  It comes pre-configured with Next.js, allowing for rapid development of responsive, accessible UIs without the hassle of multiple CSS files.
- **Separate `web` and `api` folders**
  To ensure separation of concerns. The Next.js frontend is just for the presentation layer that depends on the Express API gateway to talk to the database.

## Scope & Cuts
The following features were scoped out of MVP:

1. **Automated Tests:** Cut in favor of manual testing (I manually tested creating, editing, filtering, deleting tasks, and JWT login states in the browser).
2. **Search:** Status filter was prioritized over full text search.
3. **Deployment:** Skipped to avoid CORS and Vercel integration issues under time constraints
