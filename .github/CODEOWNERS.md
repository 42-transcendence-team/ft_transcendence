# ================================================================
# CODEOWNERS
# ================================================================
# Defines who is automatically requested for review when a PR
# changes files in specific paths.
#
# Rules are evaluated top-to-bottom. The last matching rule wins.
# Owners are @github-username.
#
# Update @login with real GitHub usernames!!
# ================================================================


# Default — Todos los archivos seran revisados por el Team Lead
*                                                       @juzzrespecter

# Backend
apps/backend/internals/websockets/                      @Aletheios42

# Frontend
apps/frontend/                                          @Sameidu

# Database schema
apps/backend/migrations/                                @angiebm4
apps/backend/models/                                    @angiebm4 @SecondArsva
apps/backend/routes/                                    @Sameidu

# Infrastructura
/docker-compose*.yml                                     @Aletheios42
/Makefile                                                @Aletheios42

# CI/CD
.github/                                                @Aletheios42
.github/workflows/                                      @Aletheios42
dagger/                                                 @Aletheios42

# Documentación
*.md                                                    @SecondArsva
docs/                                                   @SecondArsva

# Environment config — sensitive, restricted
/.env.example                                            @login
