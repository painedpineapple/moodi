# Moodi Product Requirement Document (PRD)

## Overview

Moodi is a decentralized application (dApp) designed to help users track various aspects of their daily well-being through "Life Metrics". By analyzing these metrics and their correlations, users can gain insights into their emotional and physical well-being, enabling them to make informed decisions to enhance their quality of life.

## Objective

To provide a user-friendly platform where individuals can consistently monitor various life metrics, identify patterns, and make informed decisions to improve their overall well-being.

## Business Model

### Pricing Model

Users can earn tokens through engagement streaks, which can be used to pay for their subscriptions, as detailed in the ECONOMY document.

### Incentives

- Users will receive tokens as rewards for maintaining daily entry streaks.
- The specific token rewards for each tier are as follows:
  - **Basic Tier**: Earn up to 0.23 tokens per week and 2 tokens for a full month of daily entries.
  - **Silver Tier**: Earn 1 token per week and 5.67 tokens for a full month of daily entries.
  - **Gold Tier**: Earn 2 tokens per week, 16.33 tokens for a full month of daily entries, and an additional 25 tokens for logging every day for three consecutive months.

## Technology

### Tech Stack

- **Blockchain**: Solana
- **Backend/API Server**: Bun (with ReScript bindings)
  - **Bundler, Test Runner**: Bun
- **Frontend**: ReScript React
  - **Bundler, Test Runner**: Bun
- **Additional Technologies**: cNFTs, DAS, Helius
- **Package Manager**: Bun

### Data Management

- **Storage**: Data will be stored on the Solana blockchain in the form of cNFTs (cryptographic Non-Fungible Tokens).
- **Security**:
  - The data will be encrypted before storage to ensure user privacy and data integrity.
  - Decryption will occur on the client-side using the user's Solana keypair, ensuring that only the user has access to their personal data.

#### Data Encryption for Life Metrics

- **Encryption at Log Time**: When a user logs life metrics, the data will be encrypted before being stored on the blockchain. The encryption ensures that logs are not publicly viewable.
- **Encryption Method**: The implementation of the encryption method is TBD. However, industry-standard encryption algorithms and secure key management practices will be used.

## Features

### Life Metrics Tracking

Users can log various metrics daily, including:

- **High Mood**: Options include psychotic mania, mania, exuberance, happiness, neutral.
- **Low Mood**: Options include psychotic depression, depression, mild depression, sadness, neutral.
- **Sleep Disturbance**: Options are Yes/No.
- **Loss of Appetite**: Options are Yes/No.
- **Irritability**: Options are Yes/No.
- **Exercise**: Options are Yes/No.
- **Medication**: Options are Yes/No.
- **Talk Therapy**: Options are Yes/No.
- **Caffeine Intake**: Options are Yes/No.
- **Notes**: Text input for any additional information or specific events.

### Analysis & Insights

- The app will analyze the user's entries to identify patterns and correlations across different life metrics.
- Users can view graphical representations of their trends over time.
- Recommendations or tips based on the user's patterns.

## MVP

- The MVP will include a basic implementation of the streaks and rewards system.
- Users will be able to track their streaks and see an estimate of the tokens they could earn.
- The primary focus will remain on the core features of metric tracking and visualization.

It will include the following components:

### 1. **User Registration & Authentication**:

- Allow users to register and authenticate using their Solana keypair.
- Ensure secure and seamless user experience.

### 2. **Basic Life Metrics Tracking**:

- Implement the ability for users to log their daily metrics, focusing on the most critical ones like "High Mood", "Low Mood", and "Notes".
- Provide a simple user interface for data input.

#### Eligibility Criteria

- **Minimum Life Metrics**: To qualify for streak rewards, a user must be actively tracking at least 5 life metrics.
- **Recent Logs Requirement**: Only logs for 'Today' or 'Yesterday' are considered for streak rewards to encourage consistent, recent engagement.
- **UI Clarity**: The requirements for streak rewards must be clearly communicated during the user onboarding process and visible within the UI when users are logging their metrics.

### 3. **Data Storage & Retrieval**:

- Store the logged metrics on the Solana blockchain in the form of cNFTs.
- Ensure that data is encrypted before storage and can be decrypted on the client-side.

### 4. **Basic Visualization**:

- Display a simple timeline or calendar view where users can see their logged metrics for the past days.

#### Deliverables

- A functional dApp where users can not only register and log metrics but also track their streaks and potential token rewards.
- Documentation detailing the technical architecture, challenges faced, and potential solutions for the next phases.
- User feedback collection mechanism to gather insights and validate the value proposition of the dApp.

### Success Criteria

- Successful storage and retrieval of encrypted user data on the Solana blockchain.
- Successful integration and demonstration of the streaks and rewards system, with users able to earn and track their tokens.
- Positive user feedback on the clarity and motivational impact of the rewards system.

### Additional Considerations

### Legal & Compliance

- Assess and ensure compliance with financial and cryptocurrency regulations regarding the issuance of tokens as rewards.
- Evaluate the implications of token rewards on taxation for both the company and the users.

### Localization & Internationalization:

- Given the tech stack, consider using libraries or tools that support internationalization (i18n) and localization (l10n) in React. This will allow for easy translation and adaptation of the app for different languages and regions in the future.

### Updates & Maintenance:

- Regularly communicate updates, bug fixes, and new features to users via platforms like GitHub and Twitter.

### Security Audits

- Given the financial implications of the token economy, prioritize comprehensive security audits to protect user investments and company liability.

### User Education

- Develop educational materials to help users understand the token economy, including how to earn, redeem, and the potential value of their tokens.

## Future Features to Consider

- Implementation of a detailed dashboard for users to track their subscription costs, tokens earned, and potential savings.
- Options for users to purchase additional tokens or exchange them within the app, subject to regulatory compliance.
- Expansion of the rewards system to include more diverse actions within the app, such as participating in _community challenges_ or wellness programs.
