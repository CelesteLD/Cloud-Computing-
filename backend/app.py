import os
import json
import subprocess
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BINARIES_DIR = os.path.join(os.path.dirname(__file__), "binaries")
DESCRIPTORS_DIR = os.path.join(os.path.dirname(__file__), "descriptors")


def load_descriptors():
    """Load all JSON descriptors from the descriptors directory."""
    descriptors = []
    for filename in os.listdir(DESCRIPTORS_DIR):
        if filename.endswith(".json"):
            filepath = os.path.join(DESCRIPTORS_DIR, filename)
            with open(filepath, "r") as f:
                descriptors.append(json.load(f))
    return descriptors


@app.route("/api/operations", methods=["GET"])
def get_operations():
    """Return the list of all available operations with their descriptors."""
    try:
        descriptors = load_descriptors()
        return jsonify({"operations": descriptors})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/run/<operation_id>", methods=["POST"])
def run_operation(operation_id):
    """Execute the binary associated with operation_id, passing the provided inputs."""
    try:
        # Load the descriptor for this operation
        descriptor_path = os.path.join(DESCRIPTORS_DIR, f"{operation_id}.json")
        if not os.path.exists(descriptor_path):
            return jsonify({"error": f"Operation '{operation_id}' not found"}), 404

        with open(descriptor_path, "r") as f:
            descriptor = json.load(f)

        # Validate and collect inputs in descriptor order
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        args = []
        for inp in descriptor["inputs"]:
            value = data.get(inp["name"])
            if value is None:
                return jsonify({"error": f"Missing input: {inp['name']}"}), 400
            args.append(str(value))

        # Build the binary path and execute
        binary_path = os.path.join(BINARIES_DIR, descriptor["binary"])
        if not os.path.exists(binary_path):
            return jsonify({"error": f"Binary '{descriptor['binary']}' not found"}), 500

        result = subprocess.run(
            [binary_path] + args,
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode != 0:
            return jsonify({"error": result.stderr.strip()}), 500

        return jsonify({
            "operation": descriptor["name"],
            "inputs": data,
            "result": result.stdout.strip()
        })

    except subprocess.TimeoutExpired:
        return jsonify({"error": "Operation timed out"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)