# CountPesa - M-Pesa Financial Analytics Web App

CountPesa is a financial analytics tool designed specifically for M-Pesa users, enabling them to visualize and gain insights from their transaction history. The application processes M-Pesa statements, provides interactive visualizations, and offers AI-assisted analysis to help users understand their spending patterns.

For privacy purposes, the app does not store any user data. All data is stored locally in the user's browser. No financial data is stored on any external servers.

## Relevant Links

- [Website](https://countpesa.com)
- [Web App](https://app.countpesa.com)
- [Download App from Google Play](https://play.google.com/store/apps/details?id=com.countpesa&utm_source=website&utm_medium=hero&utm_campaign=web_app_promo)
- [Backend Service](https://github.com/DMGithinji/countpesa-server) - Simple API to process M-Pesa statements

## Key Features

### Transaction Management & Analysis

- **M-Pesa Statement Processing**: Upload M-Pesa PDF statements with automated transaction parsing
- **Transaction Categorization**: Organize transactions into categories and subcategories
- **Advanced Filtering & Multi-dimensional Analysis**: Filter transactions by date, account, category, and reveal insights into spending patterns
- **Mobile App Data Analysis** - Analyze CountPesa App's transactions from a web interface by uploading the backup file

### AI-Powered Features

- **ChatPesa AI Assistant**: Ask questions about your finances in natural language to filter transactions and analyze results
- **Transaction Discovery**: Find transactions with queries like "How much did I spend on food last week?" or "How have I been managing my debt this year?"
- **AI Financial Assessment**: Get personalized insights in either "Serious" or "Roast" mode

### User Experience

- **Privacy-Focused**: All data stored locally in your browser, no server-side storage
- **Offline Capability**: Access your financial data without an internet connection
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Framework**: React with TypeScript
- **Data Storage**: Dexie.js (IndexedDB wrapper)
- **State Management**: Zustand
- **AI Integration**: Google Generative AI (Gemini)
- **UI Components**: ShadCN UI with Tailwind CSS
- **Data Visualization**: Recharts

## Getting Started

### Prerequisites

- Node.js (v18+)
- Google Gemini API key

### Setup

1. Install dependencies:

```bash
yarn install # or npm install --legacy-peer-deps
```

2. Create a `.env` file with your API key:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=backend_api_url
```

3. Start the development server:

```bash
yarn dev
```

Application will be available at <http://localhost:5173>

## Project Structure

The app has the following views:

- Dashboard for overview metrics
- Transaction listing and filtering
- Category management
- Accounts analysis
- AI chat assistant (Sidepanel)

Being a simple web app,it uses a layered architecture with the following structure:

```
src/
├── assets/              # Static resources eg demo-data.json
├── components/          # UI components
├── context/             # React context providers eg for theme, AI, active repository contexts
├── database/            # IndexedDB data access layer
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
├── pages/               # Page components
├── prompts/             # AI prompt templates
├── stores/              # State management
├── types/               # TypeScript type definitions
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Technical Details

### Demo vs. Actual Data

The application supports two modes:

- **Demo Mode**: Pre-loaded sample data that demonstrates all application features
- **User Mode**: User uploads their own M-Pesa statement/data from CountPesa App backup for analysis

Demo mode is triggered through URL paths prefixed with `/demo` (e.g., `/demo/dashboard`). The application detects this and uses a separate database table for demo data.

### Data Flow

1. **Data Entry**: M-Pesa statements are parsed using a backend API
2. **Storage**: Parsed transactions are stored in IndexedDB through Dexie.js
3. **Processing**: Transactions are processed with various utility functions for grouping, filtering, and categorization
4. **Presentation**: Processed data is presented in interactive charts and tables
5. **Interaction**: User interactions update the stores, which then trigger UI updates

### AI Implementation

#### ChatPesa

ChatPesa uses Google's Generative AI (Gemini) to:

1. Parse natural language queries about financial data
2. Generate structured filters to apply to transactions
3. Analyze filtered results to provide insights

The implementation uses a structured prompt system:

- **Initial Prompt**: Provides context about how the app works and expected output format
- **Response Processing**: AI responses are validated and parsed for filters to be applied
- **Follow-up Prompt**: Analyzes results of applied filters
- **Template Components**: Modular prompt pieces in `/prompts/components/`

#### Financial Assessment

The AI financial assessment feature:

1. Collects transaction data and calculates summaries
2. Sends structured financial data to the AI
3. Presents results in "Serious" or "Roast" mode

## Privacy

CountPesa is designed to help you understand your spending habits and make informed financial decisions, but with privacy as a top priority.
