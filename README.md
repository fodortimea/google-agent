# Google Agent

A Next.js-based AI assistant that integrates with Google services (Gmail, Calendar, Contacts) to help users manage their productivity tasks through natural language interaction.

## Features

### Core Functionality

- **Chat Interface**: Chat UI with support for text, images, and audio messages
- **Google Integration**: Direct access to Gmail, Google Calendar, and Contacts
- **AI-Powered Planning**: Uses Google's Gemini AI to understand user requests and plan appropriate actions
- **Multimodal Input**: Supports text, image uploads, drag-and-drop, and voice recording
- **Audio Feedback**: Text-to-speech responses when audio input is detected

### Google Services Integration

#### Gmail

- Fetch unread emails
- Get emails from today or this week
- Search emails by recipient, subject, or sender
- Send emails to contacts
- Find contact email addresses by name

#### Google Calendar

- View today's events or this week's events
- Search events by name or date
- Create new calendar events
- Move existing events to new dates/times
- Support for multiple calendars

#### Google Contacts

- Automatic contact lookup for email operations
- Fuzzy name matching for finding contacts

### AI Features

- **Plan Generation**: AI analyzes user requests and creates structured action plans
- **Feedback Loop**: System learns from user feedback to improve responses
- **Internet Search**: Integrated Google Search for real-time information
- **Smart Reasoning**: Context-aware decision making based on conversation history

## Tech Stack

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **AI/ML**: Google Gemini 2.0 Flash model via @google/genai
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Supabase for storing interactions and embeddings
- **APIs**: Google APIs (Gmail, Calendar, People/Contacts)
- **Audio**: Web Audio API for recording, text-to-speech conversion

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with enabled APIs (Gmail, Calendar, People)
- Supabase account and database
- Environment variables configured

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create `.env.local`):

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and authenticate with Google

## Usage

1. **Authentication**: Sign in with your Google account to grant access to Gmail, Calendar, and Contacts
2. **Chat**: Use the chat interface to ask questions or request actions:
   - "Show me my unread emails"
   - "What meetings do I have today?"
   - "Send an email to John about the project update"
   - "Create a meeting for tomorrow at 2 PM"
   - "Move my team meeting from Tuesday to Friday"
3. **Multimodal**: Upload images, record voice messages, or drag-and-drop files
4. **Feedback**: Provide feedback on AI responses to improve future interactions

## Project Structure

app/
├── api/agent/route.ts # Main AI agent endpoint
├── components/ # React components
├── hooks/ # Custom React hooks
├── lib/
│ ├── agent/ # AI planning and execution logic
│ ├── auth.config.ts # NextAuth configuration
│ ├── db/ # Supabase client
│ ├── llm/ # AI model clients and TTS
│ └── tools/ # Google API integrations
└── page.tsx # Main chat interface

## Architecture

The application follows a multi-step AI agent pattern:

1. **Input Processing**: Parse user message (text/audio/images)
2. **Plan Generation**: AI creates structured action plan
3. **Feedback Integration**: Apply learnings from previous interactions
4. **Tool Execution**: Execute Google API calls based on plan
5. **Response Generation**: Format results for user presentation
6. **Storage**: Save interaction data for future learning

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with Google services
5. Submit a pull request

## License

This project is private and intended for learning purposes.
