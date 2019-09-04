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

      const expectedAllocatedReplicas = this.shards * this.replicas;

      let currentAllocatedReplicas = 0;

      for (let n = 1; n <= Object.keys(this.shardsAndReplicasPerNode).length; n += 1) {
        currentAllocatedReplicas += this.shardsAndReplicasPerNode[n].filter(
          item => item.kind === 'replica',
        ).length;
      }

      return (this.nodes >= expectedNodes
        && currentAllocatedReplicas === expectedAllocatedReplicas);
    },
    shardsAndReplicasPerNode() {
      const nodeShardsAndReplicas = {};

      for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
        nodeShardsAndReplicas[node] = [];
      }

      let pendingShards = this.shards;
      let pendingReplicas = this.shards * this.replicas;

      const replicasToAttach = [];

      for (let shard = 1; shard <= this.shards; shard += 1) {
        for (let replica = 1; replica <= this.replicas; replica += 1) {
          replicasToAttach.push({
            key: `replica-${replica}-for-shard-${shard}`,
            name: `replica (shard ${shard})`,
            kind: 'replica',
            shard: `shard-${shard}`,
          });
        }
      }

      let maxTries = ((this.shards * this.replicas) + this.shards) * 10;

      while (maxTries > 0 && (pendingShards > 0 || pendingReplicas > 0)) {
        maxTries -= 1;

        for (let node = 1; node <= (this.nodes - this.deticatedNodes); node += 1) {
          if (pendingShards > 0) {
            nodeShardsAndReplicas[node].push({
              key: `shard-${this.shards - pendingShards + 1}`,
              name: `shard ${this.shards - pendingShards + 1}`,
              kind: 'shard',
              shard: `shard-${this.shards - pendingShards + 1}`,
            });
            pendingShards -= 1;
          } else if (pendingReplicas > 0) {
            for (let r = 0; r < replicasToAttach.length; r += 1) {
              const replicaToAllocate = replicasToAttach[r];

              if (this.canAllocateReplica(
                nodeShardsAndReplicas[node], replicaToAllocate,
              )) {
                nodeShardsAndReplicas[node].push(replicaToAllocate);

                replicasToAttach.splice(r, 1);

                pendingReplicas -= 1;

                break;
              }
            }
          } else {
            break;
          }
        }
      }

      return nodeShardsAndReplicas;
    },
  },
  methods: {
    canAllocateReplica(currentShards, newReplica) {
      for (let s = 0; s < currentShards.length; s += 1) {
        if (currentShards[s].shard === newReplica.shard) {
          return false;
        }
      }

      for (let s = 0; s < currentShards.length; s += 1) {
        if (currentShards[s].key === newReplica.key) {
          return false;
        }
      }

      return true;
    },
    shardsAndReplicasFor(nodeIndex) {
      if (this.shardsAndReplicasPerNode[nodeIndex] === undefined) {
        return [];
      }

      return this.shardsAndReplicasPerNode[nodeIndex];
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
