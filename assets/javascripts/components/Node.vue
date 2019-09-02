<template>
  <div class="col-4">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">
          {{ name }}
        </h5>
        <div class="card-text">
          <div v-if="shards == 0">
            <div
              class="alert alert-danger"
              role="alert"
            >
              The node has not being used!
            </div>
          </div>
          <div class="row">
            <shard
              v-for="shardIndex in shards"
              :key="'shard' + shardIndex"
              :name="shardNameFor(shardIndex)"
              :clusters="clusters"
              :documents="documents"
              :nodes="nodes"
              :node-index="nodeIndex"
              :shards="shards"
              :total-of-shards="totalOfShards"
              :write-throughput="writeThroughput"
              :replicas="replicas"
            />
          </div>
          <div v-if="shards > 0">
            <div class="row">
              <replica
                v-for="replicaIndex in (replicas * shards)"
                :key="'replica' + replicaIndex"
                :documents="documents"
                :total-of-shards="totalOfShards"
                :read-throughput="readThroughput"
                :replicas="replicas"
                :name="replicaNameFor(replicaIndex)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Shard from './Shard.vue';
import Replica from './Replica.vue';

export default {
  components: { Shard, Replica },
  props: {
    name: { type: String, required: true },
    nodeIndex: { type: Number, required: true },
    shardsPerNode: { type: Object, required: true },
    clusters: { type: Number, required: true },
    documents: { type: Number, required: true },
    nodes: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
    shards: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
    replicas: { type: Number, required: true },
  },
  computed: {
    alreadyAllocatedShards() {
      let allocatedShards = 0;

      for (let node = 1; node <= (this.nodeIndex - 1); node += 1) {
        allocatedShards += this.shardsPerNode[node];
      }

      return allocatedShards;
    },
  },
  methods: {
    replicaNameFor(shardIndex) {
      const computedShardIndex = (this.alreadyAllocatedShards * this.replicas) + shardIndex;

      return `replica ${computedShardIndex}`;
    },
    shardNameFor(shardIndex) {
      const computedShardIndex = this.alreadyAllocatedShards + shardIndex;

      return `shard ${computedShardIndex}`;
    },
  },
};
</script>
