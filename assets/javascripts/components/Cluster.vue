<template>
  <div class="col-12">
    <div class="card card-cluster">
      <div class="card-header text-white bg-dark">
        {{ name }}
      </div>
      <div class="card-body">
        <div v-if="!hasExpectedNodes">
          <div
            class="alert alert-danger"
            role="alert"
          >
            The cluster needs more nodes!
          </div>
        </div>

        <div v-if="hasExpectedNodes && shards == 0">
          <div
            class="alert alert-danger"
            role="alert"
          >
            The cluster needs at least one shard.
          </div>
        </div>

        <div v-if="hasExpectedNodes && shards > 0">
          <div v-if="nodes == 0">
            <div
              class="alert alert-danger"
              role="alert"
            >
              The cluster has not being used!
            </div>
          </div>
          <div class="row">
            <node
              v-for="nodeIndex in (nodes - deticatedNodes)"
              :key="'node' + nodeIndex"
              :name="'node ' + nodeIndex"
              :clusters="nodes"
              :documents="documents"
              :nodes="nodes"
              :master="false"
              :node-index="nodeIndex"
              :total-of-shards="shards"
              :total-of-replicas="replicas"
              :gb-size="gbSize"
              :read-throughput="readThroughput"
              :write-throughput="writeThroughput"
              :shards-and-replicas="shardsAndReplicasFor(nodeIndex)"
              :shards-and-replicas-per-node="shardsAndReplicasPerNode"
            />
            <node
              v-for="nodeIndex in deticatedNodes"
              :key="'master-node' + nodeIndex"
              :name="'node ' + ((nodes - deticatedNodes) + nodeIndex) + ' (dedicated master)'"
              :clusters="0"
              :documents="0"
              :nodes="0"
              :master="true"
              :node-index="nodeIndex"
              :total-of-shards="0"
              :total-of-replicas="0"
              :read-throughput="0"
              :gb-size="gbSize"
              :write-throughput="0"
              :shards="0"
              :shards-and-replicas="shardsAndReplicasFor((nodes - deticatedNodes) + nodeIndex)"
              :shards-and-replicas-per-node="shardsAndReplicasPerNode"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Node from './Node.vue';

export default {
  components: { Node },
  props: {
    name: { type: String, required: true },
    clusters: { type: Number, required: true },
    deticatedNodes: { type: Number, required: true },
    nodes: { type: Number, required: true },
    documents: { type: Number, required: true },
    shards: { type: Number, required: true },
    gbSize: { type: Number, required: true },
    replicas: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
  },
  computed: {
    hasExpectedNodes() {
      let expectedNodes = this.deticatedNodes;

      if (this.shards > 0) {
        expectedNodes += 1;
      }

      return this.nodes >= expectedNodes;
    },
    replicasPerNode() {
      const nodeReplicas = {};

      for (let node = 1; node <= this.nodes; node += 1) {
        nodeReplicas[node] = 0;
      }

      let pendingReplicas = this.shards * this.replicas;

      while (pendingReplicas > 0) {
        for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
          nodeReplicas[node] += 1;
          pendingReplicas -= 1;

          if (pendingReplicas === 0) break;
        }
      }

      return nodeReplicas;
    },
    shardsAndReplicasPerNode() {
      const nodeShardsAndReplicas = {};

      for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
        nodeShardsAndReplicas[node] = [];
      }

      let pendingShards = this.shards;
      let pendingReplicas = this.shards * this.replicas;

      while (pendingShards > 0 || pendingReplicas > 0) {
        for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
          if (pendingShards > 0) {
            nodeShardsAndReplicas[node].push({ kind: 'shard' });
            pendingShards -= 1;
          } else if (pendingReplicas > 0) {
            nodeShardsAndReplicas[node].push({ kind: 'replica' });
            pendingReplicas -= 1;
          } else {
            break;
          }
        }
      }

      return nodeShardsAndReplicas;
    },
    shardsPerNode() {
      const nodeShards = {};

      for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
        nodeShards[node] = 0;
      }

      let pendingShards = this.shards;

      while (pendingShards > 0) {
        for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
          nodeShards[node] += 1;
          pendingShards -= 1;

          if (pendingShards === 0) break;
        }
      }

      return nodeShards;
    },
  },
  methods: {
    shardsFor(nodeIndex) {
      return this.shardsPerNode[nodeIndex];
    },
    shardsAndReplicasFor(nodeIndex) {
      if (this.shardsAndReplicasPerNode[nodeIndex] === undefined) {
        return [];
      }

      return this.shardsAndReplicasPerNode[nodeIndex];
    },
    replicasFor(nodeIndex) {
      return this.replicasPerNode[nodeIndex];
    },
    safeInt(value) {
      const intValue = parseInt(value, 10);

      if (Number.isNaN(intValue) || intValue < 0) {
        return 0;
      }

      return intValue;
    },
  },
};
</script>
