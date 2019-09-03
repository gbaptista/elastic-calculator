<template>
  <div class="col-12 col-sm-12 col-md-6 col-lg-4">
    <div class="card card-node">
      <div class="card-header">
        <span
          v-if="!master"
          class="badge badge-info"
        >
          read: {{ readsForThisNodeLabel }} rpm
        </span>

        <span
          v-if="!master"
          class="badge badge-danger"
        >
          write: {{ writesForThisNodeLabel }} rpm
        </span>

        <span
          v-if="!master"
          class="badge badge-secondary"
        >
          ~ {{ docsForThisNodeLabel }} docs
        </span>
        <span
          v-if="master"
          class="badge badge-secondary"
        >
          no documents
        </span>
      </div>
      <div class="card-body">
        <div v-if="master">
          <div
            class="alert alert-info"
            role="alert"
          >
            A dedicated master node performs cluster management tasks,
            but does not hold data or respond to data upload requests.
            This offloading of cluster management tasks increases
            the stability of your domain.
          </div>
        </div>
        <div v-if="!master && shards == 0">
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
            :read-throughput="readThroughput"
            :replicas="replicas"
          />
        </div>
        <div v-if="shards > 0">
          <div v-if="replicas == 0">
            <div
              class="alert alert-warning"
              role="alert"
            >
              <span v-if="shards == 1">
                Shard has no replica.
              </span>
              <span v-if="shards > 1">
                Shards have no replicas.
              </span>
            </div>
          </div>
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
      <div class="card-footer text-white bg-secondary">
        {{ name }}
      </div>
    </div>
  </div>
</template>

<script>
import numerify from 'numerify';
import Shard from './Shard.vue';
import Replica from './Replica.vue';


export default {
  components: { Shard, Replica },
  props: {
    name: { type: String, required: true },
    nodeIndex: { type: Number, required: true },
    master: { type: Boolean, required: true },
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
    readsForThisNode() {
      const readsPerShardOrReplica = (
        this.readThroughput / (this.totalOfShards * (this.replicas + 1))
      );

      return Math.ceil(
        (this.shards + (this.shards * this.replicas)) * readsPerShardOrReplica,
      );
    },
    readsForThisNodeLabel() {
      return numerify(this.readsForThisNode, '0a');
    },
    writesForThisNode() {
      const writesPerShard = this.writeThroughput / this.totalOfShards;

      return Math.ceil(this.shards * writesPerShard);
    },
    writesForThisNodeLabel() {
      return numerify(this.writesForThisNode, '0a');
    },
    docsForThisNode() {
      const docsPerShard = this.documents / this.totalOfShards;

      return Math.ceil(this.shards * docsPerShard);
    },
    docsForThisNodeLabel() {
      return numerify(this.docsForThisNode, '0.0a');
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
