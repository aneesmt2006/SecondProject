# SecondProject — Architecture and Engineering Overview

## Executive overview

SecondProject is organized as a containerized, service-oriented healthcare application. Its repository separates the API edge and business capabilities into independently configured services, with dedicated components for identity, user management, medical information, appointments, payments, notifications, tracking, and real-time communication.

The architecture combines synchronous HTTP calls for request/response workflows with message-driven integration for selected asynchronous events. MongoDB is used by data-owning services, Redis supports cache or coordination workloads, and RabbitMQ carries inter-service events. Docker Compose describes a local multi-container environment, while GitHub Actions contains per-service image-build and deployment workflows.

The codebase is primarily TypeScript on Node.js. Most services use Express; communication and notification use NestJS. This is a repository-grounded guide to the structure and technologies, not a claim that every service has identical maturity, test coverage, or operational behavior.

## At a glance

- **Application shape:** multiple independently built Node.js services behind an API gateway.
- **Language and build:** TypeScript, compiled with TypeScript or the NestJS CLI.
- **HTTP frameworks:** Express for the gateway and most domain services; NestJS for communication and notification.
- **Persistence:** MongoDB through Mongoose in several domain services.
- **Coordination and messaging:** Redis and RabbitMQ, with RabbitMQ configuration and consumers visible in appointment, payment, and tracking code.
- **Real-time communication:** NestJS WebSockets and Socket.IO dependencies in communication and notification.
- **Operations:** Docker/Compose, GitHub Actions, Winston/Loki logging, and Prometheus/Grafana-related services in Compose.

## Repository map

The repository root contains the service directories, Docker Compose configuration, and GitHub Actions workflows. Each service owns its package manifest, TypeScript source, configuration, and Dockerfile.

| Path | Responsibility indicated by the implementation |
| --- | --- |
| api-gateway | External HTTP entry point, routing/proxying to downstream services, shared middleware, rate limiting, logging, and metrics. |
| auth-service | Authentication, token and role-related controllers, and identity-oriented configuration. |
| user-management-service | User and doctor profile management, uploads, and related user-facing resources. |
| medical-service | Medical-domain endpoints, including profiles, prescriptions, and question/answer functionality; includes Gemini-related configuration and a pregnancy RAG guide asset. |
| appointment-service | Appointment and slot workflows, service clients, persistence, Redis/RabbitMQ configuration, and event consumers. |
| payment-service | Payment endpoints and Razorpay integration, with RabbitMQ configuration and refund-related event handling. |
| notification-service | Notification processing and delivery components, including event-oriented controllers and gateway abstractions. |
| tracking-service | Symptom-tracking endpoints and RabbitMQ integration. |
| communication-service | Chat modules, message/thread persistence, services, and a WebSocket gateway. |

The service names and source layout establish the capability boundaries; they do not by themselves define every API contract or deployment topology.

## Request and event flows

### HTTP request path

Docker Compose maps the API gateway to port 3000 and configures service URLs for downstream routing. The gateway source includes route definitions, a gateway controller, a proxy service, and middleware for security, errors, request handling, and rate limiting. This establishes the intended edge boundary: clients enter through the gateway, while domain services own their respective business capabilities.

Compose defines the following service ports:

| Component | Container port |
| --- | ---: |
| API gateway | 3000 |
| Authentication | 3001 |
| User management | 3002 |
| Medical | 3003 |
| Appointment | 3011 |
| Payment | 3012 |
| Notification | 3015 |
| Tracking | 3017 |
| Communication | 3035 |

These are the ports described by the checked-in Compose configuration; production ingress and public URLs may differ.

### Asynchronous integration

RabbitMQ is configured in appointment and payment services, and the repository contains event consumers for payment and appointment-related workflows. Notification also has event-oriented components. This supports decoupling work that should not depend on a single synchronous request completing every downstream action.

Appointment code also configures Redis and documents slot-lock timing. Treat the broker topology, retry behavior, and delivery guarantees as implementation-specific; review the service configuration and consumers when changing an event contract.

### Real-time communication

The communication service is organized into chat modules with message and thread models, repositories, services, and a WebSocket gateway. Socket.IO and NestJS WebSocket packages are present in its manifest. Notification also includes gateway-oriented components and related dependencies.

## Technology stack

### Runtime and service frameworks

