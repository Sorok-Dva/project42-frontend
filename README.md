<div align="center">
    <img src="https://raw.githubusercontent.com/Sorok-Dva/project42-frontend/refs/heads/main/public/img/logo.png" alt="project42-frontend Logo">
  <h1>Project 42 (LGeL-Like)</h1>
  <blockquote>Revival of LGeL but in a different universe.</blockquote>
  <img src="https://hits.dwyl.com/Sorok-Dva/project-42.svg?style=flat-square" alt="Views"><br />
  <img src="https://img.shields.io/github/downloads/Sorok-Dva/project42-frontend/total.svg?style=for-the-badge" alt="Total downloads">
  <!--<a href="https://shields.io/community#sponsors" alt="Sponsors">
    <img src="https://img.shields.io/opencollective/sponsors/Sorok-Dva.svg?style=for-the-badge" />
  </a>-->
  <a href="https://github.com/Sorok-Dva/project42-frontend/pulse" alt="Activity">
    <img src="https://img.shields.io/github/commit-activity/m/Sorok-Dva/project42-frontend.svg?style=for-the-badge" />
  </a>
  <br />
  <a href="https://github.com/sponsors/Sorok-Dva">
    <img src="https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#EA4AAA" alt="Sponsor Me">
  </a>
  <a href="https://patreon.com/sorokdva">
    <img src="https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white" alt="Support Me on Patreon">
  </a>
</div>

# Project 42 - frontend app

Project 42 is a **multiplayer strategy game** inspired by *Werewolf (Loups-Garous de Thiercelieux)* and *Mafia*, but set in a **unique universe**. Players take on different roles, collaborate, and deceive each other to achieve their objectives. The game blends social deduction mechanics with strategic gameplay elements, offering a fresh take on the genre.

This repository contains the **frontend** of Project 42, built with **React, TypeScript, and Material-UI**, providing an engaging and responsive user experience.

## Table of Contents

- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the dependencies, you can use `npm` or `yarn`.

```bash
npm install
# or
yarn install
```

## Running the Application

To start the application in development mode, run:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3010`.

## Project Structure
The project follows a modular structure for better maintainability:

```
project-42-frontend/
│── src/
│   ├── assets/            # Static assets (images, icons, etc.)
│   ├── components/        # Reusable UI components
│   ├── config/            # Game configuration like users permissions
│   ├── context/           # Global context providers
│   ├── pages/             # Application pages/views
│   ├── services/          # API calls and business logic
│   ├── hooks/             # Custom hooks for state management
│   ├── styles/            # Global and component-specific styles
│   ├── utils/             # Utility functions
│── public/
│── .env                   # Environment variables
│── package.json
│── README.md

```
## Available Scripts

In the project directory, you can run:

- **`npm start`**: Runs the app in development mode.
- **`npm build`**: Builds the app for production.
- **`npm test`**: Launches the test runner.
- **`npm eject`**: Ejects the app configuration.

## Environment Variables

The following environment variables are used in the project:

- **REACT_APP_SENTRY_DSN**: Sentry DSN configuration.
- **REACT_APP_GAME_VERSION**: The API key for TinyMCE editor.

You can create a `.env` file in the root of the project to define these variables.

## Technologies Used

![langs](https://skillicons.dev/icons?i=typescript,react,mui,ubuntu,docker,sass&perline=)

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static typing.
- **React Router**: A library for managing navigation in React applications.
- **Material-UI**: A library for UI components.
- **React Toastify**: A library for displaying notifications and alerts.

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes and commit them.
4. Push your branch to your fork.
5. Open a pull request to the main repository.

### Acknowledgments

- Developed by [Сорок два](https://github.com/Sorok-Dva). All rights reserved.
- Developed with love through ![langs](https://skillicons.dev/icons?i=webstorm&perline=)

### License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Contributors

<a href="https://github.com/sorok-dva/project42-frontend/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sorok-dva/project42-frontend" />
</a>

## Contact

For any inquiries or feedback, please visit our [GitHub Repository](https://github.com/Sorok-Dva/project42-frontend) or contact the developers directly.

