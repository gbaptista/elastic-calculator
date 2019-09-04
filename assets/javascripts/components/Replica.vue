<template>
  <div class="col-12 col-sm-12 col-md-12 col-lg-6">
    <div class="card card-replica">
      <div class="card-header">
        {{ name }}
      </div>
      <div class="card-body">
        <span class="badge badge-pill badge-info">read: {{ readsForThisReplica }} rpm</span>
        <span class="badge badge-pill badge-light">~ {{ documentsInThisReplica }} docs</span>

        <span class="badge badge-pill badge-light">{{ bytesInThisReplica }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import numerify from 'numerify';

import numerifyBytes from 'numerify/lib/plugins/bytes.umd';

numerify.register('bytes', numerifyBytes);

export default {
  props: {
    name: { type: String, required: true },
    documents: { type: Number, required: true },
    replicas: { type: Array, required: true },
    readThroughput: { type: Number, required: true },
    totalOfShards: { type: Number, required: true },
    gbSize: { type: Number, required: true },
    totalOfReplicas: { type: Number, required: true },
  },
  computed: {
    documentsInThisReplica() {
      return numerify(Math.ceil(this.documents / this.totalOfShards), '0.0a');
    },
    bytesInThisReplica() {
      const gbPerShard = this.gbSize / this.totalOfShards;

      return numerify(gbPerShard * 1000 * 1000000, '0.0b');
    },
    readsForThisReplica() {
      return numerify(
        Math.ceil(
          this.readThroughput / ((this.totalOfShards * this.totalOfReplicas) + this.totalOfShards),
        ), '0.0a',
      );
    },
  },
};
</script>
