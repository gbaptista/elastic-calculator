<template>
  <div class="col-12">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">
          {{ name }}
        </h5>
        <div class="card-text">
          <div class="row">
            <node
              v-for="nodeIndex in nodes"
              :key="'node' + nodeIndex"
              :name="'node ' + nodeIndex"
              :clusters="nodes"
              :documents="documents"
              :nodes="nodes"
              :node-index="nodeIndex"
              :shards-per-node="shardsPerNode"
              :total-of-shards="shards"
              :read-throughput="readThroughput"
              :write-throughput="writeThroughput"
              :shards="shardsFor(nodeIndex)"
              :replicas="replicas"
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
    nodes: { type: Number, required: true },
    documents: { type: Number, required: true },
    shards: { type: Number, required: true },
    replicas: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
  },
  computed: {
    shardsPerNode() {
      const nodeShards = {};

      for (let node = 1; node <= this.nodes; node += 1) {
        nodeShards[node] = 0;
      }

      let pendingShards = this.shards;

      while (pendingShards > 0) {
        for (let node = 1; node <= this.nodes; node += 1) {
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
