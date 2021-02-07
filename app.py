import numpy as np
from flask import Flask, request, render_template, session
from flask_socketio import SocketIO, emit
from simulator.initializer import Initializer
from simulator.classical import ClassicalOptimizer
from simulator.quantum import QuantumOptimizer

app = Flask(__name__)
app.config["SECRET_KEY"] = "verysecret"
socketio = SocketIO(app, async_mode=None)
socketio.init_app(app, cors_allowed_origins="*")


@app.route("/")
def hello():
    return render_template("index.html", async_mode=socketio.async_mode)


@socketio.on("message")
def check_connection(message):
    print(message)


@socketio.on("classical", namespace="/compute")
def solve_classical(message):
    resp = {}
    n, K, xc, yc = (
        message["n"],
        int(message["K"]),
        message["X"],
        message["Y"],
    )
    initializer = Initializer(n)
    instance = initializer.generate_instance(xc, yc)
    classical_optimizer = ClassicalOptimizer(instance, n, K)
    no_of_solutions = str(classical_optimizer.compute_allowed_combinations())
    resp["instance"] = instance.tolist()
    resp["no_of_solutions"] = no_of_solutions
    try:
        x, classical_cost = classical_optimizer.cplex_solution()
        z = [x[ii] for ii in range(n ** 2) if ii // n != ii % n]
        resp["x"] = x.tolist()
        resp["z"] = z
        session["z"] = z
        session["classical_cost"] = classical_cost
    except:
        resp["error"] = "CPLEX maybe missing."
    print(resp)
    emit("classical_response", resp)


@socketio.on("quantum", namespace="/compute")
def solve_quantum(message):
    resp = {}
    n, K, xc, yc = (
        message["n"],
        int(message["K"]),
        message["X"],
        message["Y"],
    )
    initializer = Initializer(n)
    instance = initializer.generate_instance(xc, yc)
    quantum_optimizer = QuantumOptimizer(instance, n, K)

    # Check if the binary representation is correct
    if "z" in session:
        z = session["z"]
        classical_cost = session["classical_cost"]
        Q, g, c, binary_cost = quantum_optimizer.binary_representation(x_sol=z)
        resp["binary_cost"] = binary_cost
        resp["classical_cost"] = classical_cost
        if np.abs(binary_cost - classical_cost) < 0.01:
            resp["conclusion"] = "Binary formulation is correct"
        else:
            resp["conclusion"] = "Error in the binary formulation"
    else:
        resp[
            "conclusion"
        ] = "Could not verify the correctness, due to CPLEX solution being unavailable."
        Q, g, c, binary_cost = quantum_optimizer.binary_representation()
        resp["binary_cost"] = binary_cost

    qp = quantum_optimizer.construct_problem(Q, g, c)
    quantum_solution, quantum_cost = quantum_optimizer.solve_problem(qp)

    resp["quantum_solution"] = quantum_solution.tolist()
    resp["quantum_cost"] = quantum_cost

    # Put the solution in a way that is compatible with the classical variables
    x_quantum = np.zeros(n ** 2)
    kk = 0
    for ii in range(n ** 2):
        if ii // n != ii % n:
            x_quantum[ii] = quantum_solution[kk]
            kk += 1

    resp["x"] = x_quantum.tolist()

    if "z" in session:
        del session["z"]
    print(resp)
    emit("quantum_response", resp)


if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0")
