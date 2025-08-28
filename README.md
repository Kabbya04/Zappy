# Zappy ⚡

[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq API](https://img.shields.io/badge/Powered_by-Groq-orange?style=for-the-badge)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

An intelligent, conversational recommender for Games, Anime, and Movies powered by the lightning-fast Groq Cloud API and Next.js.

---

## ✨ About The Project

Zappy is a modern, serverless web application designed to provide personalized recommendations for entertainment. It moves beyond static forms by creating an engaging, conversational experience. Users first answer a dynamic questionnaire, and then can chat with "Zappy," an AI assistant, to discuss the recommendations, ask for more details, or explore related topics.

The entire application is built with a frontend-only architecture using Next.js, with all LLM processing handled directly on the client-side via the Groq Cloud API for incredible speed.

### Core Features

*   **🤖 Intelligent Recommendations:** Powered by `openai/gpt-oss-120b` on the Groq Cloud for high-quality, relevant suggestions.
*   **📝 Dynamic Questionnaire:** A multi-step questionnaire that adapts its questions based on the user's selected category (Game, Anime, or Movie).
*   **✍️ Custom User Input:** An "Other" option in the questionnaire allows users to provide their own answers for more tailored results.
*   **💬 Conversational UI:** A sleek, dashboard-style chat interface to discuss recommendations with the AI.
*   **💅 Beautiful Markdown Rendering:** LLM responses are parsed and displayed in a clean, readable format.
*   **🎨 Dual Theme:** A beautiful and consistent user interface in both light and dark modes.
*   **📱 Fully Responsive:** A great user experience on all devices, from mobile phones to desktops.

## 💻 Tech Stack

This project is built with a modern, frontend-focused technology stack:

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with `@tailwindcss/typography`)
*   **AI/LLM:** [Groq Cloud API](https://groq.com/)
*   **UI Components:** [React](https://reactjs.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Theme Management:** [next-themes](https://github.com/pacocoursey/next-themes)
*   **Markdown Parsing:** [react-markdown](https://github.com/remarkjs/react-markdown) & [remark-gfm](https://github.com/remarkjs/remark-gfm)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js (version 18.x or higher) and npm installed on your machine.

*   `npm`
    ```sh
    npm install npm@latest -g
    ```

### Installation

1.  **Clone the repository**
    ```sh
    git clone https://github.com/your-username/zappy.git
    ```
2.  **Navigate to the project directory**
    ```sh
    cd zappy
    ```
3.  **Install NPM packages**
    ```sh
    npm install
    ```

### Environment Variables

To run the application, you need to provide your Groq Cloud API key.

1.  Create a file named `.env.local` in the root of your project.
2.  Add your API key to the file like so:
    ```
    NEXT_PUBLIC_GROQ_API_KEY="YOUR_GROQ_API_KEY_HERE"
    ```
    You can get a free API key from the [Groq Cloud Console](https://console.groq.com/keys).

### Run the Application

Once the setup is complete, you can run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

The project uses the Next.js App Router and keeps a clean, organized file structure:

```
zappy/
├── app/
│   ├── globals.css         # Global styles and Tailwind directives
│   ├── layout.tsx          # Root layout with theme provider
│   └── page.tsx            # The main application component
├── components/
│   ├── chat-message.tsx    # Component for a single chat bubble
│   ├── recommendation-card.tsx # Card to display a single recommendation
│   ├── recommendation-modal.tsx# Modal for recommendation details
│   └── theme-provider.tsx  # Logic for next-themes
├── lib/
│   └── questions.ts        # Defines the questionnaire structure
├── public/
└── tailwind.config.ts      # Tailwind CSS configuration
```
