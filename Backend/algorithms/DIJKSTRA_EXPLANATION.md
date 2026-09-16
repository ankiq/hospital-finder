# Dijkstra's Algorithm & Graph Routing Explanation

## 1. Overview & Objective

In the **Emergency Hospital Finder System**, routing efficiency is a matter of life and death. The objective of our dynamic routing engine (`routing.cpp`) is to calculate the shortest path, estimated time of arrival (ETA), and optimal hospital ranking between a patient's emergency GPS location and nearby medical facilities.

To achieve sub-millisecond route calculation, the routing engine is written in **C++17**, compiled with high-level optimization (`g++ -O3`), and called dynamically from Node.js using a native execution bridge (`nativeBridge.js`).

---

## 2. Graph Fundamentals: Nodes and Edges

A road network is modeled as a **Weighted Directed Graph** \( G = (V, E) \):
- **\( V \)** is the set of **Nodes** (Vertices).
- **\( E \)** is the set of **Edges** (Road segments with weights).

```
        (Node 1) ------ 5.1 km ------ (Node 3)
        /     \                         |
     4.2 km   1.2 km                  2.1 km
      /         \                       |
  (Node 0) --- 2.5 km ---> (Node 2) --- 8.3 km ---> (Node 4) --- 4.7 km ---> (Node 5)
```

---

### A. What is a Node (Vertex)?

In our system, a **Node** represents a key geographic location or intersection:
1. **Patient Location**: The starting node representing the patient's real-time GPS coordinates `(lat1, lng1)`.
2. **Road Intersections / Waypoints**: Intermediate map coordinates connecting road segments.
3. **Hospital Facilities**: Destination nodes representing registered emergency hospitals `(lat2, lng2)`.

#### C++ Node Definition
In `routing.cpp`, a node is represented as:

```cpp
struct Node {
    int id;           // Unique identifier for the node/intersection
    double dist;      // Accumulated shortest distance from the source node

    // Operator overload to order min-heap (Min-Priority Queue)
    bool operator>(const Node& other) const {
        return dist > other.dist;
    }
};
```

---

### B. What is an Edge?

An **Edge** represents a navigable road segment connecting two nodes (e.g., from Node `u` to Node `v`). 

#### Edge Weight Calculation (Haversine & Urban Road Factor)
The edge weight is not arbitrary; it is computed dynamically using the **Haversine Formula** (great-circle geographical distance) modified with an urban road curvature factor:

1. **Haversine Formula**:
   \[
   a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)
   \]
   \[
   c = 2 \cdot \operatorname{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)
   \]
   \[
   d = R \cdot c \quad (\text{where } R = 6371 \text{ km})
   \]

2. **Urban Road Curvature Multiplier**:
   Direct line (as the crow flies) distance is multiplied by a **1.25x factor** to account for real-world road geometry, city blocks, and turns:
   \[
   \text{Road Distance} = \text{Haversine Distance} \times 1.25
   \]

#### C++ Edge Structure & Adjacency List
Edges are stored in an **Adjacency List** `vector<vector<Edge>> adj`:

```cpp
struct Edge {
    int to;            // Neighboring node ID
    double distance;   // Edge weight (road distance in KM)
};

// Adjacency List: adj[u] contains all outgoing edges from node u
vector<vector<Edge>> adj(totalNodes);
```

---

## 3. How Dijkstra's Algorithm Works (Step-by-Step)

Dijkstra's Algorithm finds the shortest path from a single source node to all other nodes in a graph with non-negative edge weights using a **Greedy Strategy** aided by a **Min-Priority Queue** (Min-Heap).

### Step-by-Step Execution Flow

1. **Initialization**:
   - Set `dist[start] = 0` (distance to source is 0).
   - Set `dist[v] = ∞` for all other nodes.
   - Initialize `parent[v] = -1` to reconstruct the path later.
   - Push `{start, 0}` into the Min-Priority Queue (`pq`).

2. **Node Extraction (Greedy Choice)**:
   - Extract the node `u` with the smallest tentative distance `d` from `pq`.
   - If `d > dist[u]`, skip it (outdated distance entry).

3. **Edge Relaxation**:
   - For each outgoing edge `(u -> v)` with weight `w`:
   - Check if passing through `u` offers a shorter path to `v`:
     \[
     \text{if } dist[u] + w < dist[v] \implies dist[v] = dist[u] + w, \quad parent[v] = u
     \]
   - Push `{v, dist[v]}` into `pq`.

4. **Termination & Path Reconstruction**:
   - Repeat until `pq` is empty.
   - Trace backwards from `destNode` using `parent[]` to obtain the exact sequence of nodes along the shortest path.

---

## 4. C++ Implementation (`routing.cpp`)

```cpp
pair<vector<double>, vector<int>> dijkstra(int start, int totalNodes, const vector<vector<Edge>>& adj) {
    vector<double> dist(totalNodes, numeric_limits<double>::infinity());
    vector<int> parent(totalNodes, -1);
    priority_queue<Node, vector<Node>, greater<Node>> pq;

    // Step 1: Start node initialization
    dist[start] = 0;
    pq.push({start, 0});

    while (!pq.empty()) {
        int u = pq.top().id;
        double d = pq.top().dist;
        pq.pop();

        if (d > dist[u]) continue; // Skip outdated entries

        // Step 2 & 3: Relax adjacent edges
        for (const auto& edge : adj[u]) {
            if (dist[u] + edge.distance < dist[edge.to]) {
                dist[edge.to] = dist[u] + edge.distance;
                parent[edge.to] = u; // Track shortest path parent
                pq.push({edge.to, dist[edge.to]});
            }
        }
    }
    return {dist, parent};
}
```

---

## 5. System Integration & Execution Pipeline

```
[ Frontend: React UI ] 
       │ (User requests nearest hospitals or routes)
       ▼
[ Node.js Backend API: /api/hospitals/proximity ]
       │
       ▼
[ Native Bridge: nativeBridge.js ]
       │ (Executes binary via child_process)
       ▼
[ C++ Executable: routing.exe ]
       │ (Calculates Dijkstra / Haversine in ~2ms)
       ▼
[ JSON Output: { roadDistance, etaMins, path } ]
       │
       ▼
[ Dynamic Hospital Ranking & Leaflet Map Display ]
```

---

## 6. Time & Space Complexity

| Operation | Complexity | Description |
|---|---|---|
| **Time Complexity** | \(\mathcal{O}((V + E) \log V)\) | Using Min-Heap priority queue where \(V\) is nodes and \(E\) is edges. |
| **Space Complexity** | \(\mathcal{O}(V + E)\) | Memory used for the adjacency list and distance arrays. |
| **Execution Latency** | **~2.3 milliseconds** | High-performance C++ native binary execution speed. |