- **Node.js 20 Alpine containers:** the inspected service Dockerfiles use a Node 20 Alpine build stage and a production stage.
- **TypeScript:** services compile TypeScript to a distribution directory before starting the Node process.
- **Express:** used by the API gateway and the Express-oriented domain services.
- **NestJS:** used by communication and notification, with Nest CLI build/start scripts and module-based source organization.
- **Inversify:** present in multiple Express services for dependency-injection container configuration.

### Data and infrastructure libraries

- **MongoDB and Mongoose:** database configuration and Mongoose usage are present in appointment, authentication, medical, payment, tracking, and user-management areas.
- **Redis:** configured in the API gateway and several services; appointment code uses Redis alongside its slot workflow.
- **RabbitMQ:** amqplib-based configuration is present in appointment and payment, with consumers across event-driven service code.
- **Razorpay:** payment-service dependency and Razorpay instance configuration indicate payment-provider integration.
- **Gemini and LangChain:** medical-service dependencies and configuration indicate Google generative-AI integration and MongoDB-backed retrieval components.
- **Socket.IO:** included for real-time communication capabilities.

### Security, observability, and operations

- **Helmet and CORS:** included in HTTP service middleware/configuration.
- **Rate limiting:** the gateway uses Express rate-limit tooling, including Redis-backed support in its dependencies.
- **Winston and Loki:** gateway logging configuration includes Winston transports and Loki integration; Compose configures Loki logging for services.
- **Prometheus, Alertmanager, Loki, and Grafana:** these observability components are represented in the Compose service list.
- **Docker Compose:** wires the services and their internal URLs, plus infrastructure dependencies.
- **GitHub Actions:** the repository has per-service Docker build/push workflows and per-service deployment workflows triggered by changes on the main branch.

## Source organization and engineering patterns

The Express services generally group code by technical responsibility: controllers, services, repositories, clients, middleware, DTOs/types, constants, and configuration. Several use Inversify to assemble the dependency graph. This separation helps keep transport concerns, domain behavior, and persistence concerns independently understandable.

The NestJS services use module-oriented organization. Communication groups chat controllers, models, repositories, services, and gateway code under its chat module; notification separates controllers, gateways, repositories, and services.

Configuration is service-local. Environment configuration files load dotenv values, and some services explicitly fail startup when required environment values are absent. Database, Redis, RabbitMQ, logging, and external-provider setup live in dedicated configuration modules. Keep secrets in environment configuration or the deployment secret store; do not commit credentials.

## Local development

### Prerequisites

Install a compatible Node.js/npm toolchain for work inside an individual service. Docker and Docker Compose are needed to run the complete repository environment. External integrations also require their own valid configuration, such as database, broker, cache, or provider credentials.

### Run the composed environment

1. Review the root docker-compose.yml and the environment variables required by each service.
2. Create the service-local environment files referenced by Compose, such as api-gateway/.env and the corresponding service .env files. Populate them with local values; never copy production secrets into source control.
3. Build and start the stack from the repository root with Docker Compose using the build option.
4. Check container health and logs before diagnosing an application endpoint. Several service configurations connect to dependencies during startup and may fail fast when those dependencies are unavailable.

Compose supplies internal service URLs and infrastructure endpoints for its network. Do not substitute those container hostnames when running a service outside the Compose network; use host-reachable addresses for that setup.

### Work on one service

Change into the relevant service directory and install that service's dependencies. The Express/TypeScript manifests generally provide build, start, development-watch, and lint scripts. Communication and notification provide NestJS build and start scripts, with Jest-based test scripts.

Run the commands defined in that service's package.json rather than assuming every package exposes the same scripts. Several manifests currently define a placeholder test command that prints an error and exits; the presence of a test script is therefore not proof of a working test suite. The NestJS packages expose Jest test commands. Confirm test coverage and outcomes for the particular service being changed.

## Configuration and deployment

Each service has its own package manifest and container build. The inspected Dockerfiles use a multi-stage pattern: install dependencies and compile in a builder stage, then install production dependencies and copy compiled output into a smaller Node 20 Alpine runtime image.

GitHub Actions contains two workflow families for each service:

1. **Docker build/push workflows** build service-specific images when relevant service files change on main.
2. **Deployment workflows** build and deploy the corresponding service when its paths or workflow definition change on main.

The workflow files reference Docker Hub credentials and deployment configuration through GitHub Actions secrets. Configure those secrets in the repository environment before expecting a workflow to succeed. Review the individual workflow for its exact image tags, target host, rollout procedure, and required secrets; those operational details can vary by service.
