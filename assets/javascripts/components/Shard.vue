<template>
  <div class="col-12">
    <div class="card card-shard">
      <div class="card-header">
        {{ name }}
      </div>
      <div class="card-body">
        <span class="badge badge-pill badge-info">read: {{ readsForThisShard }} rpm</span>
        <span class="badge badge-pill badge-danger">write: {{ writesForThisShard }} rpm</span>
        <span class="badge badge-pill badge-secondary">~ {{ documentsInThisShards }} docs</span>
      </div>
    </div>
  </div>
</template>

<script>
import numerify from 'numerify';

export default {
  props: {
    name: { type: String, required: true },
    clusters: { type: Number, required: true },
    nodes: { type: Number, required: true },
    documents: { type: Number, required: true },
    shards: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
    replicas: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
  },
  computed: {
    documentsInThisShards() {
      return numerify(Math.ceil(this.documents / this.totalOfShards), '0.0a');
    },
    readsForThisShard() {
      return numerify(
        Math.ceil(this.readThroughput / (this.totalOfShards * (this.replicas + 1))), '0a',
      );
    },
    writesForThisShard() {
      return numerify(Math.ceil(this.writeThroughput / this.totalOfShards), '0a');
    },
  },
};
</script>
