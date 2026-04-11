FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ARG TARGETARCH

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install Tectonic, the preferred LaTeX engine for this app.
RUN set -eux; \
  case "$TARGETARCH" in \
    amd64) tectonic_arch='x86_64' ;;
    arm64) tectonic_arch='aarch64' ;;
    *) echo "Unsupported architecture: $TARGETARCH" >&2; exit 1 ;;
  esac; \
  curl -fsSL "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.16.2/tectonic-0.16.2-${tectonic_arch}-unknown-linux-gnu.tar.gz" \
    | tar -xz -C /usr/local/bin tectonic

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]