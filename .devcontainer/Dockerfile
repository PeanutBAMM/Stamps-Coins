FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Install Deno
RUN curl -fsSL https://deno.land/x/install/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# Install Supabase CLI
RUN sudo /bin/sh -c "$(curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh)"

# Install Expo CLI globally
RUN npm install -g expo-cli eas-cli

# Environmental settings for better container performance on Windows
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
# Removed hardcoded 127.0.0.1 to allow LAN connectivity

# Expose Metro Bundler port
EXPOSE 8081
# Expose Supabase API ports
EXPOSE 54321
EXPOSE 54323
