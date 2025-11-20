dev:
    poetry run python freetar/backend.py

# Note do not use podman build. Compose must handle build
build:
    sudo podman compose build

restart:
    sudo podman compose down
    sudo podman compose up -d

# When you want to push updates
redploy: build restart

