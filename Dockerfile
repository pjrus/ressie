FROM node:trixie AS frontend-build
WORKDIR /app

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

FROM node:trixie AS runtime
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates libgraphite2-3 libharfbuzz0b libfreetype6 libfontconfig1 tar \
  && rm -rf /var/lib/apt/lists/*

# Install Tectonic for the appropriate architecture
RUN bash -c '\
  if [ "$(uname -m)" = "aarch64" ] || [ "$(uname -m)" = "arm64" ]; then \
    ARCH="aarch64"; \
  else \
    ARCH="x86_64"; \
  fi && \
  mkdir -p /tmp/tectonic && \
  curl -fsSL "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.16.2/tectonic-0.16.2-${ARCH}-unknown-linux-musl.tar.gz" \
    | tar -xz -C /tmp/tectonic && \
  mv /tmp/tectonic/tectonic /usr/local/bin/tectonic && \
  chmod +x /usr/local/bin/tectonic && \
  rm -rf /tmp/tectonic \
'

COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

COPY backend ./backend
COPY --from=frontend-build /app/frontend/dist ./backend/public

EXPOSE 3001

CMD ["node", "backend/server.js"]