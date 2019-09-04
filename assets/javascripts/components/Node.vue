<template>
  <div class="col-12 col-sm-12 col-md-6 col-lg-4">
    <div class="card card-node">
      <div class="card-header text-white bg-secondary">
        {{ name }}
      </div>
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
          v-if="!master"
          class="badge badge-warning"
        >
          {{ bytesForThisNodeLabel }}
        </span>

        <span
          v-if="!master && shards.length > 0"
          class="badge badge-dark"
        >
          shards: {{ shards.length }}
        </span>

        <span
          v-if="!master && replicas.length > 0"
          class="badge badge-dark"
        >
          replicas: {{ replicas.length }}
        </span>

        <span
          v-if="!master"
          class="badge badge-dark"
        >
          {{ allBytesForThisNodeLabel }}
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
        <div v-if="!master && shards == 0 && replicas == 0">
          <div
            class="alert alert-danger"
            role="alert"
          >
            The node has not being used!
          </div>
        </div>
        <div class="row">
          <shard
            v-for="shard in shards"
            :key="shard['key']"
            :name="shard['name']"
            :clusters="clusters"
            :documents="documents"
            :nodes="nodes"
            :node-index="nodeIndex"
            :shards="shards"
            :total-of-shards="totalOfShards"
            :total-of-replicas="totalOfReplicas"
            :write-throughput="writeThroughput"
            :read-throughput="readThroughput"
            :gb-size="gbSize"
            :replicas="replicas"
          />
        </div>
        <div class="row">
          <replica
            v-for="replica in replicas"
            :key="replica['key']"
            :documents="documents"
            :total-of-shards="totalOfShards"
            :total-of-replicas="totalOfReplicas"
            :read-throughput="readThroughput"
            :replicas="replicas"
            :gb-size="gbSize"
            :name="replica['name']"
          />
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
import numerifyBytes from 'numerify/lib/plugins/bytes.umd';
import Shard from './Shard.vue';
import Replica from './Replica.vue';

numerify.register('bytes', numerifyBytes);

export default {
  components: { Shard, Replica },
  props: {
    name: { type: String, required: true },
    nodeIndex: { type: Number, required: true },
    master: { type: Boolean, required: true },
    clusters: { type: Number, required: true },
    documents: { type: Number, required: true },
    nodes: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
    totalOfReplicas: { type: Number, required: true },
    gbSize: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
    shardsAndReplicas: { type: Array, required: true },
    shardsAndReplicasPerNode: { type: Object, required: true },
  },
  computed: {
    shards() {
      return this.shardsAndReplicas.filter(item => item.kind === 'shard');
    },
    replicas() {
      return this.shardsAndReplicas.filter(item => item.kind === 'replica');
    },
    alreadyAllocatedShards() {
      let allocatedShards = 0;

      for (let node = 1; node <= (this.nodeIndex - 1); node += 1) {
        allocatedShards += this.shardsAndReplicasPerNode[node].filter(
          item => item.kind === 'shard',
        ).length;
      }

      return allocatedShards;
    },
    alreadyAllocatedReplicas() {
      let allocatedReplicas = 0;

      for (let node = 1; node <= (this.nodeIndex - 1); node += 1) {
        allocatedReplicas += this.shardsAndReplicasPerNode[node].filter(
          item => item.kind === 'replica',
        ).length;
      }

      return allocatedReplicas;
    },
    readsForThisNode() {
      const readsPerShardOrReplica = (
        this.readThroughput / ((this.totalOfShards * this.totalOfReplicas) + this.totalOfShards)
      );

      return (this.shards.length + this.replicas.length) * readsPerShardOrReplica;
    },
    readsForThisNodeLabel() {
      return numerify(this.readsForThisNode, '0.0a');
    },
    allBytesForThisNode() {
      const gbPerShard = this.gbSize / this.totalOfShards;

      return (this.shards.length + this.replicas.length) * gbPerShard * 1000 * 1000000;
    },
    bytesForThisNode() {
      const gbPerShard = this.gbSize / this.totalOfShards;

      return this.shards.length * gbPerShard * 1000 * 1000000;
    },
    writesForThisNode() {
      const writesPerShard = this.writeThroughput / this.totalOfShards;

      return this.shards.length * writesPerShard;
    },
    allBytesForThisNodeLabel() {
      return numerify(this.allBytesForThisNode, '0.0b');
    },
    bytesForThisNodeLabel() {
      return numerify(this.bytesForThisNode, '0.0b');
    },
    writesForThisNodeLabel() {
      return numerify(this.writesForThisNode, '0.0a');
    },
    docsForThisNode() {
      const docsPerShard = this.documents / this.totalOfShards;

      return this.shards.length * docsPerShard;
    },
    docsForThisNodeLabel() {
      return numerify(this.docsForThisNode, '0.0a');
    },
  },
  methods: {
    replicaNameFor(replicaIndex) {
      const computedReplicaIndex = this.alreadyAllocatedReplicas + replicaIndex;

      return `replica ${computedReplicaIndex}`;
    },
    shardNameFor(shardIndex) {
      const computedShardIndex = this.alreadyAllocatedShards + shardIndex;

      return `shard ${computedShardIndex}`;
    },
  },
};
</script>
