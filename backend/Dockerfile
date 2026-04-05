FROM python:3.12-slim

# Install g++ for compiling C++ binaries
RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Compile all C++ sources in binaries/
RUN find binaries/ -name "*.cpp" | while read src; do \
      out="${src%.cpp}"; \
      g++ -O2 -o "$out" "$src"; \
    done

EXPOSE 5000

CMD ["python", "app.py"]