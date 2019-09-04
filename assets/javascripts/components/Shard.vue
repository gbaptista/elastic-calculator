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

        <span class="badge badge-pill badge-warning">{{ bytesInThisShard }}</span>

        <div
          v-if="sizeWarning == 'high-danger'"
          class="alert alert-danger"
          role="alert"
        >
          More than 32GB, not a good idea.
        </div>

        <div
          v-if="sizeWarning == 'high-warning'"
          class="alert alert-warning"
          role="alert"
        >
          More than 28GB, not a good idea.
        </div>

        <div
          v-if="sizeWarning == 'low-warning'"
          class="alert alert-warning"
          role="alert"
        >
          Less than 13GB, unnecessary.
        </div>

        <div
          v-if="sizeWarning == 'low-danger'"
          class="alert alert-danger"
          role="alert"
        >
          Less than 8GB, unnecessary.
        </div>
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
    clusters: { type: Number, required: true },
    nodes: { type: Number, required: true },
    documents: { type: Number, required: true },
    shards: { type: Array, required: true },
    totalOfShards: { type: Number, required: true },
    totalOfReplicas: { type: Number, required: true },
    replicas: { type: Array, required: true },
    gbSize: { type: Number, required: true },
    readThroughput: { type: Number, required: true },
    writeThroughput: { type: Number, required: true },
  },
  computed: {
    sizeWarning() {
      const gbPerShard = this.gbSize / this.totalOfShards;

      if (gbPerShard > 32) {
        return 'high-danger';
      } if (gbPerShard > 28) {
        return 'high-warning';
      } if (this.totalOfShards < 2) {
        return '';
      } if (gbPerShard < 8) {
        return 'low-danger';
      } if (gbPerShard < 13) {
        return 'low-warning';
      }

      return '';
    },
    bytesInThisShard() {
      const gbPerShard = this.gbSize / this.totalOfShards;

      return numerify(gbPerShard * 1000 * 1000000, '0.0b');
    },
    documentsInThisShards() {
      return numerify(this.documents / this.totalOfShards, '0.0a');
    },
    readsForThisShard() {
      return numerify(
        Math.ceil(this.readThroughput / ((this.totalOfShards * this.totalOfReplicas) + this.totalOfShards)), '0.0a',
      );
    },
    writesForThisShard() {
      return numerify(Math.ceil(this.writeThroughput / this.totalOfShards), '0.0a');
    },
  },
};
</script>
