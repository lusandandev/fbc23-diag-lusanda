# Mini Task Tracker

A full stack task management app. It has a Next.js front end communicating with an Express.js REST API, persisted by a SQLite database.

## How to Run Locally

You will need two terminal windows to run both the frontend and backend simultaneously.

### 1. Start the API
This is assuming you have WSL

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

*   **Database: SQLite**
    It requires no external setup or any credentials from mentors. It persists data to a local file, the team can clone and run the project without configuring a database server like Postgres/MSSQL.
*   **Styling: Tailwind CSS**
    It comes pre-configured with Next.js, allows for rapid development of  responsive, accessible UIs without the hassle of multiple CSS files.
*   **Separate `web` and `api` folders**
    To ensure separation of concerns. The Next.js frontend is just for the presentation layer that depends on the Express API gateway to talk to the database.

## Scope & Cuts
Given the time constraints, the following features were scoped out to ensure the core CRUD features and data integrity were flawless:

1.  **Authentication:** Full JWT/OAuth sign-in was cut. The data model and API queries are structured to support a `user_id`, but it is currently hardcoded to `1` to simulate a signed-in state.
2.  **Automated Tests:** Cut in favor of comprehensive manual testing and strict runtime validation in the API controllers.
3.  **Advanced Sorting/Search:** The core status filter was prioritized over full text search.
4.  **Deployment:** Skipped to avoid CORS and Vercel/Render integration issues under time pressure. The local developer experience was prioritized.
