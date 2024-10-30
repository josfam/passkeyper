# Passkeyper
> A user-friendly, secure password manager, on the web

## Inspiration
Passkeyper represents the journey we've taken in our ALX software engineering program. It's not just about code; it’s the result of our growth, countless late nights troubleshooting, and the excitement of finally blending everything we’ve learned into one project. We wanted to build something meaningful, something people could find useful. Passkeyper is our way of saying, "This is how far we've come, and we're excited about where we're headed next."

## Table of Contents

- [Passkeyper](#passkeyper)
  - [Inspiration](#inspiration)
  - [Table of Contents](#table-of-contents)
  - [The Premise](#the-premise)
  - [The Team](#the-team)
  - [Technologies](#technologies)
  - [Architecture](#architecture)
  - [Demo](#demo)
  - [Project Setup](#project-setup)
    - [Installation/Configuration](#installationconfiguration)
      - [database](#database)
      - [backend](#backend)
      - [frontend](#frontend)
  - [Future Plans](#future-plans)
  - [Acknowledgements](#acknowledgements)
  - [License](#license)

## The Premise
This project is the **MVP** of our Portfolio Project, concluding our backend specilization track at [Alx Africa](https://www.alxafrica.com/). We were able to choose who we wanted to work with and what we wanted to work on, as long as we present a working program at the end of the two weeks of development.

## The Team
The project was developed by:
- Hagar Samy: [`LinkedIn`](linkedin.com/in/hagar-samy-420414220) || [`X`](https://x.com/HagarSamy0)
- Joseph Amukun: [`LinkedIn`](linkedin.com/in/amukun) || [`X`](https://x.com/joamkun)
- Khalid Lazrag: [`LinkedIn`](linkedin.com/in/khalid-lazrag-91305423a) || [`X`](https://x.com/khalid__py)
- Ebube Ochemba: [`LinkedIn`](linkedin.com/in/ebubechukwu-ochemba-34bab5268) || [`X`](https://x.com/ebube116)

## Technologies
- Backend
  - `Python`
  - `Flask`
- Frontend
  - `React`
  - `TypeScript`
  - `Tailwind`
- Database
  - `PostgreSQL`

## Architecture
coming soon...

## Demo
Watch our product demo to see Passkeyper in action:

<div align="center">
  <a href="https://drive.google.com/file/d/1FSTyShrJJBN8cBAaTweOcsVNU2IW_J3W/view?usp=drive_link">
    <img src="https://img.shields.io/badge/Watch_Demo-4285F4?style=for-the-badge&logo=google-drive&logoColor=white" alt="Watch Demo" />
  </a>
</div>

### Key Features Showcased
- Secure password storage and management
- Intuitive user interface
- Easy password organization
- Quick access to saved credentials
- Zero-knowledge architecture

## Project Setup
Clone the repo
```sh
$ git clone git@github.com:josfam/passkeyper.git
$ cd passkeyper/
```

### Installation/Configuration
Dependencies - [`backend`](/backend/requirements.txt) || [`frontend`](/frontend/package.json)

#### database
setup your postgres database
[www.postgresql.org](https://www.postgresql.org/)

#### backend
- setup your environmental variables:
```sh
DATABASE_URI_STRING="<YOUR_DATABASE_URI>"
SECRET_KEY="<YOUR_SECRET_KEY>"
CLIENT_ADDRESS="http://localhost:5173"
```
- in one terminal, from the root directory:
```sh
$ cd backend
$ pip3 install virtualenv
$ virtualenv .venv
$ source .venv/bin/activate
$ pip3 install -r requirements.txt
$ ...
$ <done>
$ flask db init
$ flask db migrate
$ flask run
```

#### frontend
- setup your environmental variables:
```sh
VITE_FLASK_APP_API_URL='http://127.0.0.1:5000/'
```
- in another terminal, from the root directory:
```sh
$ cd frontend
$ npm install
$ ...
$ <done>
$ npm run dev
```

## Future Plans
- Browser extension
- Account recovery
- Full email and password monitoring
- 2-step verification / 2 Factor

## Acknowledgements
All work contained in this project was completed as part of the curriculum for Alx. ALX is a leading technology training provider, built to accelerate the careers of young Africans through the technology and professional skills that enable them to thrive in the digital economy. The program prepares students for careers in the tech industry using project-based peer learning. For more information, visit [Alx Africa](https://www.alxafrica.com/).

## License
[MIT License](/LICENSE)