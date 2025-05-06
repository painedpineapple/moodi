# System Architecture

## UI

### Home Screen:

- Logo and "Connect Wallet" button with loading and error states.
- Modal for wallet selection.

### Connected Home Screen:

- Settings icon/button for navigating to the settings page.
- "Log Metric" button to access the logging screen.
- "View Charts" button to display the charts screen.
- List of logged metrics with a visibility filter.

### Settings Page:

- Options to view the connected wallet and disconnect.
- Toggle for daily email reminder notifications and settings for notification time and timezone.

### Logging Screen:

- Form to log daily metrics with a date field, metric options, and a notes field.
- "Today" and "Yesterday" buttons for quick date selection.
- Notice for streak reward eligibility related to the log date.

### New Life Metric Screen:

- Form to create a new life metric with fields for name and metric type (Yes/No, Choices).
- Preset metric types for mood, sleep, appetite, and other health indicators.

### Charts Screen:

- Dual-Axis Line and Bar-Line Charts for metrics visualization.
- Filters for controlling the visibility of specific metrics.

## Backend Services

### Overview

The backend architecture will be structured around microservices to manage interactions with Solana blockchain programs and ensure robust data handling and user engagement through notifications and analytics.

### Microservices Architecture:

#### Blockchain Interaction Service:

- Manages direct interactions with Solana blockchain programs.
- Oversees subscription payments, reward eligibility, claims, and cNFT storage.
- Utilizes Program Derived Addresses (PDAs) with wallet and cNFT assetIds as seeds for managing rewards.

#### User Data Management Service:

- Ensures secure and consistent logging, retrieving, and processing of user metrics.
- Integrates with Sentry for error tracking and operational insights.
- Synchronizes user settings between the blockchain and off-chain databases, with retry mechanisms for robustness.

#### Notification Service:

- Orchestrates the scheduling and delivery of daily email reminders to users based on their preferences.
- Interacts with an email service provider to manage notification timings and user preferences.

### Third-Party Services:

#### Metric Processing:

- Sentry for real-time error tracking and monitoring.
- AWS Lambda, Google Cloud Dataflow, or Apache Kafka for processing user metrics and data streams.

#### Email Notification Provider:

- SendGrid, Mailgun, or Amazon SES to handle user email notifications.
- APIs from these providers will be used for email operations, preference management, and list handling.

### API Endpoints:

#### Subscription Payment:

- Endpoint for users to submit subscription payments, interfacing with Solana blockchain transactions.

#### User Settings Management:

- Endpoint to update user preferences for email notifications, including time of day and timezone.
- Syncs user preferences with the chosen email notification service, with a focus on consistency and error handling.

#### Life Metric Creation and Management:

- Endpoint for users to create and manage life metrics, which are stored as PDAs with metadata on the blockchain.
- Ensures that life metrics are within the operational limits of the Solana transaction capacity.

#### Daily Life Metrics Logging:

- Endpoint for users to log their daily life metrics, resulting in the minting of cNFTs.
- Handles the creation of new cNFTs and updates the blockchain with the logged data.

#### Streak Reward Claiming:

- Endpoint to manage the claiming of streak rewards by users.
- Updates metadata related to the user's reward eligibility and claim status on the blockchain.

### Additional Considerations:

- Implementing a retry method for synchronizing on/off-chain data to handle communication inconsistencies.
- Determining the metadata to be created or updated during streak reward claims, focusing on reward eligibility and fraud prevention.

### Abuse Prevention Mechanisms

- **Behavior Analysis**: Implement systems that analyze user behavior to detect patterns indicative of bots or scripts.
- **Rate Limiting**: Establish rate limits on the frequency of life metric logging to prevent scripted abuse.
- **Challenge-Response Tests**: Use CAPTCHA or other challenge-response tests to ensure that metrics logging is performed by a human.

## Programs

### Subscription Management Program

**Purpose**: Manages user subscriptions, including processing payments and maintaining subscription statuses.

**Instructions**:

- `initialize_subscription`: Sets up a new subscription account for a user.
- `process_payment`: Accepts payment from the user and updates the subscription status accordingly.
- `cancel_subscription`: Ends a user's subscription and performs necessary cleanup operations.

### Reward Management Program

**Purpose**: Manages the distribution and claiming of rewards based on user activities and streaks.

**Instructions**:

- `initialize_reward`: Sets up a reward account or Program Derived Address (PDA) for a user.
- `calculate_reward`: Computes the reward amount based on the user's activity and streaks.
- `claim_reward`: Allows users to claim their earned rewards.
- `burn_mood_token`: Destroys MOODI tokens to remove them from circulation after they are used for payments.

### Life Metric Management Program

**Purpose**: Manages the creation and updating of life metrics and the cNFTs representing daily logs.

**Instructions**:

- `create_life_metric`: Creates a new life metric account with associated metadata for a user.
- `log_daily_life_metrics`: Mints a cNFT representing the daily log of life metrics.
- `update_life_metric`: Updates the metadata associated with a life metric.

**Anti-Gaming Measure**: To prevent gaming of streak rewards, the Solana wallet address will be used as one of the seeds for the PDA that manages the cNFT metadata. This measure ties the reward eligibility to the original wallet that created the cNFT, thereby preventing abuse through transfers.

### Moodi Master Program

**Purpose**: Manages overall app settings and orchestration of different functionalities.

**Instructions**:

- `initialize_master_settings`: Establishes a new master settings account for the app.
- `update_user_settings`: Modifies user settings, like notification timing and preferences.
- `sync_email_notifications`: Synchronizes user preferences with the off-chain email notification service.

### Token Management Program (MOODI Token)

**Purpose**: Manages the MOODI token lifecycle, including minting, burning.

**Instructions**:

- `initialize_mood_token`: Sets up the initial parameters and configurations for the MOODI token.
- `mint_mood_token`: Mints new MOODI tokens into circulation under defined conditions.
- `burn_mood_token`: Removes MOODI tokens from circulation, often used in token economy balancing.

These programs and instructions will ensure that the app's token economy is sustainable and that user engagement is properly incentivized. The programs will need to be built with security and scalability in mind, and thorough testing will be essential to ensure proper operation within the Solana ecosystem.

---

UI needs to include flow with creating, managing, and cancelling subscription and tier
